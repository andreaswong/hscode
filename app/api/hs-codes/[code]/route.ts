import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const hsCode = await prisma.hsCode.findUnique({
      where: { hsCode: code },
      include: {
        hsCaControls: {
          include: {
            caRelation: true,
          },
        },
        hsProductMappings: {
          include: {
            productCodeRelation: {
              include: {
                productCaControls: {
                  include: {
                    caRelation: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hsCode) {
      return NextResponse.json(
        { error: 'HS Code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hsCode);
  } catch (error) {
    console.error('Error fetching HS code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HS code' },
      { status: 500 }
    );
  }
}
