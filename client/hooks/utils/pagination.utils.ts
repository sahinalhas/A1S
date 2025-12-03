import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationReturn<T> {
 currentPage: number;
 totalPages: number;
 pageSize: number;
 paginatedItems: T[];
 setPage: (page: number) => void;
 setPageSize: (size: number) => void;
 nextPage: () => void;
 previousPage: () => void;
 canGoNext: boolean;
 canGoPrevious: boolean;
 startIndex: number;
 endIndex: number;
 totalItems: number;
}

export function usePagination<T>(
 items: T[],
 initialPageSize: number = 25
): UsePaginationReturn<T> {
 const [currentPage, setCurrentPage] = useState(1);
 const [pageSize, setPageSizeState] = useState(initialPageSize);

 const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

 const startIndex = (currentPage - 1) * pageSize;
 const endIndex = Math.min(startIndex + pageSize, items.length);

 const paginatedItems = useMemo(() => {
 return items.slice(startIndex, endIndex);
 }, [items, startIndex, endIndex]);

 const setPage = useCallback(
 (page: number) => {
 const validPage = Math.max(1, Math.min(page, totalPages));
 setCurrentPage(validPage);
 },
 [totalPages]
 );

 const setPageSize = useCallback((size: number) => {
 setPageSizeState(size);
 setCurrentPage(1);
 }, []);

 const nextPage = useCallback(() => {
 if (currentPage < totalPages) {
 setCurrentPage((prev) => prev + 1);
 }
 }, [currentPage, totalPages]);

 const previousPage = useCallback(() => {
 if (currentPage > 1) {
 setCurrentPage((prev) => prev - 1);
 }
 }, [currentPage]);

 const canGoNext = currentPage < totalPages;
 const canGoPrevious = currentPage > 1;

 return {
 currentPage,
 totalPages,
 pageSize,
 paginatedItems,
 setPage,
 setPageSize,
 nextPage,
 previousPage,
 canGoNext,
 canGoPrevious,
 startIndex,
 endIndex,
 totalItems: items.length,
 };
}
