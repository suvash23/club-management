import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Calendar,
  BarChart3,
  User,
  Award,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/members', label: 'Members', icon: Users },
    { to: '/admin/plans', label: 'Membership Plans', icon: Award },
    { to: '/admin/payments', label: 'Payments & Invoices', icon: Receipt },
    { to: '/admin/events', label: 'Events & Activities', icon: Calendar },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const memberLinks = [
    { to: '/member/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/member/profile', label: 'My Profile & Card', icon: User },
    { to: '/member/membership', label: 'My Membership Plan', icon: Award },
    { to: '/member/payments', label: 'Payment History', icon: Receipt },
    { to: '/member/events', label: 'Club Events & RSVP', icon: Calendar },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {isAdmin ? 'Administration' : 'Member Workspace'}
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-100 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
        <p className="font-bold text-slate-700 mb-0.5">Club Management System</p>
        <p>PostgreSQL & NestJS Powered</p>
      </div>
    </aside>
  );
};
