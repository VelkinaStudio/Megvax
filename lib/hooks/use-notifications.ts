// lib/hooks/use-notifications.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, getAccessToken } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Track current token to reconnect SSE when it changes (e.g. after refresh)
  const [sseToken, setSseToken] = useState<string | null>(getAccessToken());

  useEffect(() => {
    const interval = setInterval(() => {
      const current = getAccessToken();
      if (current !== sseToken) setSseToken(current);
    }, 5000);
    return () => clearInterval(interval);
  }, [sseToken]);

  // Fetch existing notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api<{ data: Notification[]; hasMore: boolean }>('/notifications?limit=20');
      setNotifications(data.data || []);
      setUnreadCount((data.data || []).filter((n) => !n.readAt).length);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  // Connect to SSE stream — recreated whenever sseToken changes
  useEffect(() => {
    if (!sseToken) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const es = new EventSource(
      `${baseUrl}/notifications/stream?token=${encodeURIComponent(sseToken)}`
    );
    eventSourceRef.current = es;

    es.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data) as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    es.onerror = () => {
      // Browser EventSource auto-reconnects, but with the same (possibly expired) token.
      // The sseToken polling above will detect a new token and recreate this effect.
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [sseToken]);

  // Initial fetch — use requestAnimationFrame to avoid synchronous setState in effect
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      fetchNotifications();
    });
    return () => cancelAnimationFrame(rafId);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api('/notifications/read-all', { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}
