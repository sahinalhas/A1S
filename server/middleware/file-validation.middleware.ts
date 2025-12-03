import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

/**
 * MIME Type Whitelist - Sadece güvenli dosya türlerine izin ver
 */
const ALLOWED_MIME_TYPES = {
  excel: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls (legacy)
  ],
  pdf: [
    'application/pdf',
  ],
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ],
} as const;

/**
 * Dosya boyutu limitleri (bytes)
 */
const MAX_FILE_SIZES = {
  excel: 10 * 1024 * 1024, // 10 MB
  pdf: 5 * 1024 * 1024,    // 5 MB
  image: 2 * 1024 * 1024,  // 2 MB
} as const;

/**
 * İzin verilen dosya uzantıları
 */
const ALLOWED_EXTENSIONS = {
  excel: ['.xlsx', '.xls'],
  pdf: ['.pdf'],
  image: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

/**
 * Dosya türü enum
 */
export type FileType = keyof typeof ALLOWED_MIME_TYPES;

/**
 * Dosya validasyon hatası
 */
export class FileValidationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'FILE_VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * MIME type kontrolü - Magic number ile gerçek dosya türünü kontrol et
 */
function validateMimeType(buffer: Buffer, declaredMimeType: string, fileType: FileType): boolean {
  // Magic number signatures for file type detection
  const signatures: Record<string, { pattern: number[]; offset: number }[]> = {
    excel: [
      { pattern: [0x50, 0x4B, 0x03, 0x04], offset: 0 }, // ZIP-based (.xlsx)
      { pattern: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], offset: 0 }, // OLE2 (.xls)
    ],
    pdf: [
      { pattern: [0x25, 0x50, 0x44, 0x46], offset: 0 }, // %PDF
    ],
    image: [
      { pattern: [0xFF, 0xD8, 0xFF], offset: 0 }, // JPEG
      { pattern: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 }, // PNG
      { pattern: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // WebP (RIFF)
    ],
  };

  const allowedSignatures = signatures[fileType];
  if (!allowedSignatures) {
    return false;
  }

  // Check if buffer matches any of the allowed signatures
  const matchesSignature = allowedSignatures.some(sig => {
    if (buffer.length < sig.offset + sig.pattern.length) {
      return false;
    }
    return sig.pattern.every((byte, index) => buffer[sig.offset + index] === byte);
  });

  // Also verify declared MIME type is in allowlist
  const allowedMimeTypes = ALLOWED_MIME_TYPES[fileType];
  const declaredMimeTypeValid = (allowedMimeTypes as readonly string[]).includes(declaredMimeType);

  return matchesSignature && declaredMimeTypeValid;
}

/**
 * Dosya uzantısı kontrolü
 */
function validateFileExtension(filename: string, fileType: FileType): boolean {
  const ext = path.extname(filename).toLowerCase();
  const allowedExts = ALLOWED_EXTENSIONS[fileType];
  return (allowedExts as readonly string[]).includes(ext);
}

/**
 * Dosya boyutu kontrolü
 */
function validateFileSize(size: number, fileType: FileType): boolean {
  const maxSize = MAX_FILE_SIZES[fileType];
  return size > 0 && size <= maxSize;
}

/**
 * Dosya adı sanitizasyonu - Path traversal ve injection saldırılarını önle
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Sadece güvenli karakterler
    .replace(/\.{2,}/g, '_') // Directory traversal (..) önleme
    .replace(/^\.+/, '') // Başta nokta önleme (hidden file)
    .substring(0, 255); // Uzunluk limiti
}

/**
 * Kötü amaçlı içerik tespiti - Excel dosyalarında makro ve script kontrolü
 */
function detectMaliciousContent(buffer: Buffer, fileType: FileType): boolean {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));

  // Dangerous patterns in Excel files
  if (fileType === 'excel') {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /<iframe/i,
      /<embed/i,
      /<object/i,
      /macrosheet/i,
      /xl\/vbaProject/i, // VBA macro in xlsx
    ];

    return dangerousPatterns.some(pattern => pattern.test(content));
  }

  // Dangerous patterns in PDF files
  if (fileType === 'pdf') {
    const dangerousPatterns = [
      /\/JavaScript/i,
      /\/JS/i,
      /\/Launch/i,
      /\/EmbeddedFile/i,
      /\/AA\s*</i, // Automatic actions
      /\/OpenAction/i,
    ];

    return dangerousPatterns.some(pattern => pattern.test(content));
  }

  return false;
}

/**
 * Multer file filter - Dosya yükleme sırasında MIME type kontrolü
 */
