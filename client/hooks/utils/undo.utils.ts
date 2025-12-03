import { useState, useCallback, useRef } from 'react';

type HistoryEntry<T> = {
 state: T;
 timestamp: number;
 action: string;
};

function deepEqual<T>(a: T, b: T): boolean {
 return JSON.stringify(a) === JSON.stringify(b);
}

export function useUndo<T>(
 initialState: T,
 maxHistory: number = 20
) {
 const [historyState, setHistoryState] = useState<{
 entries: HistoryEntry<T>[];
 currentIndex: number;
 }>({
 entries: [{ state: initialState, timestamp: Date.now(), action: 'init' }],
 currentIndex: 0
 });
 
 const isUndoRedoingRef = useRef(false);
 
 const currentState = historyState.entries[historyState.currentIndex]?.state || initialState;
 
 const push = useCallback((newState: T, action: string, skipIfEqual = true) => {
 if (isUndoRedoingRef.current) return;
 
 setHistoryState(prev => {
 if (skipIfEqual && deepEqual(newState, prev.entries[prev.currentIndex]?.state)) {
 return prev;
 }
 
 const newHistory = prev.entries.slice(0, prev.currentIndex + 1);
 newHistory.push({
 state: newState,
 timestamp: Date.now(),
 action
 });
 
 if (newHistory.length > maxHistory) {
 newHistory.shift();
 return {
 entries: newHistory,
 currentIndex: newHistory.length - 1
 };
 }
 
 return {
 entries: newHistory,
 currentIndex: newHistory.length - 1
 };
 });
 }, [maxHistory]);
 
 const undo = useCallback(() => {
 if (historyState.currentIndex > 0) {
 isUndoRedoingRef.current = true;
 const newIndex = historyState.currentIndex - 1;
 setHistoryState(prev => ({
 ...prev,
 currentIndex: newIndex
 }));
 queueMicrotask(() => { isUndoRedoingRef.current = false; });
 return historyState.entries[newIndex].state;
 }
 return currentState;
 }, [historyState, currentState]);
 
 const redo = useCallback(() => {
 if (historyState.currentIndex < historyState.entries.length - 1) {
 isUndoRedoingRef.current = true;
 const newIndex = historyState.currentIndex + 1;
 setHistoryState(prev => ({
 ...prev,
 currentIndex: newIndex
 }));
 queueMicrotask(() => { isUndoRedoingRef.current = false; });
 return historyState.entries[newIndex].state;
 }
 return currentState;
 }, [historyState, currentState]);
 
 const canUndo = historyState.currentIndex > 0;
 const canRedo = historyState.currentIndex < historyState.entries.length - 1;
 
 return {
 state: currentState,
 push,
 undo,
 redo,
 canUndo,
 canRedo,
 history: historyState.entries.slice(0, historyState.currentIndex + 1),
 isUndoRedoing: isUndoRedoingRef.current
 };
}

export function formatActionName(action: string): string {
 const names: Record<string, string> = {
 add: '➕ Ders eklendi',
 remove: '🗑️ Ders silindi',
 update: '✏️ Ders güncellendi',
 resize: '↔️ Boyut değiştirildi',
 move: '↗️ Ders taşındı',
 load: '📂 Yüklendi',
 init: 'Başlatıldı',
 template: 'Şablon uygulandı'
 };
 return names[action] || action;
}

export function formatTime(timestamp: number): string {
 return new Date(timestamp).toLocaleTimeString('tr-TR', {
 hour: '2-digit',
 minute: '2-digit'
 });
}
