import { Response } from 'express';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import * as schoolsRepository from '../repository/schools.repository.js';
import * as usersRepository from '../../users/repository/users.repository.js';
import { AuthenticatedRequest } from '../../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import getDatabase from '../../../lib/database.js';

export function getMySchools(req: AuthenticatedRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    // Use schoolsRepository to get isDefault field
    const schools = schoolsRepository.getUserSchools(userId);
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Error fetching user schools:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
}

export function getAllSchools(req: AuthenticatedRequest, res: Response): void {
  try {
    const schools = schoolsRepository.getAllSchools();
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
}

export function getSchoolById(req: AuthenticatedRequest, res: Response): void {
  try {
    const school = schoolsRepository.getSchoolById(req.params.schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found' });
      return;
    }
    res.json({ success: true, school });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school' });
  }
}

export function createSchool(req: AuthenticatedRequest, res: Response): void {
  try {
    const { name, code, address, phone, email, principal, website, socialMedia, viceEducationDirector } = req.body;
    
    if (!name) {
      res.status(400).json({ success: false, message: 'School name is required' });
      return;
    }
    
    const existingSchool = schoolsRepository.getSchoolByName(name);
    if (existingSchool) {
      res.status(400).json({ success: false, message: 'School already exists' });
      return;
    }
    
    const schoolId = `school-${randomBytes(8).toString('hex')}`;
    schoolsRepository.insertSchool(schoolId, name, code, address, phone, email, principal, website, socialMedia, viceEducationDirector);
    
    const userId = req.user?.id;
    if (userId) {
      usersRepository.addUserToSchool(userId, schoolId);
    }
    
    const school = schoolsRepository.getSchoolById(schoolId);
    res.json({ success: true, school });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ success: false, message: 'Failed to create school' });
  }
}

export function updateSchool(req: AuthenticatedRequest, res: Response): void {
  try {
    const { name, code, address, phone, email, principal, website, socialMedia, viceEducationDirector } = req.body;
    const schoolId = req.params.schoolId;
    
    if (!name) {
      res.status(400).json({ success: false, message: 'School name is required' });
      return;
    }
    
    const school = schoolsRepository.getSchoolById(schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found' });
      return;
    }
    
    schoolsRepository.updateSchool(schoolId, name, code, address, phone, email, principal, website, socialMedia, viceEducationDirector);
    
    const updatedSchool = schoolsRepository.getSchoolById(schoolId);
    res.json({ success: true, school: updatedSchool });
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ success: false, message: 'Failed to update school' });
  }
}

export async function deleteSchool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schoolId = req.params.schoolId;
    const userId = req.user?.id;
    const { password } = req.body;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!password || password.trim() === '') {
      res.status(400).json({ success: false, message: 'Şifre gereklidir' });
      return;
    }
    
    // Get user from database to verify password
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as { id: string; passwordHash: string } | undefined;
    
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash || '');
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Şifre yanlış' });
      return;
    }
    
    const school = schoolsRepository.getSchoolById(schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found' });
      return;
    }
    
    // Check if user has access to this school
    const userSchoolIds = schoolsRepository.getUserSchoolIds(userId);
    if (!userSchoolIds.includes(schoolId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
    
    schoolsRepository.deleteSchool(schoolId);
    res.json({ success: true, message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ success: false, message: 'Failed to delete school' });
  }
}

export function setDefaultSchool(req: AuthenticatedRequest, res: Response): void {
  try {
    const schoolId = req.params.schoolId;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    const school = schoolsRepository.getSchoolById(schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found' });
      return;
    }
    
    // Check if user has access to this school
    const userSchoolIds = schoolsRepository.getUserSchoolIds(userId);
    if (!userSchoolIds.includes(schoolId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
    
    schoolsRepository.setDefaultSchool(userId, schoolId);
    
    const schools = schoolsRepository.getUserSchools(userId);
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Error setting default school:', error);
    res.status(500).json({ success: false, message: 'Failed to set default school' });
  }
}
