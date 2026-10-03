'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  CreditCard,
  GraduationCap,
  LogOut,
  X,
  History,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const StudentSidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Personal Profile', href: '/student/profile', icon: User },
    { label: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
    { label: 'Exam Timetable', href: '/student/exams', icon: FileSpreadsheet },
    { label: 'Results & Grades', href: '/student/results', icon: Award },
    { label: 'Fee Status', href: '/student/fees', icon: CreditCard },
    { label: 'Academic History', href: '/student/records', icon: History },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      <div>
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">EduManage</span>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-sky-400">Student Portal</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
