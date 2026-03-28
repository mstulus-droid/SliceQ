CREATE TABLE IF NOT EXISTS surahs (
  id INTEGER PRIMARY KEY,
  name_arabic TEXT NOT NULL,
  name_latin TEXT NOT NULL,
  meaning TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '',
  verse_count INTEGER NOT NULL CHECK (verse_count >= 0),
  revelation_order INTEGER NOT NULL DEFAULT 0 CHECK (revelation_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE surahs
ADD COLUMN IF NOT EXISTS context TEXT NOT NULL DEFAULT '';

ALTER TABLE surahs
ADD COLUMN IF NOT EXISTS revelation_order INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS verses (
  id BIGSERIAL PRIMARY KEY,
  surah_id INTEGER NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
  ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
  surah_name_arabic TEXT NOT NULL,
  surah_name_indonesian TEXT NOT NULL,
  revelation_place TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  translation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (surah_id, ayah_number)
);

CREATE TABLE IF NOT EXISTS verse_analyses (
  verse_id BIGINT PRIMARY KEY REFERENCES verses(id) ON DELETE CASCADE,
  topic TEXT NOT NULL DEFAULT '',
  critique TEXT NOT NULL DEFAULT '',
  asbabun_nuzul TEXT NOT NULL DEFAULT '',
  logical_fallacies TEXT NOT NULL DEFAULT '',
  moral_concerns TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGSERIAL PRIMARY KEY,
  verse_id BIGINT NOT NULL UNIQUE REFERENCES verses(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verses_surah_id ON verses(surah_id);
CREATE INDEX IF NOT EXISTS idx_verses_revelation_place ON verses(revelation_place);
CREATE INDEX IF NOT EXISTS idx_verse_analyses_topic ON verse_analyses USING GIN (to_tsvector('simple', topic));
CREATE INDEX IF NOT EXISTS idx_verse_analyses_critique ON verse_analyses USING GIN (to_tsvector('simple', critique));
CREATE INDEX IF NOT EXISTS idx_verses_translation ON verses USING GIN (to_tsvector('simple', translation));
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
