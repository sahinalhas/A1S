import { Request, Response } from 'express';
import * as service from '../services/analytics.service.js';
import * as sessionService from '../services/counseling-sessions.service.js';

export function getOverview(req: Request, res: Response) {
  try {
    const stats = service.getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Genel istatistikler yüklenemedi' });
  }
}

export function getTimeSeries(req: Request, res: Response) {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Başlangıç ve bitiş tarihleri gereklidir' });
    }

    if (!['daily', 'weekly', 'monthly'].includes(period as string)) {
      return res.status(400).json({ error: 'Geçersiz periyod. Kullanılabilir değerler: daily, weekly, monthly' });
    }

    const data = service.getSessionsByTimePeriod(
      period as 'daily' | 'weekly' | 'monthly',
      startDate as string,
      endDate as string
    );

    res.json(data);
  } catch (error) {
    console.error('Error fetching time series data:', error);
    res.status(500).json({ error: 'Zaman serisi verileri yüklenemedi' });
  }
}

export function getTopics(req: Request, res: Response) {
  try {
    const data = service.getTopicAnalysis();
    res.json(data);
  } catch (error) {
    console.error('Error fetching topic analysis:', error);
    res.status(500).json({ error: 'Konu analizi yüklenemedi' });
  }
}

export function getParticipants(req: Request, res: Response) {
  try {
    const data = service.getParticipantTypeAnalysis();
    res.json(data);
  } catch (error) {
    console.error('Error fetching participant analysis:', error);
    res.status(500).json({ error: 'Katılımcı analizi yüklenemedi' });
  }
}

export function getClasses(req: Request, res: Response) {
  try {
    const data = service.getClassAnalysis();
    res.json(data);
  } catch (error) {
    console.error('Error fetching class analysis:', error);
    res.status(500).json({ error: 'Sınıf analizi yüklenemedi' });
  }
}

export function getModes(req: Request, res: Response) {
  try {
    const data = service.getSessionModeAnalysis();
    res.json(data);
  } catch (error) {
    console.error('Error fetching session mode analysis:', error);
    res.status(500).json({ error: 'Görüşme şekli analizi yüklenemedi' });
  }
}

export function getStudentStats(req: Request, res: Response) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: 'Öğrenci ID gereklidir' });
    }

    const data = sessionService.getStudentSessionStats(studentId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching student session stats:', error);
    res.status(500).json({ error: 'Öğrenci görüşme istatistikleri yüklenemedi' });
  }
}