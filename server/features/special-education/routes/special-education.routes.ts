import { RequestHandler } from 'express';
import * as specialEducationService from '../services/special-education.service.js';

export const getSpecialEducationByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const records = specialEducationService.getSpecialEducationByStudent(studentId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching special education records:', error);
    res.status(500).json({ success: false, error: 'Özel eğitim kayıtları yüklenemedi' });
  }
};

export const createSpecialEducation: RequestHandler = (req, res) => {
  try {
    const result = specialEducationService.createSpecialEducation(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating special education record:', error);
    res.status(500).json({ success: false, error: 'Özel eğitim kaydı oluşturulamadı' });
  }
};

export const updateSpecialEducation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = specialEducationService.updateSpecialEducation(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating special education record:', error);
    res.status(500).json({ success: false, error: 'Özel eğitim kaydı güncellenemedi' });
  }
};

export const deleteSpecialEducation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = specialEducationService.deleteSpecialEducation(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting special education record:', error);
    res.status(500).json({ success: false, error: 'Özel eğitim kaydı silinemedi' });
  }
};
