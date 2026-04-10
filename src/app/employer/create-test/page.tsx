'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormValues {
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: number;
  negativeMarking: number;
}

// Custom inline resolver — bypasses Zod v3/v4 overload incompatibility
function makeResolver<T extends Record<string, unknown>>(schema: z.ZodTypeAny): Resolver<T> {
  return async (data) => {
    const result = await schema.safeParseAsync(data);
    if (result.success) {
      return { values: result.data as T, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      if (key && !errors[key]) errors[key] = { type: 'validation', message: issue.message };
    }
    return { values: {} as T, errors: errors as any };
  };
}

// Schema — plain z.object, no generic cast needed
const basicInfoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  totalCandidates: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(1, 'At least 1 candidate required')),
  totalSlots: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(1, 'At least 1 slot required')),
  questionSets: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(1, 'At least 1 question set required')),
  questionType: z.string().min(1, 'Select a question type'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(1, 'Duration must be at least 1 minute')),
  negativeMarking: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().min(0))
    .optional()
    .transform((v) => v ?? 0),
});

interface Question {
  id: string;
  title: string;
  type: 'RADIO' | 'CHECKBOX' | 'TEXT';
  options?: string[];
  answer: string | string[];
}

export default function CreateTestPage() {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({ type: 'RADIO', options: [''] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: makeResolver(basicInfoSchema) as any,
    defaultValues: {
      title: '',
      totalCandidates: 0,
      totalSlots: 0,
      questionSets: 1,
      questionType: 'Multiple Choice',
      startTime: '',
      endTime: '',
      duration: 60,
      negativeMarking: 0,
    },
  });


  const onSubmitBasicInfo = () => {
    setStep(2);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.title) return;
    
    const newQuestion: Question = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      title: currentQuestion.title!,
      type: currentQuestion.type as any,
      options: currentQuestion.options?.filter(o => o.trim() !== ''),
      answer: currentQuestion.answer as any || '',
    };

    if (editingId) {
      setQuestions(questions.map(q => q.id === editingId ? newQuestion : q));
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setIsDialogOpen(false);
    setCurrentQuestion({ type: 'RADIO', options: [''] });
    setEditingId(null);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const editQuestion = (q: Question) => {
    setCurrentQuestion(q);
    setEditingId(q.id);
    setIsDialogOpen(true);
  };

  const finalizeTest = async () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form.getValues(),
        questions,
      };
      await axios.post('/api/exams', payload);
      toast.success('Exam created successfully!');
      router.push('/employer/dashboard');
    } catch (error) {
      toast.error('Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Assessment</h1>
          <p className="text-muted-foreground mt-1">Design your test parameters and question sets.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className={cn("size-8 rounded-full flex items-center justify-center font-bold", step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary")}>1</div>
            <div className="w-8 h-0.5 bg-muted"></div>
            <div className={cn("size-8 rounded-full flex items-center justify-center font-bold", step === 2 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary")}>2</div>
        </div>
      </div>

      {step === 1 ? (
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Step 1: Basic Information</CardTitle>
            <CardDescription>Configure the logistics and timing of the exam.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitBasicInfo)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Exam Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Senior Frontend Engineer Test" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCandidates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Candidates</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Slots</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="questionSets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Sets</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                          <SelectItem value="Theory">Theory</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Minutes)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="negativeMarking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative Marking (e.g. 0.25)</FormLabel>
                      <FormControl><Input type="number" step="0.05" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-full flex justify-end pt-4">
                  <Button type="submit" size="lg" className="px-10">
                    Next Step <ChevronRight className="ml-2 size-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Step 2: Question Sets</CardTitle>
              <CardDescription>Add and manage questions for this assessment.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setCurrentQuestion({ type: 'RADIO', options: [''] }); }} className="shadow-md">
                  <Plus className="mr-2 size-4" /> Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Question Title</Label>
                    <Textarea 
                      placeholder="Enter the question text" 
                      value={currentQuestion.title || ''}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <RadioGroup 
                      value={currentQuestion.type} 
                      onValueChange={(val) => setCurrentQuestion({...currentQuestion, type: val as any})}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="RADIO" id="r1" />
                        <Label htmlFor="r1">Single Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CHECKBOX" id="r2" />
                        <Label htmlFor="r2">Multiple Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="TEXT" id="r3" />
                        <Label htmlFor="r3">Typed Answer</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {(currentQuestion.type === 'RADIO' || currentQuestion.type === 'CHECKBOX') && (
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {currentQuestion.options?.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input 
                            placeholder={`Option ${idx + 1}`} 
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(currentQuestion.options || [])];
                              newOpts[idx] = e.target.value;
                              setCurrentQuestion({...currentQuestion, options: newOpts});
                            }}
                          />
                          <Button variant="ghost" size="icon" onClick={() => {
                            const newOpts = currentQuestion.options?.filter((_, i) => i !== idx);
                            setCurrentQuestion({...currentQuestion, options: newOpts});
                          }}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setCurrentQuestion({...currentQuestion, options: [...(currentQuestion.options || []), '']})}>
                         Add Option
                      </Button>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddQuestion}>{editingId ? 'Update' : 'Add Question'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
               <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/30">
                  <p className="text-muted-foreground">No questions added yet. Click "Add Question" to begin.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 border rounded-lg flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{idx + 1}</div>
                      <div>
                        <p className="font-semibold line-clamp-1">{q.title}</p>
                        <p className="text-xs text-muted-foreground">{q.type} Question</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" onClick={() => editQuestion(q)}><Edit2 className="size-4" /></Button>
                       <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
               <ChevronLeft className="mr-2 size-4" /> Back to Info
            </Button>
            <Button 
               size="lg" 
               className="px-12 bg-primary hover:bg-primary/90 shadow-lg"
               onClick={finalizeTest}
               disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Finalize & Create Test
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

