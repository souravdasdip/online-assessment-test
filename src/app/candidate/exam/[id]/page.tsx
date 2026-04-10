'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { useBehavioralTracking } from '@/hooks/use-behavioral-tracking';
import { Loader2, AlertTriangle, Maximize2, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useAuthStore } from '@/store/auth-store';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Question {
  id: string;
  title: string;
  type: 'RADIO' | 'CHECKBOX' | 'TEXT';
  options?: string[];
}

interface Exam {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export default function ExamPage() {
  const params = useParams();
  const examId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [violations, setViolations] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [isTimeoutDialogOpen, setIsTimeoutDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);
  const [lastViolationType, setLastViolationType] = useState('');

  const { data: exam, isLoading } = useQuery<Exam>({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/exams/${examId}`);
      return data;
    },
    enabled: !!examId,
  });

  const submitExam = useCallback(async (isAuto: boolean = false) => {
    setIsSubmitting((prev) => {
      if (prev) return prev;
      return true;
    });

    try {
      await axios.post(`/api/exams/${examId}/submit`, {
        answers,
        violations,
        isAutoSubmitted: isAuto,
      });
      if (document.fullscreenElement) document.exitFullscreen();
      
      if (isAuto) {
        setIsTimeoutDialogOpen(true);
      } else {
        setIsExamSubmitted(true);
      }
    } catch {
      toast.error('Failed to submit. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, answers, violations]);

  const handleTimeUp = useCallback(() => {
    submitExam(true);
  }, [submitExam]);

  const { formatTime, timeLeft } = useExamTimer(exam?.duration ?? 0, handleTimeUp);

  const handleViolation = useCallback((type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT') => {
    if (!isExamStarted || isExamSubmitted) return;
    setViolations((v) => {
      const next = v + 1;
      if (next >= 3) submitExam(true);
      return next;
    });
    setLastViolationType(type === 'TAB_SWITCH' ? 'Tab Switch' : 'Fullscreen Exit');
    setIsViolationDialogOpen(true);
  }, [isExamStarted, isExamSubmitted, submitExam]);

  useBehavioralTracking(handleViolation);

  const startExam = () => {
    document.documentElement.requestFullscreen().catch(() => {});
    setIsExamStarted(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return <div className="p-10 text-center text-muted-foreground">Exam not found.</div>;
  }

  const currentQuestion = exam.questions[currentIdx];

  // COMPLETED STATE
  if (isExamSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-4xl py-12 shadow-sm border-0 bg-white rounded-2xl flex flex-col items-center text-center">
           <div className="size-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
             <BadgeCheck className="size-10 text-blue-500" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Completed</h2>
           <p className="text-gray-500 font-medium mb-8 max-w-xl mx-auto text-sm">
             Congratulations! {user?.name || 'Applicant'}, You have completed your Exam for {exam.title}. Thank you for participating.
           </p>
           <Button onClick={() => router.push('/candidate/dashboard')} variant="outline" className="px-6 h-10 font-bold rounded-lg hover:bg-slate-50">
             Back to Dashboard
           </Button>
        </Card>
      </div>
    );
  }

  // PRE-EXAM INSTRUCTIONS
  if (!isExamStarted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-xl w-full shadow-lg border-t-4 border-t-primary bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{exam.title}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {exam.questions.length} questions · {exam.duration} minutes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-2">
                <AlertTriangle className="size-4" /> Academic Integrity Notice
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Do not switch tabs or leave this window.</li>
                <li>Fullscreen mode will be activated on start.</li>
                <li>Every violation is logged and shared with the employer.</li>
                <li>3 violations will trigger an automatic submission.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full h-12 text-base font-semibold shadow-lg bg-primary hover:opacity-90" onClick={startExam}>
              <Maximize2 className="size-5 mr-2" /> Start Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ACTIVE EXAM STATE
  return (
    <div className="w-full max-w-[900px] mx-auto px-4 md:px-0">
      {/* Top Banner mapping to UI design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between mb-6">
         <span className="font-bold text-gray-700 ml-2">Question ({currentIdx + 1}/{exam.questions.length})</span>
         <div className="bg-[#f0f2f5] px-4 py-2 rounded-lg font-bold text-gray-800 text-[15px]">
            {formatTime()} left
         </div>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden">
         <CardContent className="p-8">
            <div className="mb-8">
               <h3 className="text-[17px] font-bold text-gray-800 leading-relaxed mb-1">
                 Q{currentIdx + 1}. {currentQuestion?.title}
               </h3>
               {currentQuestion?.type === 'CHECKBOX' && (
                  <p className="text-sm text-gray-500 font-medium">(Select all that apply)</p>
               )}
            </div>

            {/* Answer Region */}
            {currentQuestion?.type === 'RADIO' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))}
                className="space-y-4"
              >
                {currentQuestion.options?.map((opt, i) => (
                  <div key={i} onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }))} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={opt} id={`q-${i}`} className="border-gray-300 text-primary" />
                    <Label htmlFor={`q-${i}`} className="flex-1 cursor-pointer font-medium text-gray-600 text-sm">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion?.type === 'CHECKBOX' && (
              <div className="space-y-4">
                {currentQuestion.options?.map((opt, i) => {
                  const currentAnswers: string[] = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                  return (
                    <div key={i} onClick={() => {
                        const newAnswers = currentAnswers.includes(opt)
                          ? currentAnswers.filter((a) => a !== opt)
                          : [...currentAnswers, opt];
                        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: newAnswers }));
                      }} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      <Checkbox id={`c-${i}`} checked={currentAnswers.includes(opt)} className="border-gray-300 text-primary data-[state=checked]:bg-primary" />
                      <Label htmlFor={`c-${i}`} className="flex-1 cursor-pointer font-medium text-gray-600 text-sm">
                        {opt}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion?.type === 'TEXT' && (
              <div className="border border-gray-200 rounded-xl overflow-hidden [&_.ql-toolbar]:bg-gray-50/80 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-none">
                <ReactQuill 
                  theme="snow"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))}
                  placeholder="Type questions here.."
                  className="bg-white"
                  style={{ minHeight: '200px' }}
                />
              </div>
            )}
            
         </CardContent>
         <CardFooter className="p-6 border-t border-gray-50 flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0">
             <Button
               variant="outline"
               onClick={() => setCurrentIdx((i) => i < exam.questions.length - 1 ? i + 1 : i)}
               className="h-12 md:h-11 px-6 rounded-lg font-bold text-gray-600 border-gray-200 hover:bg-gray-100"
             >
               Skip this Question
             </Button>

             {currentIdx === exam.questions.length - 1 ? (
               <Button
                 className="h-12 md:h-11 px-8 shadow-md rounded-lg font-bold bg-[#6138fe] hover:bg-[#522ce0] hover:opacity-90 transition-all text-white"
                 onClick={() => submitExam(false)}
                 disabled={isSubmitting}
               >
                 {isSubmitting ? <Loader2 className="animate-spin size-4" /> : 'Submit'}
               </Button>
             ) : (
               <Button 
                 onClick={() => setCurrentIdx((i) => i + 1)} 
                 className="h-12 md:h-11 px-8 shadow-md rounded-lg font-bold bg-[#6138fe] hover:bg-[#522ce0] hover:opacity-90 transition-all text-white"
               >
                 Save & Continue
               </Button>
             )}
         </CardFooter>
      </Card>

      {/* Violation dialog hidden in background */}
      <Dialog open={isViolationDialogOpen} onOpenChange={setIsViolationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" /> Integrity Violation Detected
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              A <span className="font-semibold text-foreground">{lastViolationType}</span> was
              detected and has been recorded.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1.5">
            <p>Please return to the exam window and stay in fullscreen mode.</p>
            <p className="font-semibold text-destructive">
              {Math.max(0, 3 - violations)} remaining warning(s) before automatic submission.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsViolationDialogOpen(false)}>
              I Understand — Return to Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Auto-Submit / Timeout Dialog */}
      <Dialog open={isTimeoutDialogOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-[420px] rounded-2xl p-0 overflow-hidden text-center justify-center items-center flex flex-col py-10 [&>button]:hidden">
          <div className="relative mb-2 mt-4">
             {/* Base Clock */}
             <div className="size-16 bg-blue-50/50 rounded-full flex items-center justify-center relative">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
             </div>
             {/* Red X Badge overlaid */}
             <div className="absolute -bottom-1 -right-1 size-7 bg-red-500 rounded-full flex items-center justify-center text-white border-[3px] border-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
                </svg>
             </div>
          </div>
          
          <h2 className="text-[22px] font-extrabold text-gray-800 tracking-tight mt-3">Timeout!</h2>
          <p className="text-[#64748b] text-[13.5px] leading-relaxed max-w-sm mx-auto px-6 font-medium mt-1 mb-8">
            Dear {user?.name || 'Applicant'}, Your exam time has been finished. Thank you for participating.
          </p>
          
          <Button 
            variant="outline" 
            className="px-8 h-[42px] font-bold text-gray-700 rounded-xl hover:bg-gray-100 border-gray-200 transition-colors shadow-sm text-[13px]"
            onClick={() => {
              setIsTimeoutDialogOpen(false);
              router.push('/candidate/dashboard');
            }}
          >
            Back to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
