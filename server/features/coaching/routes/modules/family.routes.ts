import { RequestHandler } from 'express';
import * as coachingService from '../../services/coaching.service.js';

export const getParentMeetingsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const meetings = coachingService.getStudentParentMeetings(studentId);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching parent meetings:', error);
    res.status(500).json({ error: 'Veli görüşmeleri yüklenemedi' });
  }
};

export const createParentMeeting: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createParentMeeting(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating parent meeting:', error);
    res.status(500).json({ error: 'Veli görüşmesi kaydedilemedi' });
  }
};

export const updateParentMeeting: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateParentMeeting(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating parent meeting:', error);
    res.status(500).json({ error: 'Veli görüşmesi güncellenemedi' });
  }
};

export const getHomeVisitsByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const visits = coachingService.getStudentHomeVisits(studentId);
    res.json(visits);
  } catch (error) {
    console.error('Error fetching home visits:', error);
    res.status(500).json({ error: 'Ev ziyaretleri yüklenemedi' });
  }
};

export const createHomeVisit: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createHomeVisit(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating home visit:', error);
    res.status(500).json({ error: 'Ev ziyareti kaydedilemedi' });
  }
};

export const updateHomeVisit: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateHomeVisit(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating home visit:', error);
    res.status(500).json({ error: 'Ev ziyareti güncellenemedi' });
  }
};

export const getFamilyParticipationByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const records = coachingService.getStudentFamilyParticipation(studentId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching family participation:', error);
    res.status(500).json({ error: 'Aile katılım durumu yüklenemedi' });
  }
};

export const createFamilyParticipation: RequestHandler = (req, res) => {
  try {
    const result = coachingService.createFamilyParticipation(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating family participation:', error);
    res.status(500).json({ error: 'Aile katılım durumu kaydedilemedi' });
  }
};

export const updateFamilyParticipation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = coachingService.updateFamilyParticipation(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating family participation:', error);
    res.status(500).json({ error: 'Aile katılım durumu güncellenemedi' });
  }
};
