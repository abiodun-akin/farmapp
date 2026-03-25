import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { API_BASE_URL } from "../config/api";
import { canAccessFeature } from "../utils/subscriptionHelper";
import useSagaApi from "../hooks/useSagaApi";

const MessagesPage = () => {
  const toId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value._id || value.id || value.toString?.() || "";
    }
    return String(value);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const initialMatchId = location.state?.matchId || "";
  const [conversations, setConversations] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(initialMatchId);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [typingUserId, setTypingUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();
  const currentUserId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")._id || "";
    } catch {
      return "";
    }
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.match_id === selectedMatchId),
    [conversations, selectedMatchId]
  );

  const canUseMessaging = canAccessFeature(subscriptionStatusType, "core");

  useEffect(() => {
    if (!canUseMessaging) return;

    const loadConversations = async () => {
      setLoading(true);
      try {
        const response = await sagaApi({ service: "userApi", method: "getConversations" });
        const list = response.data?.conversations || [];
        setConversations(list);
        setSelectedMatchId((prev) => prev || list[0]?.match_id || "");
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [canUseMessaging, sagaApi]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedMatchId || !canUseMessaging) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const response = await sagaApi({
          service: "userApi",
          method: debouncedSearchQuery ? "searchMessages" : "getMessages",
          args: debouncedSearchQuery
            ? [selectedMatchId, debouncedSearchQuery]
            : [selectedMatchId],
        });
        setMessages(response.data?.messages || []);
      } catch (err) {
        setError(
          err.response?.data?.error
          || (debouncedSearchQuery ? "Unable to search messages" : "Unable to load messages")
        );
      }
    };

    loadMessages();
  }, [selectedMatchId, canUseMessaging, sagaApi, debouncedSearchQuery]);

  useEffect(() => {
    if (!canUseMessaging) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const socketClient = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketClient.on("new-message", (incomingMessage) => {
      if (toId(incomingMessage?.match_id) !== selectedMatchId) return;
      setMessages((prev) => {
        const exists = prev.some((message) => message._id === incomingMessage._id);
        if (exists) return prev;
        return [...prev, incomingMessage];
      });

      if (toId(incomingMessage.recipient_id) === currentUserId) {
        socketClient.emit("mark-read", { matchId: selectedMatchId });
      }
    });

    socketClient.on("typing:start", ({ matchId, userId }) => {
      if (matchId !== selectedMatchId || toId(userId) === currentUserId) return;
      setTypingUserId(toId(userId));
    });

    socketClient.on("typing:stop", ({ matchId, userId }) => {
      if (matchId !== selectedMatchId || toId(userId) === currentUserId) return;
      setTypingUserId("");
    });

    socketClient.on("messages-read", ({ matchId, readerId }) => {
      if (matchId !== selectedMatchId) return;

      setMessages((prev) =>
        prev.map((message) => {
          const senderId = toId(message.sender_id);
          const recipientId = toId(message.recipient_id);
          if (senderId === currentUserId && recipientId === toId(readerId)) {
            return { ...message, status: "read" };
          }
          return message;
        })
      );
    });

    socketRef.current = socketClient;

    return () => {
      socketClient.disconnect();
      socketRef.current = null;
    };
  }, [canUseMessaging, selectedMatchId, currentUserId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedMatchId || !canUseMessaging) return undefined;

    socket.emit("join-conversation", { matchId: selectedMatchId });
    socket.emit("mark-read", { matchId: selectedMatchId });

    return () => {
      socket.emit("leave-conversation", { matchId: selectedMatchId });
      setTypingUserId("");
    };
  }, [selectedMatchId, canUseMessaging]);

  const emitTypingStop = () => {
    if (!socketRef.current?.connected || !selectedMatchId || !isTypingRef.current) return;
    socketRef.current.emit("typing:stop", { matchId: selectedMatchId });
    isTypingRef.current = false;
  };

  const handleMessageChange = (event) => {
    const value = event.target.value;
    setNewMessage(value);

    if (!socketRef.current?.connected || !selectedMatchId) return;

    if (!value.trim()) {
      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current);
      }
      emitTypingStop();
      return;
    }

    if (!isTypingRef.current) {
      socketRef.current.emit("typing:start", { matchId: selectedMatchId });
      isTypingRef.current = true;
    }

    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
    }
    typingStopTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!selectedMatchId || (!newMessage.trim() && !pendingAttachment)) {
      return;
    }

    try {
      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current);
      }
      emitTypingStop();

      if (socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          matchId: selectedMatchId,
          content: newMessage.trim(),
          attachment: pendingAttachment,
        });
      } else {
        await sagaApi({
          service: "userApi",
          method: "sendMessage",
          args: [selectedMatchId, newMessage.trim(), pendingAttachment],
        });
      }
      setNewMessage("");
      setPendingAttachment(null);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send message");
    }
  };

  const handleAttachmentSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Attachment size must be 5MB or less");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported attachment type");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingAttachment({
      url: objectUrl,
      name: file.name,
      mimeType: file.type,
      size: file.size,
    });
    setError("");
    event.target.value = "";
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Messages</h1>

      {!canUseMessaging && !subscriptionLoading && (
        <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto", marginTop: "40px" }}>
          <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
            {subscriptionStatusType === "expired"
              ? "Your subscription has expired. Renew to continue messaging."
              : "You need an active subscription to send and receive messages."}
          </p>
          <button
            onClick={() => navigate("/pricing")}
            style={{
              background: "#2d8659",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 32px)",
              fontSize: "clamp(14px, 2vw, 16px)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
            onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
          >
            Subscribe Now
          </button>
        </div>
      )}

      {canUseMessaging && (
        <>
          {(loading || subscriptionLoading) && <p>Loading conversations...</p>}
          {error && <p style={{ color: "#c62828" }}>{error}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "16px" }}>
          <div style={{ border: "1px solid #e0e0e0", borderRadius: "10px", background: "#fff" }}>
            {conversations.length === 0 ? (
              <p style={{ padding: "12px" }}>No conversations yet.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.match_id}
                  onClick={() => setSelectedMatchId(conversation.match_id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background:
                      selectedMatchId === conversation.match_id ? "#ebf2ee" : "transparent",
                    padding: "12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <strong>{conversation.otherUserEmail}</strong>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    {conversation.lastMessage || "No messages yet"}
                  </div>
                </button>
              ))
            )}
          </div>

          <div style={{ border: "1px solid #e0e0e0", borderRadius: "10px", background: "#fff" }}>
            <div style={{ padding: "12px", borderBottom: "1px solid #f0f0f0", fontWeight: 600 }}>
              {selectedConversation?.otherUserEmail || "Select a conversation"}
            </div>
            <div style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search messages..."
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
            </div>
            <div style={{ height: "360px", overflowY: "auto", padding: "12px" }}>
              {messages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                messages.map((message) => (
                  (() => {
                    const isOwnMessage = toId(message.sender_id) === currentUserId;
                    return (
                  <div
                    key={message._id}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      borderRadius: "8px",
                      background: isOwnMessage ? "#e7f3ec" : "#f8f8f8",
                      marginLeft: isOwnMessage ? "48px" : 0,
                      marginRight: isOwnMessage ? 0 : "48px",
                    }}
                  >
                    <p style={{ margin: 0 }}>{message.content}</p>
                    {message.attachment?.url && (
                      <div style={{ marginTop: "6px" }}>
                        <a
                          href={message.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2d8659", fontSize: "13px" }}
                        >
                          Attachment: {message.attachment.name || "Open file"}
                        </a>
                      </div>
                    )}
                    <small style={{ color: "#777" }}>
                      {new Date(message.createdAt).toLocaleString()}
                    </small>
                    {isOwnMessage && (
                      <div style={{ fontSize: "11px", color: "#4f6f5f", marginTop: "4px" }}>
                        {message.status === "read" ? "Read" : "Sent"}
                      </div>
                    )}
                  </div>
                    );
                  })()
                ))
              )}
              {typingUserId && (
                <p style={{ fontSize: "12px", color: "#5f7a6a", marginTop: "4px" }}>
                  {selectedConversation?.otherUserEmail || "User"} is typing...
                </p>
              )}
            </div>
            {pendingAttachment && (
              <div style={{ padding: "0 12px 8px", color: "#4f6f5f", fontSize: "12px" }}>
                Selected: {pendingAttachment.name}
                <button
                  onClick={() => setPendingAttachment(null)}
                  style={{ marginLeft: "8px", border: "none", background: "transparent", color: "#b42318", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #f0f0f0" }}>
              <input type="file" onChange={handleAttachmentSelect} />
              <input
                type="text"
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  background: "#2d8659",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default MessagesPage;
