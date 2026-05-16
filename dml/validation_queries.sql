-- ============================================================
-- DML Validation Queries — Real-Time Chat Application
-- Student: Hamad Tahir | Course: Database Lab | Milestone 5
-- Run each section and take a screenshot of the output.
-- ============================================================

USE chat_app;

-- ── LOAD DATA (run after CSV files are in a MySQL-accessible path)
-- Adjust the file path to match where your CSV files are saved.
-- ---------------------------------------------------------------
LOAD DATA INFILE '/path/to/data/users.csv'
INTO TABLE Users
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/path/to/data/chats.csv'
INTO TABLE Chats
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/path/to/data/chat_members.csv'
INTO TABLE Chat_Members
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/path/to/data/messages.csv'
INTO TABLE Messages
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/path/to/data/message_status.csv'
INTO TABLE Message_Status
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/path/to/data/files.csv'
INTO TABLE Files
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;


-- ── SECTION 1: Row counts per table ──────────────────────────────
SELECT 'Users'          AS table_name, COUNT(*) AS row_count FROM Users
UNION ALL
SELECT 'Chats',                        COUNT(*)              FROM Chats
UNION ALL
SELECT 'Chat_Members',                 COUNT(*)              FROM Chat_Members
UNION ALL
SELECT 'Messages',                     COUNT(*)              FROM Messages
UNION ALL
SELECT 'Message_Status',               COUNT(*)              FROM Message_Status
UNION ALL
SELECT 'Files',                        COUNT(*)              FROM Files;


-- ── SECTION 2: NULL checks on critical columns ───────────────────

-- Users: username, email, password_hash must never be NULL
SELECT 'Users - NULL username' AS check_name, COUNT(*) AS violations
FROM Users WHERE username IS NULL
UNION ALL
SELECT 'Users - NULL email',        COUNT(*) FROM Users WHERE email IS NULL
UNION ALL
SELECT 'Users - NULL password',     COUNT(*) FROM Users WHERE password_hash IS NULL
UNION ALL
SELECT 'Messages - NULL chat_id',   COUNT(*) FROM Messages WHERE chat_id IS NULL
UNION ALL
SELECT 'Messages - NULL sender_id', COUNT(*) FROM Messages WHERE sender_id IS NULL
UNION ALL
SELECT 'Status - NULL message_id',  COUNT(*) FROM Message_Status WHERE message_id IS NULL
UNION ALL
SELECT 'Status - NULL user_id',     COUNT(*) FROM Message_Status WHERE user_id IS NULL;
-- Expected: all violations = 0


-- ── SECTION 3: Foreign key integrity checks ──────────────────────

-- Every message must belong to a valid chat
SELECT 'Orphan messages (no chat)' AS check_name, COUNT(*) AS violations
FROM Messages m
LEFT JOIN Chats c ON m.chat_id = c.chat_id
WHERE c.chat_id IS NULL;

-- Every message must have a valid sender
SELECT 'Orphan messages (no sender)' AS check_name, COUNT(*) AS violations
FROM Messages m
LEFT JOIN Users u ON m.sender_id = u.user_id
WHERE u.user_id IS NULL;

-- Every Message_Status must reference a valid message
SELECT 'Orphan statuses (no message)' AS check_name, COUNT(*) AS violations
FROM Message_Status ms
LEFT JOIN Messages m ON ms.message_id = m.message_id
WHERE m.message_id IS NULL;

-- Every Chat_Members row must reference a valid user
SELECT 'Orphan members (no user)' AS check_name, COUNT(*) AS violations
FROM Chat_Members cm
LEFT JOIN Users u ON cm.user_id = u.user_id
WHERE u.user_id IS NULL;
-- Expected: all violations = 0


-- ── SECTION 4: Sample UPDATE ──────────────────────────────────────
-- Mark a specific user as offline after they disconnect
UPDATE Users
SET is_online = 0, last_seen_at = NOW()
WHERE user_id = 1;

-- Confirm the change
SELECT user_id, username, is_online, last_seen_at
FROM Users WHERE user_id = 1;


-- ── SECTION 5: Sample DELETE ──────────────────────────────────────
-- Soft-delete a message (preserves row for reply-chain integrity)
UPDATE Messages
SET is_deleted = 1
WHERE message_id = 1;

-- Hard-delete a file attachment with a WHERE condition
DELETE FROM Files
WHERE file_id = 1 AND message_id = 1;

-- Confirm Files row is gone
SELECT COUNT(*) AS remaining FROM Files WHERE file_id = 1;


-- ── SECTION 6: Bonus JOIN query ───────────────────────────────────
-- Show message history for chat 1 with sender usernames
SELECT
    m.message_id,
    u.username     AS sender,
    m.message_type,
    m.content,
    m.created_at,
    m.is_deleted
FROM Messages m
JOIN Users u ON m.sender_id = u.user_id
WHERE m.chat_id = 1
ORDER BY m.created_at ASC
LIMIT 20;
