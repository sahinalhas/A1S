/**
 * Data Encryption Service
 * Veri Şifreleme Servisi
 */

import crypto from 'crypto';
import { env } from '../../../config/index.js';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
}

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64,
  iterations: 100000,
};

export class EncryptionService {
  private config: EncryptionConfig;
  private masterKey: Buffer;
  
  constructor(masterPassword: string = env.ENCRYPTION_KEY) {
    this.config = DEFAULT_CONFIG;
    this.masterKey = this.deriveMasterKey(masterPassword);
  }
  
  private deriveMasterKey(password: string): Buffer {
    const salt = crypto.randomBytes(this.config.saltLength);
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.config.iterations,
      this.config.keyLength,
      'sha512'
    );
  }
  
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.config.ivLength);
    const cipher = crypto.createCipheriv(this.config.algorithm, this.masterKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = (cipher as any).getAuthTag();
    
    const result = {
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex'),
    };
    
    return Buffer.from(JSON.stringify(result)).toString('base64');
  }
  
  decrypt(ciphertext: string): string {
    const decoded = JSON.parse(Buffer.from(ciphertext, 'base64').toString('utf8'));
    
    const iv = Buffer.from(decoded.iv, 'hex');
    const authTag = Buffer.from(decoded.authTag, 'hex');
    const encrypted = decoded.encrypted;
    
    const decipher = crypto.createDecipheriv(this.config.algorithm, this.masterKey, iv);
    (decipher as any).setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }
  
  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
  
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) {
      return '*'.repeat(data?.length || 0);
    }
    
    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return visible + masked;
  }
  
  anonymizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return 'anonymized@example.com';
    
    const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(0, local.length - 1));
    return `${maskedLocal}@${domain}`;
  }
  
  anonymizePhone(phone: string): string {
    if (phone.length < 4) return '****';
    return phone.substring(0, 4) + '*'.repeat(phone.length - 4);
  }
  
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  encryptSensitiveFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: string[]
  ): T {
    const encrypted: any = { ...data };
    
    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    }
    
    return encrypted as T;
  }
  
  decryptSensitiveFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: string[]
  ): T {
    const decrypted: any = { ...data };
    
    for (const field of sensitiveFields) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch {
          decrypted[field] = '[DECRYPTION_ERROR]';
        }
      }
    }
    
    return decrypted as T;
  }
}

export const encryptionService = new EncryptionService();
