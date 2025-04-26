import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getCached, setCache } from '@/utils/cache';

const RAPIDAPI_URL = 'https://exercisedb.p.rapidapi.com';

interface ExerciseApiError {
  error: string;
}

/// Fetch data from the API with caching
async function fetchFromApi(endpoint: string) {
  const cacheKey = `exercise_${endpoint}`;
  const cachedData = getCached(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const response = await axios.get(`${RAPIDAPI_URL}${endpoint}`, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
  });

  setCache(cacheKey, response.data);
  return response.data;
}

// Handle GET requests to the API
export async function GET(request: NextRequest) {
  try {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const param = searchParams.get('param');

    let endpoint = '/exercises';

    if (type && param) {
      switch (type) {
        case 'bodyPart':
          endpoint = `/exercises/bodyPart/${param}`;
          break;
        case 'equipment':
          endpoint = `/exercises/equipment/${param}`;
          break;
        case 'target':
          endpoint = `/exercises/target/${param}`;
          break;
        case 'name':
          endpoint = `/exercises/name/${param}`;
          break;
        case 'id':
          endpoint = `/exercises/exercise/${param}`;
          break;
      }
    } else if (type && !param) {
      switch (type) {
        case 'bodyPartList':
          endpoint = '/exercises/bodyPartList';
          break;
        case 'equipmentList':
          endpoint = '/exercises/equipmentList';
          break;
        case 'targetList':
          endpoint = '/exercises/targetList';
          break;
      }
    }

    const data = await fetchFromApi(endpoint);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('Exercise API error:', error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch exercises';
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