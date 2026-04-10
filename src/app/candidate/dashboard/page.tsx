'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Clock, FileText, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  duration: number;
  questions: any[];
  negativeMarking: number;
  startTime: string;
  endTime: string;
}

const fetchExams = async (): Promise<Exam[]> => {
  const { data } = await axios.get('/api/exams');
  return data;
};

export default function CandidateDashboard() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ['available-exams'],
    queryFn: fetchExams,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // To match the visual mock exactly, we ensure elements are pristine and bordered
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-0 mt-2">
      <div className="bg-white border rounded-lg shadow-sm p-5 md:p-8 min-h-[600px] flex flex-col">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Online Tests</h1>
          
          <div className="relative w-full sm:w-[320px]">
             <input 
               type="text" 
               placeholder="Search by exam title" 
               className="w-full h-10 pl-4 pr-10 text-[13px] bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors text-gray-600 placeholder:text-gray-400"
             />
             <Search className="size-4 text-primary absolute right-3 top-3" />
          </div>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-1 content-start">
          {exams?.map((exam) => {
            const isUpcoming = new Date(exam.startTime) > new Date();
            const isExpired = new Date(exam.endTime) < new Date();
            const isActive = !isUpcoming && !isExpired;

            return (
              <Card key={exam.id} className="rounded-xl border-dashed border border-gray-200 bg-[#fbfbfe]/50 shadow-none hover:border-gray-300 transition-colors">
                <CardContent className="p-6">
                   <h2 className="text-[15px] font-bold text-gray-800 leading-tight mb-4 min-h-[44px]">
                     {exam.title}
                   </h2>
                   
                   <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500 font-medium mb-6">
                     <div className="flex items-center gap-1.5">
                       <Clock className="size-[14px]" />
                       <span>Duration: {exam.duration} min</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <FileText className="size-[14px]" />
                       <span>Question: {exam.questions?.length}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <XCircle className="size-[14px]" />
                       <span>Negative Marking: {exam.negativeMarking > 0 ? `-${exam.negativeMarking}/wrong` : 'None'}</span>
                     </div>
                   </div>

                   <Button 
                     asChild 
                     variant="outline"
                     disabled={!isActive}
                     className="h-9 px-12 rounded-full border border-primary text-primary font-semibold text-[13px] hover:bg-primary hover:text-white transition-all pointer-events-auto shadow-sm"
                   >
                     <Link href={isActive ? `/candidate/exam/${exam.id}` : '#'}>
                       Start
                     </Link>
                   </Button>
                </CardContent>
              </Card>
            );
          })}

          {exams?.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <p className="text-gray-400 text-sm">No assessments assigned to you at this time.</p>
            </div>
          )}
        </div>

        {/* Pagination mock */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1">
            <button className="h-6 w-6 flex items-center justify-center hover:bg-gray-100 rounded">&lt;</button>
            <button className="h-6 w-6 flex items-center justify-center bg-gray-100/50 rounded font-bold text-gray-800">1</button>
            <button className="h-6 w-6 flex items-center justify-center hover:bg-gray-100 rounded">&gt;</button>
          </div>
          <div className="flex items-center gap-2">
            <span>Online Test Per Page</span>
            <select className="border border-gray-200 rounded px-2 h-6 outline-none bg-transparent">
               <option>4</option>
               <option>8</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