function createFileFilter(fileType: FileType) {
  return (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimeTypes = ALLOWED_MIME_TYPES[fileType];

    // MIME type kontrolü
    if (!(allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
      return callback(
        new FileValidationError(
          `Geçersiz dosya türü. İzin verilen türler: ${allowedMimeTypes.join(', ')}`,
          400,
          'INVALID_MIME_TYPE'
        )
      );
    }

    // Uzantı kontrolü
    if (!validateFileExtension(file.originalname, fileType)) {
      return callback(
        new FileValidationError(
          `Geçersiz dosya uzantısı. İzin verilen uzantılar: ${ALLOWED_EXTENSIONS[fileType].join(', ')}`,
          400,
          'INVALID_FILE_EXTENSION'
        )
      );
    }

    callback(null, true);
  };
}

/**
 * Derin dosya validasyonu - Buffer'ı analiz et
 * Magic number, boyut ve kötü amaçlı içerik kontrolü
 */
export function validateUploadedFile(file: Express.Multer.File, fileType: FileType): void {
  if (!file || !file.buffer) {
    throw new FileValidationError('Dosya bulunamadı', 400, 'FILE_NOT_FOUND');
  }

  // Boyut kontrolü
  if (!validateFileSize(file.buffer.length, fileType)) {
    const maxSizeMB = (MAX_FILE_SIZES[fileType] / (1024 * 1024)).toFixed(1);
    throw new FileValidationError(
      `Dosya boyutu çok büyük. Maksimum: ${maxSizeMB} MB`,
      413,
      'FILE_TOO_LARGE'
    );
  }

  // Magic number ile gerçek dosya türü kontrolü
  if (!validateMimeType(file.buffer, file.mimetype, fileType)) {
    throw new FileValidationError(
      'Dosya içeriği ile türü uyuşmuyor. Kötü amaçlı dosya tespit edildi.',
      400,
      'MIME_TYPE_MISMATCH'
    );
  }

  // Kötü amaçlı içerik tespiti
  if (detectMaliciousContent(file.buffer, fileType)) {
    throw new FileValidationError(
      'Dosyada güvenlik riski tespit edildi. Makro, script veya kötü amaçlı içerik içeriyor.',
      400,
      'MALICIOUS_CONTENT_DETECTED'
    );
  }
}

/**
 * Multer konfigürasyonu - Güvenli dosya yükleme için
 */
export function createSecureUploadMiddleware(fileType: FileType, fieldName: string = 'file') {
  return multer({
    storage: multer.memoryStorage(),
    fileFilter: createFileFilter(fileType),
    limits: {
      fileSize: MAX_FILE_SIZES[fileType],
      files: 1, // Tek dosya yükleme
      fields: 10, // Form field limiti
      fieldSize: 1 * 1024 * 1024, // 1 MB per field
    },
  }).single(fieldName);
}

/**
 * Dosya validasyon middleware - Upload sonrası derin kontrol
 */
export function validateFileMiddleware(fileType: FileType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Dosya yüklenmedi',
          code: 'FILE_REQUIRED',
        });
      }

      // Derin validasyon
      validateUploadedFile(req.file, fileType);

      // Dosya adını sanitize et
      if (req.file.originalname) {
        req.file.originalname = sanitizeFilename(req.file.originalname);
      }

      next();
    } catch (error) {
      if (error instanceof FileValidationError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code,
        });
      }

      console.error('File validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Dosya doğrulama sırasında hata oluştu',
        code: 'VALIDATION_ERROR',
      });
    }
  };
}

/**
 * Excel dosyası için güvenli upload middleware
 */
export const uploadExcelFile = [
  createSecureUploadMiddleware('excel'),
  validateFileMiddleware('excel'),
];

/**
 * PDF dosyası için güvenli upload middleware
 */
export const uploadPdfFile = [
  createSecureUploadMiddleware('pdf'),
  validateFileMiddleware('pdf'),
];

/**
 * Image dosyası için güvenli upload middleware
 */
export const uploadImageFile = [
  createSecureUploadMiddleware('image'),
  validateFileMiddleware('image'),
];

/**
 * Multer hata yakalama middleware
 */
export function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'Dosya boyutu limiti aşıldı',
        code: 'FILE_TOO_LARGE',
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Çok fazla dosya yüklendi',
        code: 'TOO_MANY_FILES',
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Beklenmeyen dosya alanı',
        code: 'UNEXPECTED_FILE_FIELD',
      });
    }

    return res.status(400).json({
      success: false,
      error: err.message || 'Dosya yükleme hatası',
      code: 'UPLOAD_ERROR',
    });
  }

  if (err instanceof FileValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  next(err);
}
