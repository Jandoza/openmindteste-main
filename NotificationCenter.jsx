import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/NotificationCenter.css";

function NotificationCenter({ show, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial unread count on mount
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (show) {
      fetchNotifications();
    }
  }, [show]);

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Atualizar UI imediatamente
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Erro ao marcar notificações");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Atualizar UI imediatamente (otimistic update)
      const notifToDelete = notifications.find(n => n._id === notificationId);
      const updatedNotifications = notifications.filter((notif) => notif._id !== notificationId);

      setNotifications(updatedNotifications);

      // Se era não lida, decrementar o contador
      if (notifToDelete && !notifToDelete.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Fazer a requisição
      await api.delete(`/notifications/${notificationId}`);
      toast.success("Notificação removida");

      // Fechar o painel se não houver mais notificações
      if (updatedNotifications.length === 0) {
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erro ao remover notificação");
      // Recarregar em caso de erro
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_request":
        return "📅";
      case "appointment_confirmed":
        return "✅";
      case "appointment_cancelled":
        return "❌";
      case "message":
        return "💬";
      case "profile_view":
        return "👁️";
      default:
        return "🔔";
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (!show) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <div className="header-title">
            <h3>Notificações</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Marcar todas como lidas
              </button>
            )}
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">
              <div className="spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <span className="no-notif-icon">🔔</span>
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                onClick={() => !notif.read && markAsRead(notif._id)}
              >
                <div className="notif-icon">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <div className="notif-header-row">
                    <h4>{notif.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="delete-notif-btn"
                    >
                      🗑️
                    </button>
                  </div>
                  <p>{notif.message}</p>
                  {notif.sender && (
                    <div className="notif-sender">
                      De: <strong>{notif.sender.name}</strong>
                    </div>
                  )}
                  <span className="notif-time">
                    {getTimeAgo(notif.createdAt)}
                  </span>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
