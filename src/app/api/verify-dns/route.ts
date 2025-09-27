import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';

export async function POST(request: Request) {
  try {
    const { domain, recordName, expectedValue } = await request.json();

    if (!domain || !recordName || !expectedValue) {
      return NextResponse.json({ error: 'Domain, record name, and expected value are required' }, { status: 400 });
    }

    const fullDomain = `${recordName}.${domain}`;
    let txtRecords: string[][] = [];

    try {
      txtRecords = await dns.resolveTxt(fullDomain);
    } catch (error: any) {
      // If the domain or record does not exist, the DNS query will fail.
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        return NextResponse.json({ verified: false, message: 'DNS record not found.' }, { status: 200 });
      }
      throw error; // For other errors, we let the outer catch block handle it.
    }

    // The result from resolveTxt is an array of arrays of strings.
    // We need to flatten it and check if any of the records match the expected value.
    const found = txtRecords.flat().some(record => record === expectedValue);

    if (found) {
      return NextResponse.json({ verified: true, message: 'Domain ownership verified successfully.' });
    } else {
      return NextResponse.json({ verified: false, message: 'TXT record found, but the value does not match.' });
    }

  } catch (error) {
    console.error('Error verifying DNS record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}