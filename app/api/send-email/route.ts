import { NextRequest, NextResponse } from 'next/server';
import { sendCEOReport } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/send-email
 * API endpoint for CEO Agent to send reports via email
 * 
 * Body: {
 *   subject: string,
 *   html: string,
 *   text?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { subject, html, text } = await request.json();

    if (!subject || !html) {
      return NextResponse.json(
        { error: 'Subject and HTML body are required' },
        { status: 400 }
      );
    }

    const result = await sendCEOReport(subject, html, text);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
