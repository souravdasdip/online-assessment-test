'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, PlusCircle, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/employer/login' && (!isAuthenticated || user?.role !== 'EMPLOYER')) {
      router.push('/employer/login');
    }
  }, [isAuthenticated, user, router, pathname]);

  if (pathname === '/employer/login') {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  if (!isAuthenticated || user?.role !== 'EMPLOYER') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Create Test', href: '/employer/create-test', icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold text-primary tracking-tight">Employer Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="size-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-4 mb-2">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="size-4 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              router.push('/employer/login');
            }}
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-8 md:justify-end">
           <div className="md:hidden">
              <span className="font-bold text-primary">Employer Panel</span>
           </div>
           {/* Mobile menu could go here */}
        </header>
        <main className="flex-1 overflow-auto bg-muted/10">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
