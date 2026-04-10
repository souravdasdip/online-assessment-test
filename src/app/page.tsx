import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 sm:text-6xl">
           Elite<span className="text-primary">Assess</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-[600px] mx-auto">
          The next generation of online assessments. Secure, intuitive, and lightning fast.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Employer Portal Entry */}
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase className="size-32" />
          </div>
          <CardHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="size-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Employer Portal</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Create assessments, manage question sets, and track candidate performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Button asChild className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20" size="lg">
              <Link href="/employer/login">
                Access Panel
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Candidate Portal Entry */}
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <GraduationCap className="size-32" />
          </div>
          <CardHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="size-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Candidate Portal</CardTitle>
            <CardDescription className="text-base text-slate-500">
              View assigned tests, monitor timings, and complete assessments securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Button asChild className="w-full h-12 text-lg font-semibold shadow-lg shadow-secondary/20" variant="secondary" size="lg">
              <Link href="/candidate/login">
                Get Started
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-20 text-slate-400 text-sm font-medium">
        &copy; 2026 EliteAssess Platform. All rights reserved.
      </footer>
    </div>
  );
}
