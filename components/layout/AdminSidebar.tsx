'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  Award,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
    { label: 'Departments', href: '/admin/departments', icon: Building2 },
    { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { label: 'Examinations', href: '/admin/examinations', icon: FileSpreadsheet },
    { label: 'Fees', href: '/admin/fees', icon: CreditCard },
    { label: 'Academic Records', href: '/admin/records', icon: Award },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
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
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">EduManage</span>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">Admin Portal</p>
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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

      {/* Footer / Logout */}
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
