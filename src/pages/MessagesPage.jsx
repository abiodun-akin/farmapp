import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { API_BASE_URL } from "../config/api";
import { canAccessFeature } from "../utils/subscriptionHelper";
import useSagaApi from "../hooks/useSagaApi";

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMatchId = location.state?.matchId || "";
  const [conversations, setConversations] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(initialMatchId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();

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
    if (!selectedMatchId || !canUseMessaging) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const response = await sagaApi({
          service: "userApi",
          method: "getMessages",
          args: [selectedMatchId],
        });
        setMessages(response.data?.messages || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load messages");
      }
    };

    loadMessages();
  }, [selectedMatchId, canUseMessaging, sagaApi]);

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
      if (incomingMessage?.match_id !== selectedMatchId) return;
      setMessages((prev) => {
        const exists = prev.some((message) => message._id === incomingMessage._id);
        if (exists) return prev;
        return [...prev, incomingMessage];
      });
    });

    socketRef.current = socketClient;

    return () => {
      socketClient.disconnect();
      socketRef.current = null;
    };
  }, [canUseMessaging, selectedMatchId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedMatchId || !canUseMessaging) return undefined;

    socket.emit("join-conversation", { matchId: selectedMatchId });

    return () => {
      socket.emit("leave-conversation", { matchId: selectedMatchId });
    };
  }, [selectedMatchId, canUseMessaging]);

  const handleSend = async () => {
    if (!selectedMatchId || !newMessage.trim()) {
      return;
    }

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          matchId: selectedMatchId,
          content: newMessage.trim(),
        });
      } else {
        await sagaApi({
          service: "userApi",
          method: "sendMessage",
          args: [selectedMatchId, newMessage.trim()],
        });
      }
      setNewMessage("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send message");
    }
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
            <div style={{ height: "360px", overflowY: "auto", padding: "12px" }}>
              {messages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#f8f8f8",
                    }}
                  >
                    <p style={{ margin: 0 }}>{message.content}</p>
                    <small style={{ color: "#777" }}>
                      {new Date(message.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #f0f0f0" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
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
