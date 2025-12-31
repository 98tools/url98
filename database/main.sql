CREATE TABLE IF NOT EXISTS domains (
	id text PRIMARY KEY NOT NULL,
	domain_name text NOT NULL UNIQUE, /* every domain is stored only once */
	created_at integer NOT NULL,
	updated_at integer NOT NULL
);

CREATE TABLE IF NOT EXISTS urls (
	id text PRIMARY KEY NOT NULL,
	created_at integer NOT NULL,
	updated_at integer NOT NULL,
    user_id text NOT NULL,
    domain_id text NOT NULL,
	url text NOT NULL,
	title text NOT NULL,
	keyword text NOT NULL,
	description text NOT NULL,
	clicks integer DEFAULT 0 NOT NULL,
	ip_address text,
	active integer DEFAULT 1 NOT NULL,
    options text,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS logs (
	id text PRIMARY KEY NOT NULL,
	url_id text NOT NULL,
	timestamp integer NOT NULL,
	ip_address text,
	user_agent text,
	referrer text,
	country_code text,
	country text,
	city text,
	region text,
	FOREIGN KEY (url_id) REFERENCES urls(id) ON UPDATE no action ON DELETE no action
);

CREATE TRIGGER IF NOT EXISTS update_url_clicks
	AFTER INSERT ON logs
	BEGIN
		UPDATE urls SET clicks = clicks + 1 WHERE id = NEW.url_id;
	END;