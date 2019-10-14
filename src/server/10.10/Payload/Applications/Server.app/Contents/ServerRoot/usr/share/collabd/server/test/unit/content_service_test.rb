require 'set'

require File.expand_path(File.join(File.dirname(__FILE__), "..", "test_helper"))
require File.expand_path(File.join(File.dirname(__FILE__), "..", "state_helper"))
require File.expand_path(File.join(File.dirname(__FILE__), "session_test"))

class ContentServiceTest < SessionTest

  def first_time_content_setup
    StateHelper['entity_guids'] = []
    StateHelper['page_entity_guids'] = []
    StateHelper['container_block_entity_guids'] = []
    StateHelper['content_initialized'] = true
  end

  def setup
    super
    unless StateHelper['content_initialized']
      first_time_content_setup()
    end
  end

  def test_01_ping
    assert_not_nil(StateHelper['service'].execute('ContentService', 'ping'))
  end

  def test_02_create_empty_page
    e = Collaboration::PageEntity.new
    e2 = StateHelper['service'].execute('ContentService', 'createEntity:', e)
    assert_not_nil(e2)
    assert_not_nil(e2.guid)
    StateHelper['entity_guids'] << e2.guid
    StateHelper['page_entity_guids'] << e2.guid
  end

  def test_02_create_titled_page
    e = Collaboration::PageEntity.new
    e.longName = 'New page'
    e2 = StateHelper['service'].execute('ContentService', 'createEntity:', e)
    assert_not_nil(e2)
    assert_not_nil(e2.guid)
    StateHelper['entity_guids'] << e2.guid
    StateHelper['page_entity_guids'] << e2.guid
  end

  def test_02b_create_full_page
    tags = ['a', 'b', 'c']
    e = Collaboration::PageEntity.new
    e.longName = 'Full page'
    e.tags = tags
    e2 = StateHelper['service'].execute('ContentService', 'createEntity:', e)
    assert_not_nil(e2)
    assert_not_nil(e2.guid)
    assert_equal(tags.sort, e2.tags.sort)
    StateHelper['entity_guids'] << e2.guid
    StateHelper['page_entity_guids'] << e2.guid
  end

  def test_03_fetch_entities
    ents = StateHelper['entity_guids'].collect {|x|
      StateHelper['service'].execute('ContentService', 'entityForGUID:', x)
    }
    assert(!ents.include?(nil))
    ent_guids = ents.collect {|x| x.guid }
    assert_equal(ent_guids.sort, StateHelper['entity_guids'].sort)
  end

  def test_04_update_entities
    StateHelper['entity_guids'].each { |x|
      ent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)

      ent.extendedAttributes['_test_text_'] = 'adjklfafjklafsd'
      ent.extendedAttributes['_test_obj_'] = {'a' => 42 }
      ent.description = 'Updated by test'

      cs = Collaboration::EntityChangeSet.new
      cs.changeAction = 'UPDATE'
      cs.entityGUID = ent.guid
      cs.entityRevision = ent.revision
      cs.entityType = ent.type
      cs.changeComment = 'Updating entity ' + ent.guid + ' in unit test'
      cs.changes = [
        [ 'extendedAttributes', ent.extendedAttributes, nil ],
        [ 'description', ent.description, nil ],
      ]

      StateHelper['service'].execute('ContentService', 'updateEntity:', cs)
    }
  end

  def test_05_find_page_entities
    pents = StateHelper['service'].execute('ContentService', 'entitiesForType:', 'com.apple.entity.Page')
    pent_guids = pents.collect {|ent| ent.guid }
    page_ent_guids = StateHelper['page_entity_guids']
    assert(page_ent_guids.to_set.subset?(pent_guids.to_set))
  end

  def test_06_add_blocks_to_page_entities
    StateHelper['page_entity_guids'].dup.each { |x|
      pent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)

      (1..2).each {|n|
        block = Collaboration::BlockEntity.new
        block.blockType = 'text'
        block.description = 'Block #' + n.to_s + ' of page ' + pent.guid
        block.extendedAttributes['tagName'] = 'p'
        block.extendedAttributes['content'] = 'Block #' + n.to_s + ' of page ' + pent.guid
        block = StateHelper['service'].execute('ContentService', 'createEntity:', block)
        assert_not_nil(block)
        assert_not_nil(block.guid)

        pent.blockGUIDs ||= []
        pent.blockGUIDs << block.guid
        StateHelper['entity_guids'] << block.guid
      }

      cs = Collaboration::EntityChangeSet.new
      cs.changeAction = 'UPDATE'
      cs.entityGUID = pent.guid
      cs.entityRevision = pent.revision
      cs.entityType = pent.type
      cs.changeComment = 'Updating page.blockGUIDs ' + pent.guid + ' in unit test'
      cs.changes = [
        [ 'blockGUIDs', pent.blockGUIDs, nil ],
      ]
      StateHelper['service'].execute('ContentService', 'updateEntity:', cs)
    }
  end

  def test_06b_add_blocks_to_block_entities
    # Add some container blocks.
    StateHelper['page_entity_guids'].dup.each { |x|
      pent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)

      (1..2).each {|n|
        block = Collaboration::BlockEntity.new
        block.blockType = 'container'
        block.description = 'Container block #' + n.to_s + ' of page ' + pent.guid
        block = StateHelper['service'].execute('ContentService', 'createEntity:', block)
        assert_not_nil(block)
        assert_not_nil(block.guid)

        pent.blockGUIDs ||= []
        pent.blockGUIDs << block.guid
        StateHelper['container_block_entity_guids'] << block.guid
	StateHelper['entity_guids'] << block.guid
      }

    }

    # Add some nested blocks.
    StateHelper['container_block_entity_guids'].dup.each { |x|
      pent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)

      (1..2).each {|n|
        block = Collaboration::BlockEntity.new
        block.blockType = 'text'
        block.description = 'Block #' + n.to_s + ' of block ' + pent.guid
        block.extendedAttributes['tagName'] = 'p'
        block.extendedAttributes['content'] = 'Block #' + n.to_s + ' of block ' + pent.guid
        block = StateHelper['service'].execute('ContentService', 'createEntity:', block)
        assert_not_nil(block)
        assert_not_nil(block.guid)

        pent.blockGUIDs ||= []
        pent.blockGUIDs << block.guid
        StateHelper['entity_guids'] << block.guid
      }
      
      cs = Collaboration::EntityChangeSet.new
      cs.changeAction = 'UPDATE'
      cs.entityGUID = pent.guid
      cs.entityRevision = pent.revision
      cs.entityType = pent.type
      cs.changeComment = 'Updating block.blockGUIDs ' + pent.guid + ' in unit test'
      cs.changes = [
        [ 'blockGUIDs', pent.blockGUIDs, nil ],
      ]
      StateHelper['service'].execute('ContentService', 'updateEntity:', cs)

    }

    # Did the nested blocks get added correctly?
    StateHelper['container_block_entity_guids'].dup.each { |x|
      pent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)
      assert_equal(pent.blockGUIDs.length, 2)
    }
  end

  def test_07_find_document_entities
    doc_entities = StateHelper['service'].execute('ContentService', 'entitiesForType:', 'com.apple.entity.Document')
    doc_ent_guids = doc_entities.collect {|ent| ent.guid }
    page_ent_guids = StateHelper['page_entity_guids']
    assert(doc_ent_guids.to_set.superset?(page_ent_guids.to_set))
  end

  def test_08_update_entity_tags
    new_tags = ['a', 'b', 'd', 'e']
    StateHelper['entity_guids'].each { |x|
      ent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)

      cs = Collaboration::EntityChangeSet.new
      cs.changeAction = 'UPDATE'
      cs.entityGUID = ent.guid
      cs.entityRevision = ent.revision
      cs.entityType = ent.type
      cs.changeComment = 'Updating tags in unit test'
      cs.changes = [
        [ 'tags', new_tags, nil ],
      ]
      e2 = StateHelper['service'].execute('ContentService', 'updateEntity:', cs)
      assert_equal(e2.tags.sort, new_tags.sort)
    }
  end

  def test_09_find_entities_by_tag
    ents = StateHelper['service'].execute('ContentService', 'entitiesForTags:', ['a', 'b'])
    ent_guids = ents.collect {|x| x.guid }
    assert_equal(ent_guids.sort, StateHelper['entity_guids'].sort)
  end

  def test_10_create_solo_entity
    tags = ['solo']
    e = Collaboration::PageEntity.new
    e.tags = tags
    e2 = StateHelper['service'].execute('ContentService', 'createEntity:', e)
    assert_not_nil(e2)
    assert_not_nil(e2.guid)
    assert_equal(e2.tags.sort, tags.sort)
    StateHelper['solo_entity_guid'] = e2.guid
    StateHelper['entity_guids'] << e2.guid
    StateHelper['page_entity_guids'] << e2.guid
  end

  def test_11_find_solo_entity_by_tag
    ents = StateHelper['service'].execute('ContentService', 'entitiesForTags:', ['solo'])
    ent_guids = ents.collect {|x| x.guid }
    assert(ent_guids.to_set.superset?([StateHelper['solo_entity_guid']].to_set))
  end

  def test_99_delete_entities
    StateHelper['entity_guids'].each { |x|
      ent = StateHelper['service'].execute('ContentService', 'entityForGUID:', x)

      cs = Collaboration::EntityChangeSet.new
      cs.changeAction = 'UPDATE'
      cs.entityGUID = ent.guid
      cs.entityRevision = ent.revision
      cs.entityType = ent.type
      cs.changeComment = 'Deleting page ' + ent.guid + ' in unit test'
      cs.changes = [
        [ 'isPermanentlyDeleted', true, nil ],
      ]
      resp = StateHelper['service'].execute('ContentService', 'updateEntity:', cs)
      assert_kind_of(Collaboration::EntityPlaceholder, resp)
    }
  end

end
