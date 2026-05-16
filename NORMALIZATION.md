# Normalization Walkthrough — Real-Time Chat Application

**Student:** Hamad Tahir | **Program:** BSSE B | **Course:** Database Lab

---

## Overview

This document walks through the normalization of every table in the schema from First Normal Form (1NF) through Third Normal Form (3NF). Where a table already satisfies a normal form, a written justification is provided explaining why no structural change was required.

---

## Table 1 — Users

| Column | Type |
|--------|------|
| user_id (PK) | INT UNSIGNED |
| username (UQ) | VARCHAR(50) |
| email (UQ) | VARCHAR(255) |
| password_hash | VARCHAR(255) |
| avatar_url | VARCHAR(500) |
| is_online | TINYINT |
| created_at | DATETIME |
| last_seen_at | DATETIME |

### 1NF
**Requirement:** Every column must hold a single, atomic value. No repeating groups or multi-valued attributes.

**Assessment:** Already satisfied. Each column stores exactly one value per row — for example, `email` holds one address, not a list. There are no comma-separated values or arrays anywhere in the table. No change needed.

### 2NF
**Requirement:** Must be in 1NF and every non-key attribute must depend on the *whole* primary key (no partial dependencies). Partial dependencies can only exist when the primary key is composite.

**Assessment:** Already satisfied. `Users` has a single-column primary key (`user_id`), so partial dependency is impossible by definition. Every attribute — `username`, `email`, `password_hash`, `avatar_url`, `is_online`, `created_at`, `last_seen_at` — fully describes the user identified by `user_id`. No change needed.

### 3NF
**Requirement:** Must be in 2NF and no non-key attribute should depend on another non-key attribute (no transitive dependencies).

**Assessment:** Already satisfied. None of the non-key columns derive from each other. For example, `is_online` does not determine `last_seen_at`, and `username` does not determine `email`. Every attribute depends directly and solely on `user_id`. No change needed.

---

## Table 2 — Chats

| Column | Type |
|--------|------|
| chat_id (PK) | INT UNSIGNED |
| chat_type | ENUM('private','group') |
| title | VARCHAR(100) |
| description | VARCHAR(300) |
| created_by (FK) | INT UNSIGNED |
| created_at | DATETIME |

### 1NF
**Assessment:** Already satisfied. Each column is single-valued and atomic. `chat_type` uses an ENUM which restricts values to exactly one of two options per row. `title` and `description` hold a single string each. No repeating groups exist. No change needed.

### 2NF
**Assessment:** Already satisfied. The primary key is a single column (`chat_id`), making partial dependency structurally impossible. `title`, `description`, `chat_type`, `created_by`, and `created_at` all describe the specific conversation identified by `chat_id`. No change needed.

### 3NF
**Assessment:** Already satisfied. No non-key column is functionally dependent on another non-key column. For instance, `created_by` (a FK reference to a user) does not determine `title` or `chat_type`. All attributes depend directly on `chat_id` alone. No change needed.

---

## Table 3 — Chat_Members

| Column | Type |
|--------|------|
| chat_id (PK, FK) | INT UNSIGNED |
| user_id (PK, FK) | INT UNSIGNED |
| role | ENUM('owner','admin','member') |
| joined_at | DATETIME |
| is_muted | TINYINT |

### 1NF
**Assessment:** Already satisfied. The composite primary key `(chat_id, user_id)` uniquely identifies each membership row. Each column holds a single atomic value — `role` is a single ENUM value, `joined_at` is a single timestamp, and `is_muted` is a single boolean-style flag. No repeating groups. No change needed.

### 2NF
**Requirement:** With a composite PK, every non-key attribute must depend on *both* parts of the key together, not just one part.

**Assessment:** Already satisfied. This is the critical table to examine:
- `role` — describes the relationship between *this user* and *this chat*, so it depends on both `chat_id` AND `user_id` together. A user can be an admin in one chat and a member in another.
- `joined_at` — the timestamp when this specific user joined this specific chat. Depends on both keys.
- `is_muted` — a per-user per-chat preference. Depends on both keys.

None of these attributes depend on only `chat_id` or only `user_id` in isolation. No change needed.

### 3NF
**Assessment:** Already satisfied. No non-key column depends on another non-key column. `role` does not determine `joined_at`, and `is_muted` is independent of `role`. All non-key attributes depend directly on the composite key `(chat_id, user_id)`. No change needed.

---

## Table 4 — Messages

| Column | Type |
|--------|------|
| message_id (PK) | INT UNSIGNED |
| chat_id (FK) | INT UNSIGNED |
| sender_id (FK) | INT UNSIGNED |
| message_type | ENUM('text','image','file','system') |
| content | TEXT |
| reply_to (FK, self-ref) | INT UNSIGNED |
| is_deleted | TINYINT |
| created_at | DATETIME |
| edited_at | DATETIME |

