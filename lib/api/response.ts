import { NextResponse } from 'next/server';

type ApiResponse<T> = {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, error: null },
    { status },
  );
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json<ApiResponse<null>>(
    { success: false, data: null, error: message },
    { status },
  );
}
