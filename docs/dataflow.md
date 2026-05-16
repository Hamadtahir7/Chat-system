# Dataflow Description — Real-Time Chat Application

**Student:** Hamad Tahir | **Course:** Database Lab

---

## Where Data Enters the System

Data enters through three entry points:

1. **User Registration / Login** — A new user fills out the registration form (username, email, password). The backend hashes the password and inserts a row into `Users`. On login, the backend queries `Users` by email, verifies the hash, and sets `is_online = 1`.

2. **Chat Creation** — When a user starts a new private or group conversation, the backend inserts a row into `Chats` and immediately inserts one row per participant into `Chat_Members`, including the creator's `role = 'owner'`.

3. **Sending a Message** — When a user types and sends a message, the frontend emits a Socket.io event. The backend receives it, inserts a row into `Messages`, then inserts one `Message_Status` row (status = 'sent') for every other member of that chat. If the message includes a file, a row is also inserted into `Files` with the attachment metadata.

---

## How Data Moves Through the Database

```
[User registers]
        ↓
    Users table
        ↓
[User creates/joins a chat]
        ↓
    Chats table  ←──────────────────────┐
        ↓                               │
  Chat_Members table                    │
  (links Users ↔ Chats)                 │
        ↓                               │
[User sends a message]                  │
        ↓                               │
   Messages table  ─────────────────────┘
   (chat_id FK, sender_id FK)
        ↓                    ↓
 Message_Status           Files table
 (one row per           (if attachment
  recipient)              was sent)
```

**Dependency order for inserts:**
Users must exist before Chats can be created → Chats must exist before Chat_Members rows are inserted → Chat_Members must exist (user must be in chat) before Messages are accepted → Messages must exist before Message_Status or Files rows are inserted.

---

## How Delivery Status Updates

When a recipient's client connects (or reconnects) via Socket.io:
1. The backend queries `Message_Status` for all rows where `user_id = recipient` and `status = 'sent'`
2. Those rows are updated to `status = 'delivered'`
3. When the recipient opens the chat and views the messages, rows are updated to `status = 'seen'`
4. The sender's client is notified via Socket.io and updates the UI (single tick → double tick → blue tick)

---

## What Comes Out

| Output | Source Query |
|--------|-------------|
| Chat list for a user | JOIN Chat_Members → Chats, ORDER BY last message time |
| Message history | SELECT from Messages WHERE chat_id = ? ORDER BY created_at |
| Unread count | COUNT from Message_Status WHERE user_id = ? AND status != 'seen' |
| Online status | SELECT is_online, last_seen_at FROM Users WHERE user_id = ? |
| Group member list | JOIN Chat_Members → Users WHERE chat_id = ? |
| File attachments | SELECT from Files WHERE message_id = ? |

---

## Data Lifecycle Summary

1. User registers → **Users**
2. User creates chat → **Chats** + **Chat_Members**
3. Other users join → **Chat_Members**
4. Message sent → **Messages** + **Message_Status** (×N recipients) + optional **Files**
5. Message delivered → UPDATE **Message_Status** status = 'delivered'
6. Message read → UPDATE **Message_Status** status = 'seen'
7. User goes offline → UPDATE **Users** is_online = 0, last_seen_at = NOW()
