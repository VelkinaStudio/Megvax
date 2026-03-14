'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Users, Receipt, CreditCard, ScrollText } from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/admin/overview', icon: BarChart2 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
  { label: 'Audit', href: '/admin/audit', icon: ScrollText },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={
        `
        w-64 bg-brand-white border-r-3 border-brand-black flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-hard transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `
      }
    >
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-black tracking-tighter">MEGVAX</h1>
            <span className="text-xs font-bold bg-paper-white text-brand-black/70 px-2 py-0.5 rounded-[2px] border-2 border-brand-black uppercase tracking-wide">
              Admin
            </span>
          </div>
          <button onClick={onClose} className="md:hidden text-brand-black/70 hover:text-brand-black">
            Close
          </button>
        </div>

        <div className="border-2 border-brand-black rounded-[2px] p-3 bg-paper-white">
          <p className="text-xs font-bold text-brand-black/70 uppercase">Mode</p>
          <p className="text-sm font-bold text-brand-black mt-1">Internal</p>
          <p className="text-xs text-brand-black/70 mt-1">Stripe data (sample)</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={
                `
                flex items-center gap-3 px-3 py-2.5 rounded-[2px] text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-brand-black text-brand-white' : 'text-brand-black/70 hover:bg-paper-white hover:text-brand-black'}
              `
              }
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-brand-black">
        <Link
          href="/app/dashboard"
          className="flex items-center justify-between gap-3 p-2 rounded-[2px] hover:bg-paper-white transition-colors border border-transparent hover:border-brand-black"
        >
          <div>
            <p className="text-sm font-bold text-brand-black">User Dashboard</p>
            <p className="text-xs text-brand-black/70">/app/dashboard</p>
          </div>
          <span className="text-xs font-bold underline underline-offset-2">Git</span>
        </Link>
      </div>
    </aside>
  );
}
