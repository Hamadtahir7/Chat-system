Database Lab — Project Proposal
Course: Database Lab
Project Title: Real-Time Chat Application with Database-Driven Messaging System
1. Objective of the Proposal
The purpose of this proposal is to clearly explain:
The problem: Inefficient and unstructured approaches to storing and managing communication data in messaging-style systems.
The system to be developed: A web-based, real-time chat application with structured data handling for users, conversations, and messages.
The role of the database: A relational database (MySQL) to manage users, chats (private and group), messages, and delivery/read status with integrity, consistency, and efficient querying.
This project is a software system backed by a database (web application). The primary focus is database design and implementation, including normalization, constraints, indexing, and SQL operations that support the application.
2. Project Team Information
For Individual:
Student Name: Hamad Tahir
Program and Group: BSSE B
Project Title: Real-Time Chat Application with Database-Driven Messaging System
3. Introduction & Background
Instant messaging is central to how students, teams, and organizations coordinate work and share information. Many applications expose only the user interface while the underlying data—users, threads, and messages—must still be modeled carefully to remain searchable, consistent, and scalable. Poor structure leads to duplicated data, slow history retrieval, and weak group membership rules. This project situates a real-time chat system in that context: the database is the backbone for who may participate in which conversation, what was said and when, and how message lifecycle (sent, delivered, seen) is recorded. Building this system demonstrates how relational design supports both day-to-day messaging features and reporting needs.
4. Problem Statement
 What problem exists? In many ad hoc or lightweight systems, messages and participants are not stored in a clear relational model. History is hard to query; group membership and permissions are ambiguous; and redundant or inconsistent copies of user or chat data appear across storage.
Who is affected? Students, project teams, and small organizations that rely on chat for coordination suffer when history is unreliable, search is slow, or group administration is unclear.
Current issues: Unstructured or flat storage of messages; difficulty retrieving past conversations; weak or missing rules for group chat membership and roles; data redundancy and inconsistency when the same facts are stored in multiple places without constraints.
Why a database solution? A relational database provides organized storage of users, chats, and messages; fast retrieval of chat history via indexes and joins; consistency and integrity through keys and constraints; and a single coherent model for many users and many concurrent conversations.
 5. Proposed Solution
 The proposed system is a web-based real-time chat application supporting private (one-to-one) and group conversations. All persistent data—users, chat metadata, membership, messages, optional file metadata, and message status—resides in MySQL, accessed through a Node.js (Express) backend. Real-time delivery uses WebSockets (Socket.io) while the database remains the source of truth for history, membership, and analytics. This combination solves the stated problems by enforcing structure at the data layer, enabling efficient SQL queries, and keeping the live layer synchronized with stored state.
 6. Objectives of the System
 Efficient storage and management of users, chats, messages, and related metadata in a normalized relational schema.
Data consistency and integrity using primary keys, foreign keys, uniqueness rules, and transactional updates where appropriate.
Fast retrieval of message history and chat lists through sensible indexing and query design. Real-time communication so new messages reach participants promptly via WebSockets, with
state reflected in the database.
Message status tracking (e.g., sent, delivered, seen) modeled explicitly in the database.
Scalable, normalized design (targeting up to third normal form, 3NF) suitable for extension (e.g., more analytics or features later).
  
7. Scope of the Project
 Included:
User authentication (registration and login).
One-to-one and group chat creation and participation.
Message storage, retrieval, and chat history views.
Message status tracking (delivered / seen as applicable).
Basic analytics (e.g., message counts, simple activity metrics).
Search across chats and messages (as implemented within project time).
File sharing represented at least by metadata stored in the database (optional file binary storage per instructor/course policy).
Excluded:
Video or voice calling.
End-to-end encryption (advanced security beyond standard transport/auth). Native mobile applications ( web-only front end).
 8. Role of Database System
 Data stored:
User accounts and profile-related fields needed for the app.
Chat / group definitions (type, title, timestamps, etc.).
Chat membership (which user belongs to which chat, and roles if modeled). Messages with timestamps and sender references.
Message status per recipient or per message as designed (delivered, seen). File metadata linked to messages where file sharing is supported.
Why a database is necessary: To express relationships (users ↔ chats ↔ messages) explicitly, support filtered and paginated history, avoid ad hoc duplication, and run analytical queries (e.g., activity summaries) over one consistent dataset.
Operations:
CRUD on users, chats, memberships, and messages. Retrieval of chat history with ordering and limits. Reporting / analytics queries using joins and aggregations.
Data integrity:
Foreign keys linking messages to chats and users, members to chats, status to messages/users, etc. Unique constraints where business rules require uniqueness (e.g., usernames or email, if used).
Indexes on foreign keys and frequently filtered/sorted columns (e.g., chat_id , created_at ) for performance.
   
 9. System Features / Functional Requirements
 1. User registration and login (authenticated sessions).
2. Create private chats and group chats; open and list conversations.
3. Send and receive messages in real time; persist all messages in MySQL.
4. View chat history with reasonable pagination or lazy loading.
5. Message status visibility (sent / delivered / seen) as designed in schema.
6. Add / remove users from group chats (admin/owner rules as specified in implementation). 7. Search chats and/or message content (scope per implementation).
8. Basic analytics dashboard (e.g., counts, simple activity indicators).
9. File sharing with metadata stored in the database (and optional attachment handling).
 10. Preliminary Data Design
 Main entities:
   Entity Brief role
  Users Accounts and attributes needed for auth and display.
   Chats Conversation container (private vs group, title, etc.).
  Chat_Members Associative link: which users belong to which chats (many-to-many).
   Messages Text/content, sender, chat, timestamps.
  Message_Status Per-user or per-recipient state for delivered/seen.
   Files Optional metadata for attachments linked to messages.
  Relationships (summary):
Users ↔ Chats: many-to-many via Chat_Members.
Chats → Messages: one-to-many (each message belongs to one chat).
Messages → Message_Status: one-to-many (multiple status rows per message if per-recipient). Messages → Files: optional one-to-one (or one-to-many if multiple attachments are allowed).
A full MySQL DDL (tables, keys, indexes) and an ER diagram can be submitted as appendices or in a later design document.
  
11. Existing Systems / Comparative Analysis
Widely used messaging products provide real-time UX but often obscure how data is modeled, replicated, and queried at scale. Smaller or tutorial projects frequently omit strict normalization, lack foreign-key-based integrity, and underuse analytical SQL.
This project improves on those patterns by:
Applying a clear relational schema with documented entities and relationships. Normalizing data to reduce redundancy and support consistent updates.
Using SQL joins and aggregations for history and analytics, not only simple key-value reads.
Demonstrating a database-driven architecture where the web stack and Socket.io layer serve a well-defined data model rather than ad hoc storage.
12. Proposed Technology Stack
Layer Technology
Frontend React, Tailwind CSS
Backend Node.js, Express.js, Socket.io (WebSockets)
Database MySQL
Tools VS Code, MySQL Workbench, Postman, Git
13. Expected Outcomes
By the end of the project, the following are expected:
A working real-time chat web application integrated with MySQL.
A normalized MySQL database design (target 3NF) with documented entities, relationships, constraints, and indexes.
Efficient SQL demonstrating joins, filters, ordering, and aggregations for history and basic analytics.
Clear evidence of data integrity (keys, constraints, consistent updates).
Stronger understanding of database-driven application design and how the frontend, backend,
and database layers cooperate.
A basis for optional extensions (richer analytics, moderation, or refined search) grounded in the same relational model.