select count(*) > 0 from bot_entity inner join subscription on (bot_entity.entity_uid_fk=subscription.entity_uid_fk);
