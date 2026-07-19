"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '@/services/api';
import { User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // We'll re-fetch the user if the pathname changes as a simple way to update state after login
  const { data: userResponse, refetch } = useQuery({
    queryKey: ['currentUser', pathname],
    queryFn: getCurrentUser,
    retry: false,
  });

  const user: User | null = userResponse?.data || null;

  const handleLogout = async () => {
    await logout();
    refetch();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/tutors', label: 'Find a Tutor' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-4 z-50 w-full mx-auto max-w-7xl px-4 transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-6 rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-primary to-blue-400 text-white p-1.5 rounded-xl shadow-lg shadow-primary/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">TutorConnect</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href={`/${user.role}`}>
                <Button variant="ghost" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background p-4 absolute top-16 left-0 right-0 shadow-lg">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                <Link href={`/${user.role}`} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <UserIcon className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
