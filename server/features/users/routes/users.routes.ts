import { Request, Response } from 'express';
import * as service from '../services/users.service.js';
import { sessionTokenService } from '../../../services/session-token.service.js';
import { logger } from '../../../utils/logger.js';
import type { AuthenticatedRequest } from '../../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

export async function login(req: Request, res: Response) {
  logger.info('Login handler called', 'LoginRoute', { 
    method: req.method,
    path: req.path 
  });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'E-posta ve şifre gereklidir' 
      });
    }

    const result = await service.login({ email, password });
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    // Generate secure session token
    const sessionToken = sessionTokenService.createToken(result.user!.id);
    
    // Set HttpOnly cookie for maximum security
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.info('User logged in successfully', 'LoginRoute', {
      userId: result.user!.id,
      email: result.user!.email,
    });

    res.json(result);
  } catch (error) {
    logger.error('Login route error', 'LoginRoute', error);
    res.status(500).json({ 
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu' 
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    logger.info('User logged out', 'LogoutRoute', {
      userId: authReq.user?.id,
    });

    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ 
      success: true,
      message: 'Çıkış başarılı' 
    });
  } catch (error) {
    logger.error('Logout route error', 'LogoutRoute', error);
    res.status(500).json({ 
      success: false,
      error: 'Çıkış işlemi sırasında bir hata oluştu' 
    });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Oturum bulunamadı' 
      });
    }

    res.json({ 
      success: true,
      user: authReq.user 
    });
  } catch (error) {
    logger.error('Get current user route error', 'GetCurrentUserRoute', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı bilgisi alınırken bir hata oluştu' 
    });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password, role, institution } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        error: 'Tüm alanlar gereklidir' 
      });
    }

    const result = await service.createUser({ name, email, password, role, institution });
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Create user route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı oluşturulurken bir hata oluştu' 
    });
  }
}

export function getAllUsers(req: Request, res: Response) {
  try {
    const users = service.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users route error:', error);
    res.status(500).json({ success: false, error: 'Kullanıcılar alınırken bir hata oluştu' });
  }
}

export function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Kullanıcı ID gereklidir' });
    }

    const user = service.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by id route error:', error);
    res.status(500).json({ success: false, error: 'Kullanıcı alınırken bir hata oluştu' });
  }
}

export async function updateUserPassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const authReq = req as AuthenticatedRequest;

    if (!id || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Kullanıcı ID ve yeni şifre gereklidir' 
      });
    }

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: 'Kimlik doğrulama gerekli'
      });
    }

    const isCounselor = authReq.user.role === 'counselor';
    const isSelf = authReq.user.id === id;

    if (!isCounselor && !isSelf) {
      logger.warn('Unauthorized password change attempt', 'UpdatePasswordRoute', {
        requestedUserId: id,
        authenticatedUserId: authReq.user.id,
        role: authReq.user.role
      });
      return res.status(403).json({
        success: false,
        error: 'Sadece kendi şifrenizi veya rehber öğretmen olarak başkalarının şifresini değiştirebilirsiniz'
      });
    }

    const result = await service.updateUserPassword(id, newPassword);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    logger.info('Password updated successfully', 'UpdatePasswordRoute', {
      userId: id,
      updatedBy: authReq.user.id
    });

    res.json(result);
  } catch (error) {
    console.error('Update password route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Şifre güncellenirken bir hata oluştu' 
    });
  }
}

export function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, role, institution } = req.body;

    if (!id || !name || !email || !role || !institution) {
      return res.status(400).json({ 
        success: false,
        error: 'Tüm alanlar gereklidir' 
      });
    }

    const result = service.updateUser(id, name, email, role, institution);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Update user route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı güncellenirken bir hata oluştu' 
    });
  }
}

export function deactivateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Kullanıcı ID gereklidir' 
      });
    }

    const result = service.deactivateUser(id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Deactivate user route error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kullanıcı silinirken bir hata oluştu' 
    });
  }
}

export function getUsersCount(req: Request, res: Response) {
  try {
    const count = service.countUsers();
    res.json({ count });
  } catch (error) {
    console.error('Get users count route error:', error);
    res.status(500).json({ success: false, error: 'Kullanıcı sayısı alınırken bir hata oluştu' });
  }
}
