CREATE TABLE IF NOT EXISTS kv_store_a8f4bfaf ( key TEXT NOT NULL PRIMARY KEY, value JSONB NOT NULL );
ALTER TABLE kv_store_a8f4bfaf ENABLE ROW LEVEL SECURITY;
CREATE INDEX ON kv_store_a8f4bfaf (key text_pattern_ops);
