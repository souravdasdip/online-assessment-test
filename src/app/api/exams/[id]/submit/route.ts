import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { answers, violations, isAutoSubmitted } = await req.json();
    const db = readDB();

    const submission = {
      id: uuidv4(),
      examId: id,
      candidateId: 'temp-candidate-id',
      answers,
      violations,
      isAutoSubmitted,
      submittedAt: new Date().toISOString(),
    };

    db.submissions.push(submission);
    writeDB(db);

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}
