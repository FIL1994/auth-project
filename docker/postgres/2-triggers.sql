CREATE OR REPLACE FUNCTION notify_event() RETURNS TRIGGER AS $$
    DECLARE
        record RECORD;
        payload JSON;
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            record = OLD;
        ELSE
            record = NEW;
        END IF;

        payload = json_build_object(
            'table', TG_TABLE_NAME,
            'action', TG_OP,
            'data', row_to_json(record)::jsonb - 'password' - 'id'
        );

        PERFORM pg_notify('events', payload::text);

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_user_event
    AFTER INSERT OR UPDATE OR DELETE ON app_user
    FOR EACH ROW EXECUTE PROCEDURE notify_event();

INSERT INTO app_user (email, password, name) VALUES ('test', 'pass', 'name');

