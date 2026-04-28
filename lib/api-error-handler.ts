import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: 'Invalid request format',
        details: error.message,
        code: 'INVALID_JSON',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  
  return NextResponse.json(
    {
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? message : undefined,
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
