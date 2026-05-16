"""
Synthetic data generator for Real-Time Chat Application
Run: pip install faker && python generate_data.py
Output: CSV files in ./data/ folder (one per table, 50-100 rows each)
"""

import csv, os, random
from datetime import datetime, timedelta
from faker import Faker
import hashlib

fake = Faker()
os.makedirs("data", exist_ok=True)

# ── CONFIG ─────────────────────────────────────────────────────────
NUM_USERS    = 60
NUM_CHATS    = 40   # mix of private and group
NUM_MESSAGES = 100
random.seed(42)

def ts(start_days_ago=365, end_days_ago=0):
    """Random datetime between start and end days ago."""
    start = datetime.now() - timedelta(days=start_days_ago)
    end   = datetime.now() - timedelta(days=end_days_ago)
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

def fmt(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")

# ── 1. USERS ───────────────────────────────────────────────────────
users = []
used_usernames = set()
used_emails    = set()

for i in range(1, NUM_USERS + 1):
    while True:
        username = fake.user_name()[:48]
        if username not in used_usernames:
            used_usernames.add(username)
            break
    while True:
        email = fake.email()
        if email not in used_emails:
            used_emails.add(email)
            break

    plain_pw      = fake.password(length=12)
    password_hash = hashlib.sha256(plain_pw.encode()).hexdigest()
    avatar_url    = f"https://avatars.example.com/{username}.png" if random.random() > 0.2 else ""
    is_online     = random.choice([0, 0, 0, 1])
    created_at    = ts(365, 30)
    last_seen_at  = fmt(ts(30, 0)) if random.random() > 0.1 else ""

    users.append({
        "user_id":       i,
        "username":      username,
        "email":         email,
        "password_hash": password_hash,
        "avatar_url":    avatar_url,
        "is_online":     is_online,
        "created_at":    fmt(created_at),
        "last_seen_at":  last_seen_at,
    })

with open("data/users.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=users[0].keys())
    w.writeheader(); w.writerows(users)
print(f"users.csv — {len(users)} rows")

# ── 2. CHATS ───────────────────────────────────────────────────────
chats = []
user_ids = [u["user_id"] for u in users]

for i in range(1, NUM_CHATS + 1):
    chat_type  = "private" if i <= NUM_CHATS // 2 else "group"
    title       = fake.bs().title()[:95] if chat_type == "group" else ""
    description = fake.sentence()[:290] if chat_type == "group" and random.random() > 0.4 else ""
    created_by  = random.choice(user_ids)
    created_at  = ts(300, 10)

    chats.append({
        "chat_id":     i,
        "chat_type":   chat_type,
        "title":       title,
        "description": description,
        "created_by":  created_by,
        "created_at":  fmt(created_at),
    })

with open("data/chats.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=chats[0].keys())
    w.writeheader(); w.writerows(chats)
print(f"chats.csv — {len(chats)} rows")

# ── 3. CHAT_MEMBERS ────────────────────────────────────────────────
members = []
seen_pairs = set()

for chat in chats:
    cid        = chat["chat_id"]
    creator    = chat["created_by"]
    chat_created = datetime.strptime(chat["created_at"], "%Y-%m-%d %H:%M:%S")

    # Creator is always owner
    pair = (cid, creator)
    seen_pairs.add(pair)
    members.append({
        "chat_id":   cid,
        "user_id":   creator,
        "role":      "owner",
        "joined_at": chat["created_at"],
        "is_muted":  0,
    })

    # Private chats: exactly one more member
    if chat["chat_type"] == "private":
        others = [u for u in user_ids if u != creator]
        partner = random.choice(others)
        pair = (cid, partner)
        if pair not in seen_pairs:
            seen_pairs.add(pair)
            members.append({
                "chat_id":   cid,
                "user_id":   partner,
                "role":      "member",
                "joined_at": chat["created_at"],
                "is_muted":  random.choice([0, 0, 1]),
            })
    else:
        # Group chats: 3–10 additional members
        pool    = [u for u in user_ids if u != creator]
        sample  = random.sample(pool, min(random.randint(3, 10), len(pool)))
        for uid in sample:
            pair = (cid, uid)
            if pair not in seen_pairs:
                seen_pairs.add(pair)
                joined = chat_created + timedelta(minutes=random.randint(1, 60*24*30))
                members.append({
                    "chat_id":   cid,
                    "user_id":   uid,
                    "role":      random.choices(["admin","member","member","member"], k=1)[0],
                    "joined_at": fmt(joined),
                    "is_muted":  random.choice([0, 0, 0, 1]),
                })

with open("data/chat_members.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=members[0].keys())
    w.writeheader(); w.writerows(members)
print(f"chat_members.csv — {len(members)} rows")

# ── 4. MESSAGES ────────────────────────────────────────────────────
# Build chat → member map for realistic senders
chat_member_map = {}
for m in members:
    chat_member_map.setdefault(m["chat_id"], []).append(m["user_id"])

messages = []
for i in range(1, NUM_MESSAGES + 1):
    chat      = random.choice(chats)
    cid       = chat["chat_id"]
    chat_uids = chat_member_map.get(cid, [chat["created_by"]])
    sender    = random.choice(chat_uids)
    msg_type  = random.choices(["text","text","text","image","file"], k=1)[0]
    content   = fake.sentence(nb_words=random.randint(3, 20)) if msg_type == "text" else ""
    reply_to  = ""
    if random.random() > 0.8 and i > 5:
        # Reply to a random earlier message in same chat
        earlier = [m["message_id"] for m in messages if m["chat_id"] == cid]
        if earlier:
            reply_to = random.choice(earlier)

    created_at = ts(200, 0)
    edited_at  = fmt(created_at + timedelta(minutes=random.randint(1,30))) if random.random() > 0.9 else ""
    is_deleted = 1 if random.random() > 0.95 else 0

    messages.append({
        "message_id":   i,
        "chat_id":      cid,
        "sender_id":    sender,
        "message_type": msg_type,
        "content":      content,
        "reply_to":     reply_to,
        "is_deleted":   is_deleted,
        "created_at":   fmt(created_at),
        "edited_at":    edited_at,
    })

with open("data/messages.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=messages[0].keys())
    w.writeheader(); w.writerows(messages)
print(f"messages.csv — {len(messages)} rows")

# ── 5. MESSAGE_STATUS ──────────────────────────────────────────────
statuses = []
status_id = 1
seen_status_pairs = set()

for msg in messages:
    cid       = msg["chat_id"]
    sender    = msg["sender_id"]
    msg_time  = datetime.strptime(msg["created_at"], "%Y-%m-%d %H:%M:%S")
    recipients = [u for u in chat_member_map.get(cid, []) if u != sender]

    for uid in recipients:
        pair = (msg["message_id"], uid)
        if pair in seen_status_pairs:
            continue
        seen_status_pairs.add(pair)

        status_val  = random.choices(["sent","delivered","seen"], weights=[1,2,7], k=1)[0]
        updated_at  = msg_time + timedelta(seconds=random.randint(1, 3600))

        statuses.append({
            "status_id":  status_id,
            "message_id": msg["message_id"],
            "user_id":    uid,
            "status":     status_val,
            "updated_at": fmt(updated_at),
        })
        status_id += 1

with open("data/message_status.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=statuses[0].keys())
    w.writeheader(); w.writerows(statuses)
print(f"message_status.csv — {len(statuses)} rows")

# ── 6. FILES ───────────────────────────────────────────────────────
files = []
file_messages = [m for m in messages if m["message_type"] in ("image","file")]

for i, msg in enumerate(file_messages, 1):
    ext       = random.choice(["png","jpg","pdf","docx","mp4","zip"])
    mime_map  = {"png":"image/png","jpg":"image/jpeg","pdf":"application/pdf",
                 "docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                 "mp4":"video/mp4","zip":"application/zip"}
    fname     = fake.file_name(extension=ext)
    msg_time  = msg["created_at"]

    files.append({
        "file_id":      i,
        "message_id":   msg["message_id"],
        "uploader_id":  msg["sender_id"],
        "file_name":    fname,
        "file_type":    mime_map[ext],
        "file_size_kb": random.randint(10, 15000),
        "storage_url":  f"https://storage.example.com/uploads/{fake.uuid4()}/{fname}",
        "uploaded_at":  msg_time,
    })

# Pad to at least 50 rows if needed
while len(files) < 50:
    msg       = random.choice(messages)
    ext       = random.choice(["png","jpg","pdf"])
    mime_map  = {"png":"image/png","jpg":"image/jpeg","pdf":"application/pdf"}
    fname     = fake.file_name(extension=ext)
    files.append({
        "file_id":      len(files) + 1,
        "message_id":   msg["message_id"],
        "uploader_id":  msg["sender_id"],
        "file_name":    fname,
        "file_type":    mime_map[ext],
        "file_size_kb": random.randint(10, 5000),
        "storage_url":  f"https://storage.example.com/uploads/{fake.uuid4()}/{fname}",
        "uploaded_at":  msg["created_at"],
    })

with open("data/files.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=files[0].keys())
    w.writeheader(); w.writerows(files)
print(f"files.csv — {len(files)} rows")

print("\nAll CSV files saved to ./data/")
