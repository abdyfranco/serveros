class StateHelper
  @@state = {}

  def self.[](key)
    @@state[key]
  end

  def self.[]=(key, value)
    @@state[key] = value
  end

end
