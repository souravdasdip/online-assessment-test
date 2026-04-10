import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    
    const db = readDB();
    
    let submissions = db.submissions || [];
    
    if (examId) {
      submissions = submissions.filter((sub: any) => sub.examId === examId);
    }

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
