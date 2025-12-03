import * as codesRepository from '../../repository/distribution-codes.repository.js';
import type { SurveyDistribution, DistributionCode } from '../../types/surveys.types.js';
import QRCode from 'qrcode';

export async function generateCodesForDistribution(
  distribution: SurveyDistribution,
  studentCount: number
): Promise<DistributionCode[]> {
  try {
    const codes: DistributionCode[] = [];
    
    for (let i = 0; i < studentCount; i++) {
      const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5000';
      const code = codesRepository.generateCode();
      const qrData = `${baseUrl}/anket/${distribution.publicLink}?code=${code}`;
      
      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
      });
      
      const newCode = codesRepository.createDistributionCode(
        distribution.id,
        undefined,
        qrCode
      );
      
      codes.push(newCode);
    }
    
    return codes;
  } catch (error) {
    console.error('Error generating distribution codes:', error);
    throw error;
  }
}

export function verifyCode(code: string): DistributionCode | null {
  try {
    const codeRecord = codesRepository.getCodeByCode(code);
    
    if (!codeRecord) {
      throw new Error('Kod geçersiz');
    }
    
    if (codeRecord.isUsed) {
      throw new Error('Bu kod zaten kullanılmış');
    }
    
    return codeRecord;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

export function markCodeAsUsed(code: string): void {
  codesRepository.markCodeAsUsed(code);
}

export function getDistributionCodes(distributionId: string): DistributionCode[] {
  return codesRepository.getCodesByDistribution(distributionId);
}

export function deleteDistributionCodes(distributionId: string): void {
  codesRepository.deleteCodesByDistribution(distributionId);
}