### 1NF
**Assessment:** Already satisfied. Every column stores one value per row. `content` holds the text of a single message. `message_type` is restricted to one ENUM value. There are no multi-valued fields — for example, file attachments are stored in a separate `Files` table rather than as a list inside `content`. This separation was a deliberate design decision to maintain atomicity. No change needed.

### 2NF
**Assessment:** Already satisfied. The primary key is a single column (`message_id`), so partial dependency cannot occur. Every attribute describes the specific message identified by `message_id`. No change needed.

### 3NF
**Assessment:** Already satisfied. Checking for transitive dependencies:
- `content` depends on `message_id`, not on `sender_id` or `chat_id`.
- `edited_at` depends on `message_id` (the message was edited), not on `created_at`.
- `sender_id` and `chat_id` are foreign keys acting as references, not derivable from each other.

No non-key attribute determines another non-key attribute. No change needed.

---

## Table 5 — Message_Status

| Column | Type |
|--------|------|
| status_id (PK) | INT UNSIGNED |
| message_id (FK) | INT UNSIGNED |
| user_id (FK) | INT UNSIGNED |
| status | ENUM('sent','delivered','seen') |
| updated_at | DATETIME |

### 1NF
**Assessment:** Already satisfied. Each row records one delivery state for one recipient of one message. The `status` column holds exactly one ENUM value. Rather than storing delivery states as repeated columns (e.g., `delivered_user1`, `delivered_user2`), a separate row per recipient was used — this is the correct atomic design. No change needed.

### 2NF
**Assessment:** Already satisfied. Although `(message_id, user_id)` has a UNIQUE constraint, the surrogate PK is `status_id`. Regardless, `status` and `updated_at` describe the delivery state for a specific message-recipient pair and depend on both `message_id` and `user_id` together. Neither attribute can be determined from just the message or just the user alone. No change needed.

### 3NF
**Assessment:** Already satisfied. `status` does not determine `updated_at` (the timestamp reflects when the status last changed, not the status value itself). `updated_at` does not determine `status`. Both depend directly on the primary key. No change needed.

---

## Table 6 — Files

| Column | Type |
|--------|------|
| file_id (PK) | INT UNSIGNED |
| message_id (FK) | INT UNSIGNED |
| uploader_id (FK) | INT UNSIGNED |
| file_name | VARCHAR(255) |
| file_type | VARCHAR(50) |
| file_size_kb | INT UNSIGNED |
| storage_url | VARCHAR(500) |
| uploaded_at | DATETIME |

### 1NF
**Assessment:** Already satisfied. Each column stores one atomic value. `file_type` holds a single MIME type string. `storage_url` holds one path. Rather than storing multiple attachments as a comma-separated list inside the Messages table, a dedicated Files table was created — this is exactly the kind of design decision 1NF requires. No change needed.

### 2NF
**Assessment:** Already satisfied. Single-column PK (`file_id`), so partial dependency is impossible. All attributes describe the specific file record identified by `file_id`. No change needed.

### 3NF
**Checking for transitive dependency — this table requires closer inspection:**

One potential concern: does `file_type` determine `storage_url`? No — the storage path depends on the specific file upload event, not the file's MIME type. Does `uploader_id` determine any other attribute? No — the uploader is just a reference to who performed the upload; it does not determine the file name or size.

All non-key attributes (`file_name`, `file_type`, `file_size_kb`, `storage_url`, `uploaded_at`) depend directly and only on `file_id`. No transitive dependencies exist. No change needed.

---

## Summary

| Table | 1NF | 2NF | 3NF | Changes Made |
|-------|-----|-----|-----|--------------|
| Users | ✅ Pass | ✅ Pass | ✅ Pass | None |
| Chats | ✅ Pass | ✅ Pass | ✅ Pass | None |
| Chat_Members | ✅ Pass | ✅ Pass | ✅ Pass | None |
| Messages | ✅ Pass | ✅ Pass | ✅ Pass | None |
| Message_Status | ✅ Pass | ✅ Pass | ✅ Pass | None |
| Files | ✅ Pass | ✅ Pass | ✅ Pass | None |

The schema was designed with normalization in mind from the start. The key structural decisions that naturally enforce normalization are:
- Separate `Files` table instead of embedding attachment data in `Messages` (enforces 1NF atomicity)
- `Chat_Members` bridge table to resolve the M:N relationship between `Users` and `Chats` (enforces 2NF)
- `Message_Status` table to track per-recipient delivery state instead of repeating columns in `Messages` (enforces 1NF and 3NF)
