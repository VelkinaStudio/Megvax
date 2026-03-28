'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackEntry {
  id: string;
  type: 'landing';
  name: string;
  email: string;
  message: string;
  category: 'feedback' | 'bug' | 'feature';
  status: 'new';
  createdAt: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackEntry['category']>('feedback');

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (isOpen && !showSuccess) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    const entry: FeedbackEntry = {
      id: generateId(),
      type: 'landing',
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      category,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('megvax_landing_feedback') || '[]');
      localStorage.setItem('megvax_landing_feedback', JSON.stringify([entry, ...existing]));
    } catch {
      localStorage.setItem('megvax_landing_feedback', JSON.stringify([entry]));
    }

    setIsSubmitting(false);
    setShowSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setCategory('feedback');

    // Auto-close after 2s
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
    }, 2000);
  };

  const inputStyles = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors';

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {showSuccess ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                </motion.div>
                <p className="text-lg font-semibold text-gray-900">Thank you!</p>
                <p className="text-sm text-gray-500 mt-1">Your feedback has been sent.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">Send Feedback</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className={inputStyles}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className={inputStyles}
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FeedbackEntry['category'])}
                      className={inputStyles}
                    >
                      <option value="feedback">Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={3}
                      className={`${inputStyles} resize-none`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" />Send</>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setShowSuccess(false); }}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
