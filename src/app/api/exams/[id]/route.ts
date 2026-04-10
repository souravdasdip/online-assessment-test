import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = readDB();
    const exam = db.exams.find((e: any) => e.id === id);

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const db = readDB();
    const index = db.exams.findIndex((e: any) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    db.exams[index] = { ...db.exams[index], ...body };
    writeDB(db);

    return NextResponse.json(db.exams[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = readDB();
    const filteredExams = db.exams.filter((e: any) => e.id !== id);

    if (db.exams.length === filteredExams.length) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    db.exams = filteredExams;
    writeDB(db);

    return NextResponse.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
