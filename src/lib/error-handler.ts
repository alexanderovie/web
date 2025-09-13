import { NextResponse } from "next/server";

export interface AppError extends Error {
  code: string;
  statusCode: number;
  isOperational: boolean;
  context?: Record<string, any>;
}

export class GoogleAPIError extends Error implements AppError {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;
  public context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "GOOGLE_API_ERROR",
    context?: Record<string, any>,
  ) {
    super(message);
    this.name = "GoogleAPIError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.context = context;
  }
}

export class AuthenticationError extends Error implements AppError {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
    this.code = "AUTH_ERROR";
    this.statusCode = 401;
    this.isOperational = true;
  }
}

export class ValidationError extends Error implements AppError {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;
  public context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "ValidationError";
    this.code = "VALIDATION_ERROR";
    this.statusCode = 400;
    this.isOperational = true;
    this.context = context;
  }
}

export function createErrorResponse(error: AppError | Error): NextResponse {
  const isAppError = "code" in error && "statusCode" in error;

  const errorResponse = {
    success: false,
    error: isAppError ? (error as AppError).code : "INTERNAL_ERROR",
    message: error.message,
    ...(isAppError &&
      (error as AppError).context && { context: (error as AppError).context }),
    timestamp: new Date().toISOString(),
  };

  const statusCode = isAppError ? (error as AppError).statusCode : 500;

  console.error(`[${errorResponse.error}] ${error.message}`, {
    statusCode,
    context: isAppError ? (error as AppError).context : undefined,
    stack: error.stack,
  });

  return NextResponse.json(errorResponse, { status: statusCode });
}

export function handleGoogleAPIError(
  error: any,
  context?: Record<string, any>,
): GoogleAPIError {
  // Manejar errores específicos de Google API
  if (error.message?.includes("invalid authentication credentials")) {
    return new GoogleAPIError(
      "Google API authentication failed. Please re-authenticate.",
      401,
      "GOOGLE_AUTH_ERROR",
      { ...context, originalError: error.message },
    );
  }

  if (error.message?.includes("404")) {
    return new GoogleAPIError(
      "Resource not found in Google API",
      404,
      "GOOGLE_NOT_FOUND",
      { ...context, originalError: error.message },
    );
  }

  if (error.message?.includes("403")) {
    return new GoogleAPIError(
      "Insufficient permissions for Google API",
      403,
      "GOOGLE_PERMISSION_ERROR",
      { ...context, originalError: error.message },
    );
  }

  if (error.message?.includes("429")) {
    return new GoogleAPIError(
      "Google API rate limit exceeded",
      429,
      "GOOGLE_RATE_LIMIT",
      { ...context, originalError: error.message },
    );
  }

  return new GoogleAPIError(
    "Google API request failed",
    500,
    "GOOGLE_API_ERROR",
    { ...context, originalError: error.message },
  );
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>,
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, {
        error: error instanceof Error ? error.message : error,
        context,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };
}
