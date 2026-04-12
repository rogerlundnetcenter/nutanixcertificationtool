-- FTS5 Virtual Table for Full-Text Search
CREATE VIRTUAL TABLE IF NOT EXISTS QuestionSearch USING fts5(
    Stem,
    Explanation,
    content='Questions',
    content_rowid='Id'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS QuestionSearch_ai AFTER INSERT ON Questions BEGIN
    INSERT INTO QuestionSearch (rowid, Stem, Explanation)
    VALUES (new.Id, new.Stem, new.Explanation);
END;

CREATE TRIGGER IF NOT EXISTS QuestionSearch_ad AFTER DELETE ON Questions BEGIN
    INSERT INTO QuestionSearch (QuestionSearch, rowid, Stem, Explanation)
    VALUES ('delete', old.Id, old.Stem, old.Explanation);
END;

CREATE TRIGGER IF NOT EXISTS QuestionSearch_au AFTER UPDATE ON Questions BEGIN
    INSERT INTO QuestionSearch (QuestionSearch, rowid, Stem, Explanation)
    VALUES ('delete', old.Id, old.Stem, old.Explanation);
    INSERT INTO QuestionSearch (rowid, Stem, Explanation)
    VALUES (new.Id, new.Stem, new.Explanation);
END;
