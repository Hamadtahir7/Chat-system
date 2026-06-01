// src/components/ChatApp.jsx
import { useState, useEffect } from "react";
import { chatService } from "../services/chatService";
import { messageService } from "../services/messageService";
import { authService } from "../services/authService";
import { initSocket, getSocket, disconnectSocket } from "../config/socket";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import NewChatModal from "./NewChatModal";

export default function ChatApp({ onLogout }) {
  const [chats, setChats]       = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Build active chat object with all needed properties
  const activeChat = chats.find(c => c.chat_id === activeId) 
    ? {
        ...chats.find(c => c.chat_id === activeId),
        messages: chats.find(c => c.chat_id === activeId)?.messages || [],
        members: chats.find(c => c.chat_id === activeId)?.members || [],
      }
    : null;

  // Load messages when chat changes
  useEffect(() => {
    if (!activeId || !currentUser) return;
    
    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await messageService.getMessages(activeId);
        console.log('💬 Messages loaded:', response);
        
        // Response can be { data: [...] } or just [...]
        const messagesData = response.data ? response.data : (Array.isArray(response) ? response : []);
        
        // Format messages with proper fields for display
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          sender: msg.sender_name || 'Unknown',
          mine: Number(msg.sender_id) === Number(currentUser?.user_id),
          time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }));
        
        // Update the active chat with formatted messages
        setChats(prev =>
          prev.map(c =>
            c.chat_id === activeId
              ? { ...c, messages: formattedMessages }
              : c
          )
        );
      } catch (error) {
        console.error("Failed to load messages:", error);
        // Set empty messages on error
        setChats(prev =>
          prev.map(c =>
            c.chat_id === activeId
              ? { ...c, messages: [] }
              : c
          )
        );
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadMessages();
  }, [activeId, currentUser]);

  // Load members for group chats
  useEffect(() => {
    if (!activeId) return;
    
    const activeChat = chats.find(c => c.chat_id === activeId);
    if (!activeChat || activeChat.chat_type !== 'group') return;
    
    const loadMembers = async () => {
      try {
        const response = await chatService.getChatMembers(activeId);
        console.log('👥 Members loaded:', response);
        
        const membersData = response.data ? response.data : (Array.isArray(response) ? response : []);
        
        // Update chat with members
        setChats(prev =>
          prev.map(c =>
            c.chat_id === activeId
              ? { ...c, members: membersData }
              : c
          )
        );
      } catch (error) {
        console.error("Failed to load members:", error);
      }
    };
    
    loadMembers();
  }, [activeId, chats]);

  // Initialize socket and fetch chats on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          onLogout();
          return;
        }

        // Get current user info for determining message ownership
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }

        // Initialize socket connection
        const socketInstance = initSocket(token);
        setSocket(socketInstance);

        // Fetch chats from backend
        const chatsData = await chatService.getChats();
        const chatsArray = chatsData.data ? chatsData.data : (Array.isArray(chatsData) ? chatsData : []);
        
        // Ensure each chat has messages array initialized
        const chatsWithMessages = chatsArray.map(c => ({
          ...c,
          messages: c.messages || [],
          members: c.members || [],
        }));
        
        setChats(chatsWithMessages);

        // Listen for new messages
        socketInstance.on("message:new", (message) => {
          console.log('📨 New message:', message);
          setChats(prev =>
            prev.map(c =>
              c.chat_id === message.chat_id
                ? {
                    ...c,
                    messages: [...(c.messages || []), {
                      ...message,
                      sender: message.sender_name || 'Unknown',
                      mine: Number(message.sender_id) === Number(user?.user_id),
                      time: new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    }],
                    last_message: message.content,
                    last_message_at: message.created_at,
                  }
                : c
            )
          );
        });

        // Listen for new chats created
        socketInstance.on("chat:new", (newChat) => {
          console.log('📬 New chat received via socket:', newChat);
          setChats(prev => {
            // Check if chat already exists to avoid duplicates
            if (prev.some(c => c.chat_id === newChat.chat_id)) {
              return prev;
            }
            return [{ ...newChat, messages: [], members: [] }, ...prev];
          });
        });

        // Listen for user status changes
        socketInstance.on("user:online", (data) => {
          console.log("User online:", data);
          // Update chat online status if it's a private chat
          setChats(prev =>
            prev.map(c =>
              c.other_user?.user_id === data.user_id
                ? { ...c, online: true }
                : c
            )
          );
        });

        socketInstance.on("user:offline", (data) => {
          console.log("User offline:", data);
          // Update chat online status if it's a private chat
          setChats(prev =>
            prev.map(c =>
              c.other_user?.user_id === data.user_id
                ? { ...c, online: false }
                : c
            )
          );
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize app:", err);
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      disconnectSocket();
    };
  }, [onLogout]);

  function handleSend(text, messageType = 'text', fileName = null) {
    if (!activeId || !text.trim()) return;
    
    messageService.sendMessage(activeId, text, messageType, null)
      .then(message => {
        console.log("✅ Message sent:", message);
      })
      .catch(err => {
        console.error("❌ Failed to send message:", err);
      });
  }

  function handleSelectChat(chatId) {
    setActiveId(chatId);
    setMobileOpen(false);
    
    // Mark chat as read
    messageService.markAsRead(chatId)
      .then(() => {
        // Update chat unread count to 0
        setChats(prev =>
          prev.map(c =>
            c.chat_id === chatId
              ? { ...c, unread_count: 0 }
              : c
          )
        );
      })
      .catch(err => {
        console.error("Failed to mark as read:", err);
      });
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-bg items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue/20 border-t-blue animate-spin mx-auto mb-3" />
          <p className="text-muted">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {showModal && (
        <NewChatModal 
          onClose={() => setShowModal(false)} 
          onChatCreated={async (newChat) => {
            console.log('✅ New chat created:', newChat);
            setShowModal(false);
            // Add the new chat to the list with proper structure
            setChats(prev => [
              { 
                ...newChat,
                messages: [],
                members: newChat.members || [],
              }, 
              ...prev
            ]);
            // Select the new chat
            setActiveId(newChat.chat_id);
          }} 
        />
      )}

      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={handleSelectChat}
        onNewChat={() => setShowModal(true)}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 flex min-w-0 h-full overflow-hidden">
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSend}
          onNewChat={() => setShowModal(true)}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
      </main>
    </div>
  );
}
