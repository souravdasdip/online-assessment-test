'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Phone, Mail } from 'lucide-react';

export default function EmployerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { user, token } = response.data;

      if (user.role !== 'EMPLOYER') {
        toast.error('Unauthorized. This login is for employers only.');
        setIsLoading(false);
        return;
      }

      login(user, token);
      toast.success('Logged in successfully!');
      router.push('/employer/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] font-sans">
      {/* Header */}
      <header className="h-[72px] bg-white flex items-center px-4 md:px-12 relative shadow-sm z-10 w-full justify-between md:justify-center">
        {/* Left Logo */}
        <div className="flex items-center md:absolute md:left-12">
           <img src="/logo.png" alt="Akij Resource Logo" className="h-8 md:h-10 w-auto object-contain" />
        </div>
        
        {/* Center Title */}
        <div className="text-[15px] md:text-[17px] font-bold text-gray-700 tracking-wide pt-1">
          Akij Resource
        </div>
        
        {/* Mobile Spacing compensation */}
        <div className="w-16 md:hidden"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-[520px] shadow-2xl border-0 rounded-2xl bg-white pt-6 pb-4">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-800/90 tracking-wide">Sign In</h1>
            <p className="text-xs text-muted-foreground mt-1">Employer Portal</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8 md:px-12">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[13px] font-semibold text-gray-700">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your primary email address" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-12 bg-[#fafafa] border-gray-200 focus-visible:ring-primary shadow-sm"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-[13px] font-semibold text-gray-700">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-12 bg-[#fafafa] border-gray-200 focus-visible:ring-primary shadow-sm"
                />
              </div>
              
              <div className="flex justify-end pt-1">
                <a href="#" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
                  Forget Password?
                </a>
              </div>
              
              <div className="pt-3 pb-4">
                <Button 
                  className="w-full h-12 text-sm font-semibold tracking-wide bg-[#6138fe] hover:bg-[#522ce0] text-white shadow-md transition-all rounded-lg" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Submit'}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground mt-4 italic opacity-60">
                   Demo: employer@test.com / password123
                </p>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f111a] text-white flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-10 py-8 md:py-0 md:h-[60px] text-xs font-medium w-full mt-auto gap-6 md:gap-0">
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
    </div>
  );
}
