import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    },
    { status }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized: Access token is missing or invalid') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = 'Forbidden: You do not have permission to access this resource') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(message, 404);
}
