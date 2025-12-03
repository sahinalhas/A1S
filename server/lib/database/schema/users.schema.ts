import type Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { env } from '../../../config/index.js';
import { logger } from '../../../utils/logger.js';

export function createUsersTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('counselor', 'teacher', 'student', 'parent')),
      isActive BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive);
  `);

  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasInstitution = tableInfo.some((col: any) => col.name === 'institution');
    if (hasInstitution) {
      logger.info('institution column exists in users table (deprecated, use user_schools)', 'UsersSchema');
    }
  } catch (e) {
    logger.warn('Failed to check institution column', 'UsersSchema', e);
  }
}

export function seedAdminUser(db: Database.Database): void {
  const adminEmail = env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = env.DEFAULT_ADMIN_PASSWORD;
  
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, isActive)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'rehber-user-id-12345',
      'Rehber Öğretmen',
      adminEmail,
      passwordHash,
      'counselor',
      1
    );
    logger.info(`Default admin user created: ${adminEmail}`, 'UsersSchema');
    
    if (env.NODE_ENV === 'development') {
      logger.info(`Development mode - default password is configured via DEFAULT_ADMIN_PASSWORD env variable`, 'UsersSchema');
    }
  }
}
