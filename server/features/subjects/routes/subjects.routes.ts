import { RequestHandler } from "express";
import * as subjectsService from '../services/subjects.service.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../constants/errors.js";

export const getSubjects: RequestHandler = (req, res) => {
  try {
    const subjects = subjectsService.getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_SUBJECTS });
  }
};

export const saveSubjectsHandler: RequestHandler = (req, res) => {
  try {
    const subjects = req.body;
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ error: ERROR_MESSAGES.EXPECTED_ARRAY_OF_SUBJECTS });
    }
    subjectsService.saveSubjectsList(subjects);
    res.json({ success: true, message: `${subjects.length} ${SUCCESS_MESSAGES.SUBJECTS_SAVED}` });
  } catch (error) {
    console.error('Error saving subjects:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_SAVE_SUBJECTS });
  }
};

export const getTopics: RequestHandler = (req, res) => {
  try {
    const topics = subjectsService.getAllTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_TOPICS });
  }
};

export const getTopicsBySubjectId: RequestHandler = (req, res) => {
  try {
    const subjectId = req.params.id;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }
    const filteredTopics = subjectsService.getTopicsBySubject(subjectId);
    res.json(filteredTopics);
  } catch (error) {
    console.error('Error fetching topics by subject:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_TOPICS });
  }
};

export const saveTopicsHandler: RequestHandler = (req, res) => {
  try {
    const topics = req.body;
    if (!Array.isArray(topics)) {
      return res.status(400).json({ error: ERROR_MESSAGES.EXPECTED_ARRAY_OF_TOPICS });
    }
    subjectsService.saveTopicsList(topics);
    res.json({ success: true, message: `${topics.length} ${SUCCESS_MESSAGES.TOPICS_SAVED}` });
  } catch (error) {
    console.error('Error saving topics:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_SAVE_TOPICS });
  }
};

export const resetToDefaultsHandler: RequestHandler = (req, res) => {
  try {
    subjectsService.resetToDefaults();
    res.json({ success: true, message: 'Dersler ve konular varsayılan değerlere sıfırlandı' });
  } catch (error) {
    console.error('Error resetting to defaults:', error);
    res.status(500).json({ success: false, error: 'Varsayılana sıfırlama başarısız oldu' });
  }
};
