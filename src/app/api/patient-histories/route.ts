import { NextResponse } from 'next/server';
import { API_BASE } from '@/utilities/constants';

// It's a good practice to use an environment variable for the backend URL.
// You can create a .env.local file in your project root and add:
// API_URL=http://localhost:8000
const API_URL = process.env.API_URL || API_BASE;

export async function GET() {
  try {
    // Forward the request to the external backend API
    const response = await fetch(`${API_URL}/patient-histories`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // In a real-world scenario, you might want to handle caching strategies
      cache: 'no-store',
    });

    if (!response.ok) {
      // If the backend API response is not successful, forward the error
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    // Handle network errors or other issues when trying to reach the backend API
    console.error('Error proxying to backend API:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Could not connect to the backend service.' }),
      { status: 502 } // 502 Bad Gateway is appropriate here
    );
  }
}
