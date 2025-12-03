import QRCode from 'qrcode';
import { getDatabase } from '../../../../lib/database/connection.js';
import * as distributionCodesRepo from '../../repository/distribution-codes.repository.js';
import type { SurveyDistribution } from '../../types/surveys.types.js';

interface StudentWithCode {
  id: string;
  name: string;
  surname: string;
  class: string;
  code: string;
  qrCode: string;
}

interface QRCodesByClass {
  className: string;
  students: StudentWithCode[];
}

export async function generateQRCodesForDistribution(
  distribution: SurveyDistribution
): Promise<QRCodesByClass[]> {
  try {
    // Only generate QR codes for SECURITY_CODE participation type
    if (distribution.participationType !== 'SECURITY_CODE') {
      throw new Error('QR kodları sadece güvenlik kodlu dağıtımlar için oluşturulabilir');
    }
    
    // Validate publicLink exists
    if (!distribution.publicLink) {
      throw new Error('Dağıtım linki bulunamadı');
    }
    
    const db = getDatabase();
    
    // Parse target students and classes
    const targetStudents = distribution.targetStudents || [];
    const targetClasses = distribution.targetClasses || [];
    
    let students: Array<{ id: string; name: string; surname: string; class: string }> = [];
    
    if (targetStudents.length > 0) {
      // Get specific students
      const placeholders = targetStudents.map(() => '?').join(',');
      students = db.prepare(`
        SELECT id, name, surname, class
        FROM students
        WHERE id IN (${placeholders})
        ORDER BY class, surname, name
      `).all(...targetStudents) as any[];
    } else if (targetClasses.length > 0) {
      // Get all students from target classes
      const placeholders = targetClasses.map(() => '?').join(',');
      students = db.prepare(`
        SELECT id, name, surname, class
        FROM students
        WHERE class IN (${placeholders})
        ORDER BY class, surname, name
      `).all(...targetClasses) as any[];
    } else {
      throw new Error('Hedef öğrenci veya sınıf belirtilmemiş');
    }
    
    if (students.length === 0) {
      throw new Error('Hedef öğrenci bulunamadı');
    }
    
    // Delete existing codes for this distribution
    distributionCodesRepo.deleteCodesByDistribution(distribution.id);
    
    // Generate QR codes for each student
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5000';
    const studentsWithCodes: StudentWithCode[] = [];
    
    for (const student of students) {
      const code = distributionCodesRepo.generateCode();
      const qrData = `${baseUrl}/anket/${distribution.publicLink}?code=${code}`;
      
      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 200,
        margin: 1,
      });
      
      // Save to database with both code and QR image
      const savedCode = distributionCodesRepo.createDistributionCode(
        distribution.id,
        student.id,
        qrCode
      );
      
      studentsWithCodes.push({
        id: student.id,
        name: student.name,
        surname: student.surname,
        class: student.class || 'Sınıfsız',
        code: savedCode.code,
        qrCode: savedCode.qrCode || qrCode,
      });
    }
    
    // Group by class
    const groupedByClass = studentsWithCodes.reduce((acc, student) => {
      const className = student.class;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student);
      return acc;
    }, {} as Record<string, StudentWithCode[]>);
    
    return Object.entries(groupedByClass).map(([className, students]) => ({
      className,
      students,
    }));
  } catch (error) {
    console.error('Error generating QR codes for distribution:', error);
    throw error;
  }
}

export function generateQRPDF(qrCodesByClass: QRCodesByClass[]): string {
  // A4 sayfa: 7 sütun x 15 satır = 105 QR kod/sayfa
  const COLS = 7;
  const ROWS = 15;
  const CODES_PER_PAGE = COLS * ROWS;
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Anket QR Kodları</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    .page {
      page-break-after: always;
      padding: 5mm;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    .class-header {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10mm;
      padding: 5mm;
      background: #f0f0f0;
      border-radius: 4px;
    }
    
    .qr-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2mm;
      width: 100%;
    }
    
    .qr-item {
      text-align: center;
      padding: 2mm;
      border: 1px dashed #ccc;
      break-inside: avoid;
    }
    
    .qr-item img {
      width: 100%;
      height: auto;
      max-width: 25mm;
      display: block;
      margin: 0 auto 2mm;
    }
    
    .qr-item .student-info {
      font-size: 8px;
      line-height: 1.2;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .qr-item .code {
      font-size: 9px;
      font-weight: bold;
      margin-top: 1mm;
      color: #333;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
`;
  
  // Generate pages for each class
  for (const classGroup of qrCodesByClass) {
    const { className, students } = classGroup;
    
    // Split students into pages (105 per page)
    for (let pageStart = 0; pageStart < students.length; pageStart += CODES_PER_PAGE) {
      const pageStudents = students.slice(pageStart, pageStart + CODES_PER_PAGE);
      const pageNumber = Math.floor(pageStart / CODES_PER_PAGE) + 1;
      const totalPages = Math.ceil(students.length / CODES_PER_PAGE);
      
      html += `
  <div class="page">
    <div class="class-header">
      ${className} - Sayfa ${pageNumber}/${totalPages}
      <div style="font-size: 12px; margin-top: 3mm; font-weight: normal;">
        Toplam: ${students.length} Öğrenci | Bu Sayfa: ${pageStudents.length} QR Kod
      </div>
    </div>
    <div class="qr-grid">
`;
      
      for (const student of pageStudents) {
        html += `
      <div class="qr-item">
        <img src="${student.qrCode}" alt="QR Code">
        <div class="student-info">${student.name} ${student.surname}</div>
        <div class="code">${student.code}</div>
      </div>
`;
      }
      
      html += `
    </div>
  </div>
`;
    }
  }
  
  html += `
</body>
</html>
`;
  
  return html;
}
