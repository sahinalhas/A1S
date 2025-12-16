import getDatabase from '../../../lib/database.js';
import type { User } from '../types/users.types.js';
import type Database from 'better-sqlite3';

interface PreparedStatements {
  getUserByEmail: Database.Statement;
  getUserById: Database.Statement;
  getAllUsers: Database.Statement;
  getUserSchools: Database.Statement;
  insertUser: Database.Statement;
  updateUser: Database.Statement;
  updateUserPassword: Database.Statement;
  deactivateUser: Database.Statement;
  countUsers: Database.Statement;
  addUserToSchool: Database.Statement;
}

let statements: PreparedStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1'),
    getUserById: db.prepare('SELECT * FROM users WHERE id = ? AND isActive = 1'),
    getAllUsers: db.prepare('SELECT * FROM users WHERE isActive = 1 ORDER BY name'),
    getUserSchools: db.prepare('SELECT s.* FROM schools s INNER JOIN user_schools us ON s.id = us.schoolId WHERE us.userId = ? ORDER BY s.name'),
    insertUser: db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, isActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `),
    updateUser: db.prepare(`
      UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateUserPassword: db.prepare(`
      UPDATE users SET passwordHash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deactivateUser: db.prepare(`
      UPDATE users SET isActive = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    countUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE isActive = 1'),
    addUserToSchool: db.prepare(`
      INSERT OR IGNORE INTO user_schools (id, userId, schoolId, role, joinedDate)
      VALUES (?, ?, ?, 'counselor', CURRENT_TIMESTAMP)
    `)
  };
  
  isInitialized = true;
}

export function getUserByEmail(email: string): User | null {
  ensureInitialized();
  const user = statements!.getUserByEmail.get(email) as User | null;
  return user;
}

export function getUserById(id: string): User | null {
  ensureInitialized();
  const user = statements!.getUserById.get(id) as User | null;
  return user;
}

export function getAllUsers(): User[] {
  ensureInitialized();
  const users = statements!.getAllUsers.all() as User[];
  return users;
}

export function getUserSchools(userId: string): any[] {
  ensureInitialized();
  const schools = statements!.getUserSchools.all(userId) as any[];
  return schools;
}

export function insertUser(id: string, name: string, email: string, passwordHash: string, role: string): void {
  ensureInitialized();
  statements!.insertUser.run(id, name, email, passwordHash, role);
}

export function updateUser(id: string, name: string, email: string, role: string): void {
  ensureInitialized();
  statements!.updateUser.run(name, email, role, id);
}

export function updateUserPassword(id: string, passwordHash: string): void {
  ensureInitialized();
  statements!.updateUserPassword.run(passwordHash, id);
}

export function deactivateUser(id: string): void {
  ensureInitialized();
  statements!.deactivateUser.run(id);
}

export function addUserToSchool(userId: string, schoolId: string): void {
  ensureInitialized();
  const id = `user-school-${Date.now()}`;
  statements!.addUserToSchool.run(id, userId, schoolId);
}

export function countUsers(): number {
  ensureInitialized();
  const result = statements!.countUsers.get() as { count: number };
  return result.count;
}
