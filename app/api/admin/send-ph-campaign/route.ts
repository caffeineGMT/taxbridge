import { NextRequest, NextResponse } from 'next/server';
import { sendBulkPHVoterEmails, type PHVoter } from '@/lib/email/product-hunt-campaign';
import Papa from 'papaparse';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * API endpoint to send bulk emails to Product Hunt voters
 *
 * POST /api/admin/send-ph-campaign
 *
 * Body: FormData with:
 * - emailList: CSV file (columns: firstName, email)
 * - phRank: Product Hunt rank
 * - phUpvotes: Total upvotes
 * - phUrl: Product Hunt URL
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const emailListFile = formData.get('emailList') as File;
    const phRank = formData.get('phRank') as string;
    const phUpvotes = formData.get('phUpvotes') as string;
    const phUrl = formData.get('phUrl') as string;

    if (!emailListFile) {
      return NextResponse.json(
        { error: 'Email list CSV file is required' },
        { status: 400 }
      );
    }

    if (!phRank || !phUpvotes || !phUrl) {
      return NextResponse.json(
        { error: 'Product Hunt stats (rank, upvotes, URL) are required' },
        { status: 400 }
      );
    }

    // Parse CSV
    const csvText = await emailListFile.text();
    const parseResult = Papa.parse<{ firstName: string; email: string }>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV', details: parseResult.errors },
        { status: 400 }
      );
    }

    const voters = parseResult.data;

    if (voters.length === 0) {
      return NextResponse.json(
        { error: 'No voters found in CSV file' },
        { status: 400 }
      );
    }

    // Validate email addresses
    const validVoters = voters.filter(voter => {
      return voter.email && voter.email.includes('@');
    });

    if (validVoters.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses found in CSV' },
        { status: 400 }
      );
    }

    // Set environment variables temporarily for this request
    process.env.PH_LAUNCH_RANK = phRank;
    process.env.PH_LAUNCH_UPVOTES = phUpvotes;
    process.env.PH_LAUNCH_URL = phUrl;

    // Send bulk emails
    const result = await sendBulkPHVoterEmails(validVoters);

    return NextResponse.json({
      success: true,
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      invalidEmails: voters.length - validVoters.length,
    });

  } catch (error) {
    return handleApiError(error, { route: '/api/admin/send-ph-campaign', method: request.method });
  }
}
