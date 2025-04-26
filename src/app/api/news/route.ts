import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.NEWS_API_KEY || !process.env.NEWS_API_URL) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const response = await axios.get(`${process.env.NEWS_API_URL}/top-headlines`, {
      params: {
        category: 'health',
        language: 'en',
        pageSize: 10,
      },
      headers: {
        'X-Api-Key': process.env.NEWS_API_KEY,
      },
    });

    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('News API error:', error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch news';
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      { error: errorMessage },
      {
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}