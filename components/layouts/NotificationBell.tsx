'use client';

import { useRef } from 'react';
import { Bell, Zap, Lightbulb, DollarSign, Link2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from '@/lib/hooks/useOnClickOutside';

// ── Types ───────────────────────────────────────────────────────────

type NotificationType =
  | 'SYSTEM'
  | 'AUTOPILOT_ACTION'
  | 'SUGGESTION'
  | 'BILLING'
  | 'META_CONNECTION'
  | string;

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatRelativeTimeTr(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (minutes > 0) return `${minutes} dk önce`;
  return 'Az önce';
}

function getNotificationIcon(type: NotificationType) {
  const base = 'w-4 h-4 flex-shrink-0';

  switch (type) {
    case 'AUTOPILOT_ACTION':
      return <Zap className={`${base} text-amber-500`} />;
    case 'SUGGESTION':
      return <Lightbulb className={`${base} text-violet-500`} />;
    case 'BILLING':
      return <DollarSign className={`${base} text-emerald-500`} />;
    case 'META_CONNECTION':
      return <Link2 className={`${base} text-blue-500`} />;
    case 'SYSTEM':
    default:
      return <Bell className={`${base} text-gray-500`} />;
  }
}

function getIconBg(type: NotificationType): string {
  switch (type) {
    case 'AUTOPILOT_ACTION':
      return 'bg-amber-50';
    case 'SUGGESTION':
      return 'bg-violet-50';
    case 'BILLING':
      return 'bg-emerald-50';
    case 'META_CONNECTION':
      return 'bg-blue-50';
    case 'SYSTEM':
    default:
      return 'bg-gray-100';
  }
}

// ── Component ───────────────────────────────────────────────────────

export function NotificationBell({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const containerRef = useRef<HTMLDivElement>(null!);
  useOnClickOutside(containerRef, onClose);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={onToggle}
        className="
          relative p-2 rounded-lg
          text-gray-400 hover:text-gray-600 hover:bg-gray-100
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-accent-primary/20
        "
        aria-label="Bildirimler"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="
                absolute -top-0.5 -right-0.5
                min-w-[18px] h-[18px] px-1
                flex items-center justify-center
                bg-red-500 text-white text-[10px] font-bold
                rounded-full leading-none
              "
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            className="
              absolute top-full right-0 mt-2 w-96
              bg-white rounded-xl shadow-2xl border border-gray-200
              z-50 overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Bildirimler
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="
                    flex items-center gap-1 text-xs font-medium
                    text-blue-600 hover:text-blue-700
                    transition-colors duration-150
                  "
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tümünü okundu işaretle
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400">
                    Bildirim yok
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Yeni bildirimler burada görünecek
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const isUnread = !n.readAt;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.15 }}
                      onClick={() => isUnread && onMarkRead(n.id)}
                      className={`
                        flex items-start gap-3 px-4 py-3
                        border-b border-gray-50 last:border-b-0
                        transition-colors duration-150 cursor-pointer
                        ${isUnread
                          ? 'bg-blue-50/40 hover:bg-blue-50/70'
                          : 'hover:bg-gray-50'
                        }
                      `}
                    >
                      {/* Type icon */}
                      <div
                        className={`
                          mt-0.5 w-8 h-8 rounded-lg
                          flex items-center justify-center flex-shrink-0
                          ${getIconBg(n.type)}
                        `}
                      >
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`
                            text-sm leading-snug
                            ${isUnread
                              ? 'font-semibold text-gray-900'
                              : 'font-medium text-gray-700'
                            }
                          `}
                        >
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                          {formatRelativeTimeTr(n.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={onClose}
                  className="
                    block w-full text-center px-3 py-2
                    text-sm font-medium text-blue-600
                    hover:bg-blue-50 rounded-lg
                    transition-colors duration-150
                  "
                >
                  Tüm bildirimleri gör
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
