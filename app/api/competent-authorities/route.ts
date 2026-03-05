import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    const where: any = {};
    
    if (query) {
      where.OR = [
        { caCode: { contains: query, mode: 'insensitive' } },
        { caName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const cas = await prisma.competentAuthority.findMany({
      where,
      include: {
        _count: {
          select: {
            hsCaControls: true,
            productCaControls: true,
          },
        },
      },
      orderBy: { caCode: 'asc' },
    });

    return NextResponse.json(cas);
  } catch (error) {
    console.error('Error fetching competent authorities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competent authorities' },
      { status: 500 }
    );
  }
}
