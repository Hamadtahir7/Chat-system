// src/components/NewChatModal.jsx
import { useState, useEffect } from "react";
import { Search, X, ChevronRight, UserPlus, Check } from "lucide-react";
import { userService } from "../services/userService";
import { chatService } from "../services/chatService";
import Avatar from "./Avatar";

export default function NewChatModal({ onClose, onChatCreated }) {
  const [query, setQuery]   = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState("select"); // "select" or "group"
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getUsers();
        console.log('📋 Users loaded:', response);
        setUsers(response.data || []);
      } catch (error) {
        console.error("❌ Failed to load users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filtered = users.filter(u =>
    (u.name?.toLowerCase().includes(query.toLowerCase()) || false) ||
    (u.username?.toLowerCase().includes(query.toLowerCase()) || false)
  );

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleStartDM = async (userId) => {
    if (creating) return;
    setCreating(true);
    try {
      // Create a DM chat with this user
      const response = await chatService.createChat([userId], null, false);
      console.log('✅ DM chat created:', response);
      onChatCreated(response.data);
    } catch (error) {
      console.error("❌ Failed to create DM:", error);
      alert("Failed to create chat. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (creating || selectedUsers.length === 0 || !groupName.trim()) {
      alert("Please select users and enter a group name");
      return;
    }
    setCreating(true);
    try {
      const response = await chatService.createChat(
        selectedUsers,
        groupName.trim(),
        true
      );
      console.log('✅ Group chat created:', response);
      onChatCreated(response.data);
    } catch (error) {
      console.error("❌ Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (mode === "group") {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="w-full max-w-md glass rounded-3xl p-7 glow-effect shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent">New Group</h3>
            <button onClick={onClose} className="text-muted hover:text-primary transition-colors p-1">
              <X size={16} />
            </button>
          </div>

          {/* Group Name Input */}
          <div className="mb-5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full bg-card/30 border border-blue-light/20 rounded-lg px-4 py-2.5 text-sm text-primary placeholder-muted focus:outline-none focus:border-blue-light/50"
            />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 glass-sm rounded-lg px-3 py-2 mb-4">
            <Search size={14} className="text-muted flex-shrink-0" />
            <input
              placeholder="Search users..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-primary placeholder-muted flex-1"
            />
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 p-3 glass-sm rounded-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
                Selected: {selectedUsers.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.user_id === userId);
                  return user ? (
                    <div
                      key={userId}
                      className="px-3 py-1 rounded-full bg-blue-light/20 border border-blue-light/50 text-xs text-primary flex items-center gap-2"
                    >
                      {user.username}
                      <button
                        onClick={() => toggleUserSelection(userId)}
                        className="hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Users List */}
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">Add Members</p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-muted text-center py-4">Loading users...</p>
            ) : filtered.length > 0 ? (
              filtered.map(u => (
                <div
                  key={u.user_id}
                  onClick={() => toggleUserSelection(u.user_id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                    ${selectedUsers.includes(u.user_id)
                      ? "glass-sm border border-blue-light/50 glow-effect bg-blue-light/10"
                      : "hover:glass-sm border border-transparent"
                    }`}
                >
                  <Avatar initials={u.initials || (u.username?.substring(0, 2).toUpperCase() || 'U')} online={u.is_online || false} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">{u.username}</p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </div>
                  {selectedUsers.includes(u.user_id) && (
                    <Check size={18} className="text-blue-light" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted text-center py-4">No users found</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setMode("select")}
              className="flex-1 py-2.5 rounded-lg glass-sm text-sm font-semibold
                text-primary hover:bg-card/30 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={creating || selectedUsers.length === 0 || !groupName.trim()}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-light to-blue hover:from-blue hover:to-blue-hover text-white
                text-sm font-semibold transition-all glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md glass rounded-3xl p-7 glow-effect shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent">New Chat</h3>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 glass-sm rounded-lg px-3 py-2 mb-4">
          <Search size={14} className="text-muted flex-shrink-0" />
          <input
            placeholder="Search by username or email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-primary placeholder-muted flex-1"
          />
        </div>

        {/* New Group row */}
        <div
          onClick={() => setMode("group")}
          className="flex items-center justify-between glass-sm rounded-xl
          px-4 py-3 mb-5 cursor-pointer hover:bg-card/30 transition-all glow-effect"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-900/40 flex items-center justify-center">
              <UserPlus size={16} className="text-online" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">New Group</p>
              <p className="text-xs text-muted">Create a space for your team to collaborate</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted" />
        </div>

        {/* Suggested */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">Start Direct Message</p>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-muted text-center py-4">Loading users...</p>
          ) : filtered.length > 0 ? (
            filtered.map(u => (
              <div
                key={u.user_id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:glass-sm border border-transparent hover:border-blue-light/50 transition-all group"
              >
                <Avatar initials={u.initials || (u.username?.substring(0, 2).toUpperCase() || 'U')} online={u.is_online || false} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{u.username}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <button
                  onClick={() => handleStartDM(u.user_id)}
                  disabled={creating}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-light/20 text-blue-light hover:bg-blue-light/40 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {creating ? "..." : "Chat"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted text-center py-4">No users found</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg glass-sm text-sm font-semibold
              text-primary hover:bg-card/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
