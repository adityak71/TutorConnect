"use client";

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { LayoutDashboard, CalendarDays, BookOpen, TrendingUp, UserCircle } from 'lucide-react';

const studentLinks = [
  { href: '/student', label: 'Overview', icon: LayoutDashboard },
  { href: '/student/sessions', label: 'My Sessions', icon: BookOpen },
  { href: '/student/book', label: 'Book Session', icon: CalendarDays },
  { href: '/student/progress', label: 'Learning Progress', icon: TrendingUp },
  { href: '/student/profile', label: 'Edit Profile', icon: UserCircle },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={studentLinks} title="Student Dashboard">
      {children}
    </DashboardLayout>
  );
}
