# This monkey patch is to avoid Denial of Service vulnerability in the JSON gem
module JSON 
  class << self 
    alias :old_parse :parse 
    def parse(json, args = {}) 
      args[:create_additions] = false 
      old_parse(json, args) 
    end 
  end 
end 