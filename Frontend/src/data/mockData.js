export const MOCK_CHATS = [
  {
    id: 1,
    type: "group",
    name: "General",
    lastMsg: "Alex: Let's finalize the sprint...",
    time: "12:45 PM",
    unread: 3,
    online: true,
    initials: "GE",
    members: [
      { id: 1, name: "Alex Rivera",   role: "owner",  online: true,  subtitle: "Product Architect" },
      { id: 2, name: "Sarah Chen",    role: "admin",  online: true,  subtitle: "Engineering Lead"  },
      { id: 3, name: "Jordan Smith",  role: "member", online: true,  subtitle: ""                  },
      { id: 4, name: "Marcus Wright", role: "member", online: true,  subtitle: ""                  },
      { id: 5, name: "Dr. Elena Ross",role: "member", online: true,  subtitle: ""                  },
      { id: 6, name: "Tom Baker",     role: "member", online: false, subtitle: ""                  },
      { id: 7, name: "Lina Zhao",     role: "member", online: false, subtitle: ""                  },
    ],
    messages: [
      {
        id: 1, sender: "Alex Rivera", mine: false, type: "text",
        content: "Hey team, has anyone had a chance to review the new dashboard architecture? We need to finalize the API endpoints by EOD.",
        time: "11:20 AM",
      },
      {
        id: 2, sender: "You", mine: true, type: "text",
        content: "I just finished the initial review. The logic looks solid, but I think we can optimize the websocket reconciliation layer.",
        time: "11:22 AM",
      },
      {
        id: 3, sender: "Sarah Chen", mine: false, type: "text",
        content: "Agreed. I've attached the updated schema with those optimizations included.",
        time: "11:25 AM",
      },
      {
        id: 4, sender: "Sarah Chen", mine: false, type: "file",
        content: "schema_v2_final.pdf", size: "2.4 MB • PDF",
        time: "11:25 AM",
      },
      {
        id: 5, sender: "You", mine: true, type: "text",
        content: "Perfect, thanks Sarah. I'll take a look now and merge it into the main branch.",
        time: "12:45 PM", isNewSection: true,
      },
    ],
  },
  {
    id: 2,
    type: "private",
    name: "Sarah Chen",
    lastMsg: "The files are ready for review.",
    time: "Yesterday",
    unread: 0,
    online: true,
    initials: "SC",
    members: [],
    messages: [
      { id: 1, sender: "Sarah Chen", mine: false, type: "text", content: "The files are ready for review.", time: "Yesterday" },
    ],
  },
  {
    id: 3,
    type: "group",
    name: "Dev Workspace",
    lastMsg: "Commit #f28a1 pushed to prod.",
    time: "Oct 12",
    unread: 0,
    online: false,
    initials: "DW",
    members: [
      { id: 1, name: "Alex Rivera", role: "owner", online: false, subtitle: "" },
      { id: 8, name: "Dev Bot",     role: "member",online: false, subtitle: "Automation" },
    ],
    messages: [
      { id: 1, sender: "Dev Bot", mine: false, type: "text", content: "Commit #f28a1 pushed to prod.", time: "Oct 12" },
    ],
  },
];

export const SUGGESTED_CONTACTS = [
  { id: 10, name: "Alex Rivera",  username: "@arivera_design", online: true,  initials: "AR" },
  { id: 11, name: "Sarah Chen",   username: "@schen_dev",      online: true,  initials: "SC" },
  { id: 12, name: "Jordan Doe",   username: "@jdoe_ops",       online: false, initials: "JD" },
];
