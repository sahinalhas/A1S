/**
 * useStreamingAnalysis Hook
 * Progressive Data Loading için SSE client hook'u
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
 ProgressiveAnalysisState,
 StreamChunk,
 StreamChunkType,
} from '../../shared/types/progressive-loading.types';

interface UseStreamingAnalysisOptions {
 includeAI?: boolean;
 autoStart?: boolean;
 onProgress?: (progress: number) => void;
 onComplete?: () => void;
 onError?: (error: string) => void;
}

/**
 * Progressive data loading hook
 * 
 * @example
 * ```tsx
 * const { analysis, isStreaming, progress, startStreaming, stopStreaming } = useStreamingAnalysis(studentId, {
 * includeAI: true,
 * onProgress: (p) => console.log(`Progress: ${p}%`)
 * });
 * ```
 */
export function useStreamingAnalysis(
 studentId: string,
 options: UseStreamingAnalysisOptions = {}
) {
 const {
 includeAI = false,
 autoStart = false,
 onProgress,
 onComplete,
 onError,
 } = options;

 const [analysis, setAnalysis] = useState<ProgressiveAnalysisState>({
 basic: null,
 academic: null,
 behavior: null,
 psychological: null,
 predictive: null,
 timeline: null,
 isComplete: false,
 error: null,
 progress: 0,
 });

 const [isStreaming, setIsStreaming] = useState(false);
 const eventSourceRef = useRef<EventSource | null>(null);

 /**
 * Streaming'i durdur
 */
 const stopStreaming = useCallback(() => {
 if (eventSourceRef.current) {
 eventSourceRef.current.close();
 eventSourceRef.current = null;
 }
 setIsStreaming(false);
 }, []);

 /**
 * Streaming'i başlat
 */
 const startStreaming = useCallback(() => {
 if (!studentId) {
 console.error('Student ID gerekli');
 return;
 }

 // Mevcut bağlantıyı kapat
 stopStreaming();

 // State'i sıfırla
 setAnalysis({
 basic: null,
 academic: null,
 behavior: null,
 psychological: null,
 predictive: null,
 timeline: null,
 isComplete: false,
 error: null,
 progress: 0,
 });

 setIsStreaming(true);

 // SSE bağlantısı oluştur
 const url = `/api/deep-analysis/stream/${studentId}${includeAI ? '?includeAI=true' : ''}`;
 const eventSource = new EventSource(url);
 eventSourceRef.current = eventSource;

 // Message handler
 eventSource.onmessage = (event) => {
 try {
 const chunk: StreamChunk = JSON.parse(event.data);

 // Progress callback
 if (chunk.progress && onProgress) {
 onProgress(chunk.progress);
 }

 // State'i güncelle
 setAnalysis((prev) => {
 const updated: ProgressiveAnalysisState = { ...prev };

 switch (chunk.type) {
 case 'basic':
 updated.basic = chunk.data;
 break;
 case 'academic':
 updated.academic = chunk.data;
 break;
 case 'behavior':
 updated.behavior = chunk.data;
 break;
 case 'psychological':
 updated.psychological = chunk.data;
 break;
 case 'predictive':
 updated.predictive = chunk.data;
 break;
 case 'timeline':
 updated.timeline = chunk.data;
 break;
 case 'complete':
 updated.isComplete = true;
 updated.progress = 100;
 break;
 case 'error':
 updated.error = chunk.data.message || 'Bilinmeyen hata';
 break;
 }

 // Progress güncelle
 if (chunk.progress !== undefined) {
 updated.progress = chunk.progress;
 }

 return updated;
 });

 // Complete durumu
 if (chunk.type === 'complete') {
 stopStreaming();
 if (onComplete) {
 onComplete();
 }
 }

 // Error durumu
 if (chunk.type === 'error') {
 if (onError) {
 onError(chunk.data.message || 'Bilinmeyen hata');
 }
 }

 } catch (error) {
 console.error('Stream parse error:', error);
 setAnalysis((prev) => ({
 ...prev,
 error: 'Veri işleme hatası',
 }));
 }
 };

 // Error handler
 eventSource.onerror = (error) => {
 console.error('EventSource error:', error);
 setAnalysis((prev) => ({
 ...prev,
 error: 'Bağlantı hatası',
 isComplete: true,
 }));
 stopStreaming();
 
 if (onError) {
 onError('Bağlantı hatası');
 }
 };

 // Open handler
 eventSource.onopen = () => {
 console.log('EventSource connected');
 };

 }, [studentId, includeAI, onProgress, onComplete, onError, stopStreaming]);

 // Auto-start
 useEffect(() => {
 if (autoStart && studentId) {
 startStreaming();
 }

 // Cleanup
 return () => {
 stopStreaming();
 };
 }, [autoStart, studentId, startStreaming, stopStreaming]);

 return {
 analysis,
 isStreaming,
 progress: analysis.progress,
 startStreaming,
 stopStreaming,
 error: analysis.error,
 };
}
