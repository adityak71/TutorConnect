"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarLink[];
  title: string;
}

export function DashboardLayout({ children, links, title }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-16rem)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white dark:bg-black/40 rounded-2xl p-5 border border-white/20 dark:border-white/5 shadow-xs">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-5 px-3">{title}</h2>
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
