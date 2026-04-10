'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, FileText, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: number;
}

const fetchExams = async (): Promise<Exam[]> => {
  const { data } = await axios.get('/api/exams');
  return data;
};

export default function EmployerDashboard() {
  const { data: exams, isLoading, isError } = useQuery({
    queryKey: ['exams'],
    queryFn: fetchExams,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <p className="text-destructive font-medium">Failed to load exams.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Assessments</h1>
          <p className="text-muted-foreground mt-1">Manage your online tests and candidate progress.</p>
        </div>
        <Button asChild className="shadow-lg h-11 px-6">
          <Link href="/employer/create-test">
            Create New Test
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams?.map((exam) => (
          <Card key={exam.id} className="group hover:border-primary/50 transition-all shadow-sm hover:shadow-md border-2 border-transparent bg-card">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <Badge variant={new Date(exam.endTime) > new Date() ? 'default' : 'secondary'} className="mb-2">
                   {new Date(exam.endTime) > new Date() ? 'Live' : 'Completed'}
                </Badge>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{exam.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 pt-1">
                 <Calendar className="size-3.5" />
                 {new Date(exam.startTime).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                  <Users className="size-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Candidates</p>
                    <p className="text-sm font-bold">{exam.totalCandidates}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                  <Calendar className="size-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Slots</p>
                    <p className="text-sm font-bold">{exam.totalSlots}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                  <FileText className="size-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sets</p>
                    <p className="text-sm font-bold">{exam.questionSets}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                  <Clock className="size-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-bold">{exam.duration}m</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full group/btn" asChild>
                <Link href={`/employer/exams/${exam.id}`}>
                  View Candidates <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {exams?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl border-muted">
            <p className="text-muted-foreground">No assessments found. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
