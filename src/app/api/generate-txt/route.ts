import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { domain, walletAddress } = await request.json();

    if (!domain || !walletAddress) {
      return NextResponse.json({ error: 'Domain and wallet address are required' }, { status: 400 });
    }

    // Generate a unique, secure token for the TXT record.
    // For the MVP, we'll create a simple hash. A real implementation might involve a more complex, signed structure.
    const randomString = crypto.randomBytes(16).toString('hex');
    const verificationToken = `orbiter-verification=${walletAddress}-${randomString}`;

    // In a real application, you would store this token, linking it to the domain and user
    // for the verification step. For the MVP, we will pass it back to the client to use in the verify step.

    return NextResponse.json({
      domain,
      txtRecordName: '_orbiter_verification',
      txtRecordValue: verificationToken
    });

  } catch (error) {
    console.error('Error generating TXT record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}