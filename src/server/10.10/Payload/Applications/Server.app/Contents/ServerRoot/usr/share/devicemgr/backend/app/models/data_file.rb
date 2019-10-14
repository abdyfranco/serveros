#-------------------------------------------------------------------------
# Copyright (c) 2015 Apple Inc. All Rights Reserved.
#
# IMPORTANT NOTE: This file is licensed only for use on Apple-branded
# computers and is subject to the terms and conditions of the Apple Software
# License Agreement accompanying the package this file is a part of.
# You may not port this file to another platform without Apple's written consent.
#-------------------------------------------------------------------------

class DataFile < ActiveRecord::Base

  # belongs_to :knob_set                # ITFK - knob_set_id
  # belongs_to :enterprise_app  # ITFK - enterprise_app_id
  # belongs_to :provisioning_profile    # ITFK - provisioning_profile_id
  # serialize :metadata, Hash           # Will get stored in dynamic_attributes on assets_metadata

  OwnerClassToRelation = {'CertificateKnobSet'    => :knob_set,         # We only support being owned by a KnobSet for now
                          'ExchangeKnobSet'       => :knob_set,
                          'WebClipKnobSet'        => :knob_set,
                         }
  
  #-------------------------------------------------------------------------

  def self.table_name
    return "data_files"
  end

  #-------------------------------------------------------------------------

  def self.save(upload)
    file_data = upload.read

    file = DataFile.new
    file.uuid = UUID.new.generate
    file.name = upload.original_filename

    path = file.path
    begin
      File.open(path, "wb") { |f| f.write(file_data) }
      file.size_in_kb = file.size / 1000
      file.save
    rescue Exception => e
      Rails.logger.error("Exception '#{e.message}' saving file at '#{path}'")
      File.delete(path) if File.exists?(path)
      raise
    end
    return file
  end

  #-------------------------------------------------------------------------

  # This method is duplicated in EnterpriseApp because ActiveRecord is lame about inheritance.
  # It should be a method on a subclass "Assets" (DataFile < Assets)
  def delete
    # Delete the file only if we're successful in committing the delete
    path = self.path  # Save path before we delete the object
    MDMUtilities.on_commit {
      begin
        if File.exists?(path)
          Rails.logger.info("Delete DataFile '#{path}'")
          File.delete(path)
        end
      rescue Exception => e
        Rails.logger.warn("Failed to remove DataFile at '#{path}' (#{e.message})")
      end
    }
    super
  end

  #-------------------------------------------------------------------------

  def metadata
    return AssetMetadata.find_by_id(self.id).metadata
  end

  #-------------------------------------------------------------------------

  def metadata=(m)
    am = AssetMetadata.find_by_id(self.id)
    am.metadata = m
    am.save
    self.metadata_last_updated = Time.now.getgm
    # Caller will call self.save
  end

  #-------------------------------------------------------------------------

  def modify_attributes(attr_hash, extended = false)
    attr_hash[:path]     = self.path     # For backwards compatibilty
    attr_hash[:metadata] = self.metadata

    # Determine the class of knob_set that owns this DataFile.
    sql = <<-SQL
      SELECT class_name, id
      FROM   "#{KnobSet.table_name}"
      WHERE  id IN (SELECT knob_set_id FROM knob_sets_assets WHERE asset_id = #{self.id} LIMIT 1)
    SQL
    res = self.connection.execute(sql)
    if res.ntuples == 1
      attr_hash[:owner_class] = res.getvalue(0,0)           # class_name
      attr_hash[:owher_id]    = Integer(res.getvalue(0,1))  # knob_set.id
    end

    return attr_hash
  end

  #-------------------------------------------------------------------------
  
  def owner
    # We only support being owned by a KnobSet for now
    sql = <<-SQL
      SELECT *
      FROM   "#{KnobSet.table_name}"
      WHERE  id IN (SELECT knob_set_id FROM knob_sets_assets WHERE asset_id = #{self.id})
    SQL
    return KnobSet.find_one_by_sql(sql)
  end

  #-------------------------------------------------------------------------

  def owner=(owner)
    # We only support being owned by a KnobSet for now
    if owner
      cls = owner.class.to_s
      raise "#{self.class}#owner=: Attempt to set owner to object of unsupported class #{cls}" unless OwnerClassToRelation[cls]

      # There can only be one data file per knob set, so update the join table if we don't have the desired row.
      sql = <<-SQL
        WITH del AS (
          DELETE FROM knob_sets_assets
          WHERE       (asset_id = #{self.id} OR knob_set_id = #{owner.id})
            AND       EXISTS (SELECT 1
                              FROM   knob_sets_assets
                              WHERE  (asset_id =  #{self.id} AND knob_set_id <> #{owner.id})  -- Where this asset is assigned to a different knob set
                                 OR  (asset_id <> #{self.id} AND knob_set_id =  #{owner.id})  -- Where this knob set has a different asset
                             )
          RETURNING 1
        )
        INSERT INTO knob_sets_assets
                   (knob_set_id, asset_id)
        SELECT      #{owner.id},#{self.id}
        WHERE     EXISTS (SELECT 1 FROM del)    -- This "EXISTS" when we deleted any rows that weren't what we wanted
           OR NOT EXISTS (SELECT 1 FROM knob_sets_assets WHERE knob_set_id = #{owner.id} AND asset_id = #{self.id})
      SQL
    else
      sql = "DELETE FROM knob_sets_assets WHERE asset_id = #{self.id}"  # Just remove any existing association
    end
      self.connection.execute(sql)
  end
  
  #-------------------------------------------------------------------------

  # This method is duplicated in EnterpriseApp because ActiveRecord is lame about inheritance.
  # It should be a method on a subclass "Assets" (DataFile < Assets)
  def path
    return File.join(PM_FILE_STORE_DIR, self.uuid)  # Where the file should be
  end

  #-------------------------------------------------------------------------
  
  def read
    return File.read(self.path)
  end
  
  #-------------------------------------------------------------------------

  def read_as_base64
    return Base64.encode64(self.read)
  end
  
  #-------------------------------------------------------------------------

  def size
    begin
      return File.stat(self.path).size
    rescue Exception => e
      Rails.logger.error("Exception '#{e.message}' trying to stat file '#{self.path}'")
      return 0
    end
  end

  #-------------------------------------------------------------------------

  def set_contents_from_file(path)
    FileUtils.mv(path, self.path)
    self.size_in_kb = self.size / 1000
    self.save
  end

  #-------------------------------------------------------------------------

  include MDMRecordBase
  
end
