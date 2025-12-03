import type { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function extractPaginationParams(req: Request): PaginationParams {
  const rawPage = parseInt(req.query.page as string);
  const rawLimit = parseInt(req.query.limit as string);
  
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 20 : rawLimit), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

export function buildPaginationQuery(baseQuery: string, orderBy: string = 'created_at DESC'): string {
  return `${baseQuery} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
}

export function buildCountQuery(baseQuery: string): string {
  const fromIndex = baseQuery.toLowerCase().indexOf('from');
  if (fromIndex === -1) {
    throw new Error('Invalid query: FROM clause not found');
  }
  
  return `SELECT COUNT(*) as total ${baseQuery.substring(fromIndex)}`;
}
