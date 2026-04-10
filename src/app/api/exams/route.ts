import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const db = readDB();
    return NextResponse.json(db.exams);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDB();

    const newExam = {
      id: uuidv4(),
      ...body,
      questions: body.questions || [],
      createdAt: new Date().toISOString(),
    };

    db.exams.push(newExam);
    writeDB(db);

    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
