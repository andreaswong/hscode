import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const chapters = await prisma.hsCode.findMany({
      where: {
        chapter: { not: null }
      },
      select: {
        chapter: true
      },
      distinct: ['chapter'],
      orderBy: {
        chapter: 'asc'
      }
    });

    const chapterList = chapters.map(c => c.chapter).filter(Boolean);

    return NextResponse.json(chapterList);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
