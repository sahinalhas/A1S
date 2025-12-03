export interface MEBBISSessionData {
  studentNo: string;
  hizmetAlani: string;
  birinci: string;
  ikinci: string;
  ucuncu?: string;
  gorusmeTarihi: string;
  gorusmeSaati: string;
  gorusmeBitisSaati: string;
  oturumSayisi: number;
  calismaYeri: string;
}

export interface MEBBISTransferProgress {
  total: number;
  completed: number;
  failed: number;
  current: number;
}

export interface MEBBISTransferError {
  sessionId: string;
  studentNo?: string;
  error: string;
  timestamp: string;
}

export interface MEBBISTransferState {
  transferId: string | null;
  status: 'idle' | 'connecting' | 'waiting_qr' | 'running' | 'completed' | 'error' | 'cancelled';
  progress: MEBBISTransferProgress;
  errors: MEBBISTransferError[];
  currentSession?: {
    id: string;
    studentNo: string;
    studentName: string;
  };
}

export interface StartTransferRequest {
  sessionIds: string[];
  schoolId: string; // Zorunlu - okul izolasyonu için
  filters?: {
    startDate?: string;
    endDate?: string;
    onlyNotTransferred?: boolean;
  };
}

export interface StartTransferResponse {
  success: boolean;
  transferId: string;
  totalSessions: number;
  message: string;
}

export interface TransferStatusResponse {
  transferId: string;
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'error';
  progress: MEBBISTransferProgress;
  errors: MEBBISTransferError[];
}

export interface CancelTransferRequest {
  transferId: string;
}

export interface SessionCompletedEvent {
  sessionId: string;
  studentNo: string;
  success: boolean;
}

export interface TransferResultSummary {
  total: number;
  successful: number;
  failed: number;
  errors: MEBBISTransferError[];
  duration: number;
}
