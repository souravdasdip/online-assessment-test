'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Submission {
  id: string;
  candidateId: string;
  examId: string;
  violations: number;
  isAutoSubmitted: boolean;
  submittedAt: string;
  answers: any;
}

interface Exam {
  id: string;
  title: string;
}

export default function ExamCandidatesPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const { data: exam } = useQuery<Exam>({
    queryKey: ['exam', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/exams/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ['submissions', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/admin/submissions?examId=${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{exam?.title} - Candidates</h1>
          <p className="text-sm text-muted-foreground">Monitor applicant performance and integrity logs.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <User className="size-4 text-muted-foreground" />
                       Candidate {sub.candidateId.substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.isAutoSubmitted ? (
                      <Badge variant="destructive" className="gap-1 flex w-fit">
                        <AlertCircle className="size-3" /> Auto-Submitted
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 bg-green-600 flex w-fit">
                        <CheckCircle2 className="size-3" /> Completed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={sub.violations > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                      {sub.violations} violations
                    </span>
                  </TableCell>
                  <TableCell>{new Date(sub.submittedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Answers</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Candidate Answers</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {Object.keys(sub.answers || {}).length === 0 ? (
                            <p className="text-muted-foreground text-center p-4">No answers submitted.</p>
                          ) : (
                            Object.entries(sub.answers).map(([qId, ans]) => (
                              <div key={qId} className="p-4 bg-muted/30 rounded-lg border">
                                <p className="font-semibold text-sm mb-2 text-primary">Question ID: {qId}</p>
                                <p className="text-sm bg-white p-3 rounded border">
                                  {Array.isArray(ans) ? ans.join(', ') : String(ans)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {submissions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No submissions found for this exam yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
