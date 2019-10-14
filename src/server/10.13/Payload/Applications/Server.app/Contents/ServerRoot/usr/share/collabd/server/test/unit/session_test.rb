require File.expand_path(File.join(File.dirname(__FILE__), "..", "test_helper"))
require File.expand_path(File.join(File.dirname(__FILE__), "..", "state_helper"))

class SessionTest < Test::Unit::TestCase

  def first_time_session_setup
    svc = Collaboration::ServiceClient.new
    session = svc.execute('AuthService', 'currentOrNewSession')
    svc.session_guid = session.guid

    StateHelper['service'] = svc
    StateHelper['session'] = session
    StateHelper['session_initialized'] = true
  end

  def setup
    unless StateHelper['session_initialized']
      first_time_session_setup()
    end
  end

  def test_session_service_returns_a_session
    assert_instance_of(Collaboration::Session, StateHelper['session'])
  end

  def test_session_contains_a_user
    assert_instance_of(Collaboration::UserEntity, StateHelper['session'].user)
  end

end
