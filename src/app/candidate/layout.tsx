'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Phone, Mail, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/candidate/login') return;
    if (!isAuthenticated || user?.role !== 'CANDIDATE') {
      router.push('/candidate/login');
    }
  }, [isAuthenticated, user, router, pathname]);

  const isExamScreen = pathname?.includes('/candidate/exam/');

  if (pathname === '/candidate/login') {
    return (
      <>
        {children}
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (!isAuthenticated || user?.role !== 'CANDIDATE') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fc] font-sans">
      <header className="h-[72px] bg-white border-b border-gray-100 flex items-center shadow-sm z-50 shrink-0 w-full relative justify-between md:justify-center px-4 md:px-12">
        <div className="flex items-center md:absolute md:left-12">
          <img src="/logo.png" alt="Akij Resource Logo" className="h-8 md:h-10 w-auto object-contain" />
        </div>

        {!isExamScreen && (
          <span className="hidden sm:inline-block ml-10 text-sm font-bold text-gray-700 tracking-wide">
            Dashboard
          </span>
        )}

        {isExamScreen && (
          <div className="flex-1 flex items-center justify-center pointer-events-none absolute left-0 right-0 z-0">
            <span className="text-[15px] md:text-[17px] font-bold text-gray-700 tracking-wide pointer-events-auto">Akij Resource</span>
          </div>
        )}

        {/* Profile */}
        <div className="flex items-center z-10 md:absolute md:right-12">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 outline-none hover:opacity-80 transition-opacity">
              <div className="size-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                <UserIcon className="size-5" />
              </div>
              <div className="hidden sm:flex flex-col items-start gap-0.5">
                <span className="text-[13px] font-bold text-gray-800 leading-none">{user.name}</span>
                <span className="text-[10px] text-gray-500 font-medium leading-none">Ref.ID: {user.id || '12341341'}</span>
              </div>
              <ChevronDown className="size-4 text-gray-400 hidden sm:block ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-xl border-0 ring-1 ring-black/5">
              <DropdownMenuItem onClick={() => { logout(); router.push('/candidate/login'); }} className="text-destructive font-medium cursor-pointer p-3">
                <LogOut className="size-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-6 pb-12 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f111a] text-white flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-12 py-8 md:py-0 md:h-[60px] text-xs font-medium w-full shrink-0 gap-6 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
          <span className="text-gray-400 font-normal">Powered by</span>
          <img src="/logo.png" alt="Akij Resource Logo" className="h-6 md:h-5 w-auto object-contain brightness-0 invert opacity-90 mt-1 md:mt-0" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-gray-300">
          <span className="text-gray-400 font-normal block md:hidden mb-1">Helpline</span>
          <div className="flex items-center gap-2 md:gap-1.5 hover:text-white transition-colors cursor-pointer text-[13px] md:text-[11px]">
            <Phone className="size-4 md:size-3.5" />
            <span>+88 021051515510</span>
          </div>
          <div className="flex items-center gap-2 md:gap-1.5 hover:text-white transition-colors cursor-pointer text-[13px] md:text-[11px]">
            <Mail className="size-4 md:size-3.5" />
            <span>support@akij.work</span>
          </div>
        </div>
      </footer>
      <Toaster position="top-center" richColors />
    </div>
  );
}
