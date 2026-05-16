-- ============================================================
-- DDL Script — Real-Time Chat Application
-- Student: Hamad Tahir | Course: Database Lab | Milestone 4
-- ============================================================

CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;

-- 1. Users
CREATE TABLE Users (
    user_id       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)   NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    avatar_url    VARCHAR(500)  NULL,
    is_online     TINYINT       NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at  DATETIME      NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_email    (email)
);

-- 2. Chats
CREATE TABLE Chats (
    chat_id     INT UNSIGNED             NOT NULL AUTO_INCREMENT,
    chat_type   ENUM('private','group')  NOT NULL,
    title       VARCHAR(100)             NULL,
    description VARCHAR(300)             NULL,
    created_by  INT UNSIGNED             NOT NULL,
    created_at  DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id),
    CONSTRAINT fk_chats_creator FOREIGN KEY (created_by)
        REFERENCES Users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. Chat_Members
CREATE TABLE Chat_Members (
    chat_id   INT UNSIGNED                    NOT NULL,
    user_id   INT UNSIGNED                    NOT NULL,
    role      ENUM('owner','admin','member')   NOT NULL DEFAULT 'member',
    joined_at DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_muted  TINYINT                         NOT NULL DEFAULT 0,
    PRIMARY KEY (chat_id, user_id),
    CONSTRAINT fk_members_chat FOREIGN KEY (chat_id)
        REFERENCES Chats(user_id) ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_members_user FOREIGN KEY (user_id)
        REFERENCES Users(user_id) ON DELETE CASCADE  ON UPDATE CASCADE,
    INDEX idx_members_user (user_id)
);

-- 4. Messages
CREATE TABLE Messages (
    message_id   INT UNSIGNED                           NOT NULL AUTO_INCREMENT,
    chat_id      INT UNSIGNED                           NOT NULL,
    sender_id    INT UNSIGNED                           NOT NULL,
    message_type ENUM('text','image','file','system')   NOT NULL DEFAULT 'text',
    content      TEXT                                   NULL,
    reply_to     INT UNSIGNED                           NULL,
    is_deleted   TINYINT                                NOT NULL DEFAULT 0,
    created_at   DATETIME                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at    DATETIME                               NULL,
    PRIMARY KEY (message_id),
    CONSTRAINT fk_messages_chat   FOREIGN KEY (chat_id)
        REFERENCES Chats(chat_id)    ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id)
        REFERENCES Users(user_id)    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_messages_reply  FOREIGN KEY (reply_to)
        REFERENCES Messages(message_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_messages_history (chat_id, created_at),
    INDEX idx_messages_sender  (sender_id)
);

-- 5. Message_Status
CREATE TABLE Message_Status (
    status_id  INT UNSIGNED                    NOT NULL AUTO_INCREMENT,
    message_id INT UNSIGNED                    NOT NULL,
    user_id    INT UNSIGNED                    NOT NULL,
    status     ENUM('sent','delivered','seen') NOT NULL DEFAULT 'sent',
    updated_at DATETIME                        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (status_id),
    UNIQUE KEY uq_status_per_user (message_id, user_id),
    CONSTRAINT fk_status_message FOREIGN KEY (message_id)
        REFERENCES Messages(message_id) ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_status_user    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)       ON DELETE CASCADE  ON UPDATE CASCADE,
    INDEX idx_status_unread (user_id, status)
);

-- 6. Files
CREATE TABLE Files (
    file_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    message_id   INT UNSIGNED  NOT NULL,
    uploader_id  INT UNSIGNED  NOT NULL,
    file_name    VARCHAR(255)  NOT NULL,
    file_type    VARCHAR(50)   NOT NULL,
    file_size_kb INT UNSIGNED  NOT NULL,
    storage_url  VARCHAR(500)  NOT NULL,
    uploaded_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (file_id),
    CONSTRAINT fk_files_message  FOREIGN KEY (message_id)
        REFERENCES Messages(message_id) ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT fk_files_uploader FOREIGN KEY (uploader_id)
        REFERENCES Users(user_id)       ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_files_message (message_id)
);
