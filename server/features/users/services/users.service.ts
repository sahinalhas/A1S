import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as repository from '../repository/users.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { LoginRequest, LoginResponse, UserPublic, CreateUserRequest } from '../types/users.types.js';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  counselor: [
    'view_all_analytics',
    'export_filtered_data',
    'view_predictive_analysis',
    'view_comparative_reports',
    'view_progress_charts',
    'view_early_warnings',
    'manage_interventions',
    'view_student_details'
  ],
  teacher: [
    'view_class_analytics',
    'export_class_data',
    'view_progress_charts',
    'view_early_warnings',
    'view_own_students'
  ],
  student: [
    'view_own_progress',
    'view_own_sessions',
    'view_own_records'
  ],
  parent: [
    'view_child_progress',
    'view_child_sessions',
    'message_school'
  ]
};

function userToPublic(user: any): UserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    institution: user.institution,
    permissions: ROLE_PERMISSIONS[user.role] || []
  };
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const sanitizedEmail = sanitizeString(data.email).toLowerCase();
    const user = repository.getUserByEmail(sanitizedEmail);

    if (!user) {
      return {
        success: false,
        message: 'E-posta veya şifre hatalı'
      };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordMatch) {
      return {
        success: false,
        message: 'E-posta veya şifre hatalı'
      };
    }

    return {
      success: true,
      user: userToPublic(user)
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Giriş sırasında bir hata oluştu'
    };
  }
}

export async function createUser(data: CreateUserRequest): Promise<{ success: boolean; user?: UserPublic; message?: string }> {
  try {
    const sanitizedEmail = sanitizeString(data.email).toLowerCase();
    const sanitizedName = sanitizeString(data.name);

    const existingUser = repository.getUserByEmail(sanitizedEmail);
    if (existingUser) {
      return {
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      };
    }

    const userId = randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(data.password, 10);

    repository.insertUser(
      userId,
      sanitizedName,
      sanitizedEmail,
      passwordHash,
      data.role
    );

    const newUser = repository.getUserById(userId);

    if (!newUser) {
      return {
        success: false,
        message: 'Kullanıcı oluşturulamadı'
      };
    }

    return {
      success: true,
      user: userToPublic(newUser)
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      success: false,
      message: 'Kullanıcı oluşturulurken bir hata oluştu'
    };
  }
}

export function getAllUsers(): UserPublic[] {
  try {
    const users = repository.getAllUsers();
    return users.map(userToPublic);
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
}

export function getUserById(id: string): UserPublic | null {
  try {
    const sanitizedId = sanitizeString(id);
    const user = repository.getUserById(sanitizedId);

    if (!user) return null;

    return userToPublic(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    return null;
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  try {
    const sanitizedUserId = sanitizeString(userId);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    repository.updateUserPassword(sanitizedUserId, passwordHash);

    return {
      success: true
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: 'Şifre güncellenirken bir hata oluştu'
    };
  }
}

export function updateUser(userId: string, name: string, email: string, role: string): { success: boolean; message?: string } {
  try {
    const sanitizedUserId = sanitizeString(userId);
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email).toLowerCase();


    repository.updateUser(sanitizedUserId, sanitizedName, sanitizedEmail, role);

    return {
      success: true
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      success: false,
      message: 'Kullanıcı güncellenirken bir hata oluştu'
    };
  }
}

export function deactivateUser(userId: string): { success: boolean; message?: string } {
  try {
    const sanitizedUserId = sanitizeString(userId);
    repository.deactivateUser(sanitizedUserId);

    return {
      success: true
    };
  } catch (error) {
    console.error('Deactivate user error:', error);
    return {
      success: false,
      message: 'Kullanıcı silinirken bir hata oluştu'
    };
  }
}

export function countUsers(): number {
  return repository.countUsers();
}
