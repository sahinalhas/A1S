import { RequestHandler } from "express";
import * as documentsService from '../services/documents.service.js';
import { sanitizeString } from "../../../middleware/validation.js";

export const getDocuments: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    const sanitizedId = sanitizeString(studentId);
    const documents = documentsService.getStudentDocuments(sanitizedId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Dokümanlar getirilirken hata oluştu' });
  }
};

export const saveDocumentHandler: RequestHandler = (req, res) => {
  try {
    const document = req.body;
    
    const sanitizedDocument = {
      ...document,
      id: document.id ? sanitizeString(document.id) : document.id,
      studentId: document.studentId ? sanitizeString(document.studentId) : document.studentId,
      name: document.name ? sanitizeString(document.name) : document.name,
      type: document.type ? sanitizeString(document.type) : document.type,
    };
    
    documentsService.createDocument(sanitizedDocument);
    res.json({ success: true, message: 'Doküman kaydedildi' });
  } catch (error) {
    console.error('Error saving document:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("zorunludur")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Doküman kaydedilemedi: ${errorMessage}` 
    });
  }
};

export const deleteDocumentHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz doküman ID" 
      });
    }
    
    const sanitizedId = sanitizeString(id);
    documentsService.removeDocument(sanitizedId);
    res.json({ success: true, message: 'Doküman silindi' });
  } catch (error) {
    console.error('Error deleting document:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Doküman silinemedi' });
  }
};
