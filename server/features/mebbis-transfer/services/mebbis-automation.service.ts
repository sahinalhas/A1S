import puppeteer, { Browser, Page } from 'puppeteer';
import type { MEBBISSessionData } from '@shared/types/mebbis-transfer.types';
import { logger } from '../../../utils/logger.js';

export class MEBBISAutomationService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isInitialized = false;
  private schoolCode: string | null = null;
  private schoolName: string | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  setSchoolCode(schoolCode: string | null, schoolName?: string | null): void {
    this.schoolCode = schoolCode;
    this.schoolName = schoolName || null;
    logger.info(`School set for MEBBIS: code=${schoolCode}, name=${schoolName}`, 'MEBBISAutomation');
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          logger.warn(
            `${context} failed (attempt ${attempt}/${retries}): ${lastError.message}. Retrying in ${delay}ms...`,
            'MEBBISAutomation'
          );
          await this.wait(delay);
        }
      }
    }
    
    throw new Error(`${context} failed after ${retries} attempts: ${lastError?.message}`);
  }

  private async clickByXPath(xpath: string, timeout = 15000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    try {
      const locator = this.page.locator(`::-p-xpath(${xpath})`);
      await locator.setTimeout(timeout);
      await locator.click();
      logger.debug(`Successfully clicked element: ${xpath}`, 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to click XPath: ${xpath}`, 'MEBBISAutomation', error);
      throw new Error(`XPath click başarısız (${xpath}): ${err.message}`);
    }
  }

  private async waitForXPath(xpath: string, timeout = 15000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    try {
      const locator = this.page.locator(`::-p-xpath(${xpath})`);
      await locator.setTimeout(timeout);
      await locator.wait();
      logger.debug(`Element appeared: ${xpath}`, 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to wait for XPath: ${xpath}`, 'MEBBISAutomation', error);
      throw new Error(`XPath bekleme başarısız (${xpath}): ${err.message}`);
    }
  }

  private async findChromiumPath(): Promise<string | undefined> {
    const { execSync } = await import('child_process');
    const fs = await import('fs');
    
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      logger.info(`Using Chromium from env: ${process.env.PUPPETEER_EXECUTABLE_PATH}`, 'MEBBISAutomation');
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    
    try {
      const chromiumPath = execSync('which chromium || which chromium-browser || which google-chrome', {
        encoding: 'utf-8'
      }).trim();
      
      if (chromiumPath && fs.existsSync(chromiumPath)) {
        logger.info(`Found Chromium at: ${chromiumPath}`, 'MEBBISAutomation');
        return chromiumPath;
      }
    } catch (e) {
      logger.warn('Could not find Chromium in PATH', 'MEBBISAutomation');
    }
    
    try {
      const nixStorePattern = '/nix/store/*chromium*/bin/chromium';
      const chromiumPath = execSync(`ls -d ${nixStorePattern} 2>/dev/null | head -1`, {
        encoding: 'utf-8'
      }).trim();
      
      if (chromiumPath && fs.existsSync(chromiumPath)) {
        logger.info(`Found Chromium in Nix store: ${chromiumPath}`, 'MEBBISAutomation');
        return chromiumPath;
      }
    } catch (e) {
      logger.warn('Could not find Chromium in Nix store', 'MEBBISAutomation');
    }
    
    logger.info('Using Puppeteer bundled Chromium', 'MEBBISAutomation');
    return undefined;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing MEBBIS automation browser...', 'MEBBISAutomation');
      
      const chromiumPath = await this.findChromiumPath();
      
      const isHeadless = false;
      
      logger.info(`Browser mode: ${isHeadless ? 'Headless' : 'Visible'} (headless=${isHeadless})`, 'MEBBISAutomation');
      
      const launchOptions: any = {
        headless: isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          isHeadless ? '' : '--start-maximized',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ].filter(Boolean)
      };
      
      if (chromiumPath) {
        launchOptions.executablePath = chromiumPath;
      }
      
      this.browser = await puppeteer.launch(launchOptions);
      
      this.page = await this.browser.newPage();
      
      await this.page.setDefaultTimeout(30000);
      await this.page.setDefaultNavigationTimeout(60000);
      
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      logger.info('Navigating to MEBBIS...', 'MEBBISAutomation');
      await this.page.goto('https://mebbis.meb.gov.tr/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      logger.info('MEBBIS page loaded successfully', 'MEBBISAutomation');
      this.isInitialized = true;
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to initialize MEBBIS browser', 'MEBBISAutomation', error);
      await this.close();
      throw new Error(`MEBBIS browser başlatılamadı: ${err.message}`);
    }
  }

  async waitForLogin(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info('Waiting for QR code login...', 'MEBBISAutomation');
      
      await this.page.waitForSelector('#lnkQrcode', { timeout: 15000 });
      await this.page.click('#lnkQrcode');
      
      await this.wait(2000);
      
      logger.info('📱 Tarayıcıda QR kodu açtık - telefonunuzdan QR kodunu okuyun', 'MEBBISAutomation');
      logger.info('⏱️ 3 dakika içinde giriş yapmalısınız', 'MEBBISAutomation');
      
      logger.info('Waiting for user to scan QR code (3 minutes timeout)...', 'MEBBISAutomation');
      
      await this.page.waitForNavigation({
        waitUntil: 'domcontentloaded',
        timeout: 180000
      });
      
      const currentUrl = this.page.url();
      logger.info(`Navigated to: ${currentUrl}`, 'MEBBISAutomation');
      
      // MEBBIS başarılı giriş göstergeleri
      if (currentUrl.includes('mebbis.meb.gov.tr') && 
          (currentUrl.includes('main.aspx') || 
           currentUrl.includes('index.aspx') || 
           currentUrl.includes('Anasayfa') ||
           currentUrl.includes('default.aspx') ||
           currentUrl.includes('ERH00001.aspx'))) {
        logger.info('✅ Login successful!', 'MEBBISAutomation');
        await this.wait(3000); // Sayfanın tam yüklenmesini bekle
        
        // index.aspx veya main.aspx'den ERH00001.aspx'e git
        if (currentUrl.includes('index.aspx') || currentUrl.includes('main.aspx')) {
          // Önce main.aspx'e git
          if (currentUrl.includes('index.aspx')) {
            logger.info('Navigating from index.aspx to main.aspx...', 'MEBBISAutomation');
            try {
              await this.page.goto('https://mebbis.meb.gov.tr/main.aspx', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
              });
              logger.info('Successfully navigated to main.aspx', 'MEBBISAutomation');
              await this.wait(2000);
            } catch (navError) {
              logger.warn('Could not navigate to main.aspx', 'MEBBISAutomation');
              throw navError;
            }
          }
          
          // main.aspx'ten ERH/ERH00001.aspx'e git
          logger.info('Navigating from main.aspx to ERH/ERH00001.aspx...', 'MEBBISAutomation');
          try {
            await this.page.goto('https://mebbis.meb.gov.tr/ERH/ERH00001.aspx', {
              waitUntil: 'domcontentloaded',
              timeout: 30000
            });
            logger.info('Successfully navigated to ERH/ERH00001.aspx', 'MEBBISAutomation');
            await this.wait(2000);
            
            // ERH00001.aspx'te okul seçimi yap
            logger.info('School selection page (ERH00001.aspx) detected, auto-selecting active school...', 'MEBBISAutomation');
            await this.selectActiveSchool();
          } catch (navError) {
            logger.error('Could not navigate to ERH00001.aspx', 'MEBBISAutomation', navError);
            throw navError;
          }
        } else if (currentUrl.includes('ERH00001.aspx')) {
          // Eğer direkt ERH00001.aspx sayfasındaysak, okul seçimi yap
          logger.info('Already on ERH00001.aspx, auto-selecting active school...', 'MEBBISAutomation');
          await this.selectActiveSchool();
        }
      } else {
        logger.error(`Unexpected URL after login: ${currentUrl}`, 'MEBBISAutomation');
        throw new Error(`Login sonrası beklenmeyen sayfa: ${currentUrl}`);
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Login process failed', 'MEBBISAutomation', error);
      throw new Error(`MEBBIS girişi başarısız: ${err.message}`);
    }
  }

  async selectActiveSchool(schoolCode?: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // schoolCode parametresi yoksa, instance field'ını kullan
      const targetSchoolCode = schoolCode || this.schoolCode;
      
      logger.info(`Attempting to select active school${targetSchoolCode ? ` (kurum kodu: ${targetSchoolCode})` : ''}...`, 'MEBBISAutomation');
      
      // Dropdown'ın yüklenmesini bekle
      await this.page.waitForSelector('#drp_okul', { timeout: 10000 });
      
      // Mevcut dropdown seçeneklerini logla
      const dropdownOptions = await this.page.evaluate(() => {
        const dropdown = document.getElementById('drp_okul') as HTMLSelectElement;
        if (!dropdown) return [];
        return Array.from(dropdown.querySelectorAll('option')).map(opt => ({
          value: opt.value,
          text: opt.textContent?.trim() || ''
        }));
      });
      logger.info(`Available schools in dropdown: ${JSON.stringify(dropdownOptions)}`, 'MEBBISAutomation');
      
      let selectedSchoolValue: string | null = null;
      
      if (targetSchoolCode) {
        // Kurum kodu ile MEBBIS dropdown'undan okul seç
        logger.info(`Looking for school with kurum kodu: ${targetSchoolCode}`, 'MEBBISAutomation');
        
        selectedSchoolValue = await this.page.evaluate((codeToMatch: string) => {
          const dropdown = document.getElementById('drp_okul') as HTMLSelectElement;
          if (!dropdown) return null;
          
          // Dropdown'daki tüm option'ları kontrol et
          const options = Array.from(dropdown.querySelectorAll('option'));
          
          // Option değeri kurum kodu ile eşleşirse seç
          for (const option of options) {
            if (option.value === codeToMatch && option.value !== '-1') {
              return option.value;
            }
          }
          
          // Eşleşme bulunamadı
          return null;
        }, targetSchoolCode);
      }

      // Kurum kodu bulunamadıysa okul adına göre ara
      if (!selectedSchoolValue && this.schoolName) {
        logger.info(`School code not found, attempting fuzzy match with school name: ${this.schoolName}`, 'MEBBISAutomation');
        
        selectedSchoolValue = await this.page.evaluate((nameToMatch: string) => {
          const dropdown = document.getElementById('drp_okul') as HTMLSelectElement;
          if (!dropdown) return null;
          
          const options = Array.from(dropdown.querySelectorAll('option'));
          const lowerSearchName = nameToMatch.toLowerCase().trim();
          
          // Tam eşleşme ara
          for (const option of options) {
            if (option.value !== '-1') {
              const optionText = option.textContent?.toLowerCase().trim() || '';
              if (optionText === lowerSearchName) {
                return option.value;
              }
            }
          }
          
          // Kısmi eşleşme ara (okul adı içer miyiz diye)
          for (const option of options) {
            if (option.value !== '-1') {
              const optionText = option.textContent?.toLowerCase().trim() || '';
              if (optionText.includes(lowerSearchName) || lowerSearchName.includes(optionText)) {
                return option.value;
              }
            }
          }
          
          return null;
        }, this.schoolName);
        
        if (selectedSchoolValue) {
          logger.info(`Found matching school by name: ${selectedSchoolValue}`, 'MEBBISAutomation');
        }
      }

      // Hala bulunamadıysa ilk geçerli okulu seç
      if (!selectedSchoolValue) {
        logger.warn(`Could not find school by code or name, falling back to first valid option`, 'MEBBISAutomation');
        selectedSchoolValue = await this.page.evaluate(() => {
          const dropdown = document.getElementById('drp_okul') as HTMLSelectElement;
          if (!dropdown) return null;
          
          const options = Array.from(dropdown.querySelectorAll('option'));
          for (const option of options) {
            // "-1" ve "İlçe Milli Eğitim Müdürlüğü" gibi seçenekleri atla
            const text = option.textContent?.trim() || '';
            if (option.value !== '-1' && 
                !text.toLowerCase().includes('müdürlüğü') && 
                !text.toLowerCase().includes('mudurluğu')) {
              return option.value;
            }
          }
          
          // Eğer hala bulunamadıysa, -1 hariç ilk seçeneği al
          for (const option of options) {
            if (option.value !== '-1' && option.textContent?.trim()) {
              return option.value;
            }
          }
          
          return null;
        });
      }

      if (!selectedSchoolValue || selectedSchoolValue === '-1') {
        logger.warn('No school found to select', 'MEBBISAutomation');
        throw new Error('Seçilebilecek okul bulunamadı. Lütfen okul ayarlarından kurum kodunu kontrol edin.');
      }

      logger.info(`Selected school value: ${selectedSchoolValue}`, 'MEBBISAutomation');
      
      // Dropdown'dan okulu seç - JavaScript ile doğrudan değer set et
      await this.page.evaluate((value) => {
        const dropdown = document.getElementById('drp_okul') as HTMLSelectElement;
        if (dropdown) {
          dropdown.value = value;
          // Change event trigger et - bazı sistemler bunu gerektirebilir
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));
          dropdown.dispatchEvent(new Event('click', { bubbles: true }));
        }
      }, selectedSchoolValue);
      
      await this.wait(1500);
      
      // "Aktif Et" butonuna tıkla ve sayfanın yüklemesini bekle
      logger.info('Clicking "Aktif Et" button...', 'MEBBISAutomation');
      await Promise.all([
        this.page.waitForNavigation({
          waitUntil: 'domcontentloaded',
          timeout: 30000
        }),
        this.page.click('#btn_okul_aktif_et')
      ]);
      
      logger.info('✅ School selection completed successfully', 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to select active school', 'MEBBISAutomation', error);
      throw new Error(`Okul seçimi başarısız: ${err.message}`);
    }
  }

  async navigateToDataEntry(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info('Navigating to data entry page...', 'MEBBISAutomation');
      
      // Sayfanın tam yüklenmesini bekle
      await this.wait(2000);
      
      logger.info('Step 1: Clicking RPD Hizmetleri Veri Girişi...', 'MEBBISAutomation');
      await this.retry(
        () => this.clickByXPath("//td[@title='RPD Hizmetleri Veri Girişi']"),
        2,
        1000,
        'RPD Hizmetleri Veri Girişi click'
      );
      await this.wait(1200);
      
      logger.info('Step 2: Clicking Bireysel Veri Girişi...', 'MEBBISAutomation');
      await this.retry(
        () => this.clickByXPath("//td[@title='Bireysel Veri Girişi']"),
        2,
        1000,
        'Bireysel Veri Girişi click'
      );
      await this.wait(1500);
      
      logger.info('✅ Successfully navigated to data entry page', 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error('Navigation to data entry failed', 'MEBBISAutomation', error);
      throw new Error(`Veri giriş sayfasına gidilemedi: ${err.message}`);
    }
  }

  async fillSessionData(data: MEBBISSessionData): Promise<{ success: boolean; error?: string }> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info(`Processing session for student ${data.studentNo}`, 'MEBBISAutomation');
      
      const studentFound = await this.retry(async () => {
        await this.page!.waitForSelector('#txtOgrenciArama', { timeout: 5000 });
        await this.page!.click('#txtOgrenciArama', { clickCount: 3 });
        await this.page!.keyboard.press('Backspace');
        await this.wait(200);
        await this.page!.type('#txtOgrenciArama', data.studentNo, { delay: 50 });
        
        await this.page!.click('#btnOgrenciAra');
        await this.wait(1500);
        
        try {
          await this.waitForXPath("//img[@title='Aç']", 4000);
          await this.clickByXPath("//img[@title='Aç']", 3000);
          await this.wait(1500);
          return true;
        } catch (e) {
          const errorMsg = `Öğrenci ${data.studentNo} bulunamadı, tekrar deneniyor...`;
          logger.debug(errorMsg, 'MEBBISAutomation');
          throw new Error(errorMsg);
        }
      }, 2, 2000, `Student ${data.studentNo} search and open`).catch(() => false);

      if (!studentFound) {
        const errorMsg = `Öğrenci ${data.studentNo} bulunamadı veya açılamadı`;
        logger.warn(errorMsg, 'MEBBISAutomation');
        return { success: false, error: errorMsg };
      }
      
      await this.retry(async () => {
        await this.page!.waitForSelector('#drp_hizmet_alani', { timeout: 5000 });
        await this.page!.select('#drp_hizmet_alani', data.hizmetAlani);
        await this.wait(1000);
      }, 2, 1000, 'Service area selection');
      
      await this.retry(async () => {
        await this.page!.waitForSelector('#drp_bir', { timeout: 5000 });
        await this.page!.select('#drp_bir', data.birinci);
        await this.wait(1000);
      }, 2, 1000, 'Primary category selection');
      
      await this.retry(async () => {
        await this.page!.waitForSelector('#drp_iki', { timeout: 5000 });
        await this.page!.select('#drp_iki', data.ikinci);
        await this.wait(1000);
      }, 2, 1000, 'Secondary category selection');
      
      if (data.ucuncu) {
        try {
          await this.page.waitForSelector('#drp_uc', { timeout: 2000 });
          await this.page.select('#drp_uc', data.ucuncu);
          await this.wait(800);
        } catch (e) {
          logger.debug('Third category not available or not required', 'MEBBISAutomation');
        }
      }
      
      await this.page.evaluate((date) => {
        const input = document.getElementById('txtgorusmetarihi') as HTMLInputElement;
        if (input) input.value = date;
      }, data.gorusmeTarihi);
      
      await this.page.evaluate((time) => {
        const input = document.getElementById('txtgorusmesaati') as HTMLInputElement;
        if (input) input.value = time;
      }, data.gorusmeSaati);
      
      await this.page.evaluate((time) => {
        const input = document.getElementById('txtgorusmebitissaati') as HTMLInputElement;
        if (input) input.value = time;
      }, data.gorusmeBitisSaati);
      
      await this.retry(async () => {
        await this.page!.waitForSelector('#cmbCalismaYeri', { timeout: 5000 });
        await this.page!.select('#cmbCalismaYeri', data.calismaYeri);
        await this.wait(800);
      }, 2, 1000, 'Workplace selection');
      
      await this.retry(async () => {
        await this.page!.waitForSelector('#txtOturumSayisi', { timeout: 5000 });
        await this.page!.click('#txtOturumSayisi', { clickCount: 3 });
        await this.page!.type('#txtOturumSayisi', String(data.oturumSayisi), { delay: 50 });
        await this.wait(800);
      }, 2, 1000, 'Session count entry');
      
      await this.page.click('#ramToolBar1_imgButtonKaydet');
      await this.wait(1500);
      
      const successMessage = await this.page.$eval(
        '#ramToolBar1_lblBilgi',
        el => el.textContent
      ).catch(() => '');
      
      if (successMessage && successMessage.includes('Kaydedilmiştir')) {
        logger.info(`Session saved successfully for student ${data.studentNo}`, 'MEBBISAutomation');
        
        await this.page.click('#ramToolBar1_imgButtonyeni');
        await this.wait(1000);
        
        return { success: true };
      } else {
        logger.warn(`Save failed for student ${data.studentNo}: ${successMessage}`, 'MEBBISAutomation');
        return { success: false, error: successMessage || 'Kayıt başarısız' };
      }
    } catch (error) {
      const err = error as Error;
      logger.error(`Error filling session data for student ${data.studentNo}`, 'MEBBISAutomation', error);
      return { success: false, error: err.message };
    }
  }

  async close(): Promise<void> {
    try {
      logger.info('Closing MEBBIS browser...', 'MEBBISAutomation');
      
      if (this.page) {
        try {
          await this.page.close();
        } catch (error) {
          logger.warn('Error closing page', 'MEBBISAutomation', error);
        }
        this.page = null;
      }
      
      if (this.browser) {
        try {
          const pages = await this.browser.pages();
          await Promise.all(pages.map(page => page.close().catch(() => {})));
          
          await this.browser.close();
        } catch (error) {
          logger.warn('Error closing browser', 'MEBBISAutomation', error);
        }
        this.browser = null;
      }
      
      this.isInitialized = false;
      logger.info('Browser closed successfully', 'MEBBISAutomation');
    } catch (error) {
      logger.error('Error during browser cleanup', 'MEBBISAutomation', error);
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.browser !== null && this.page !== null;
  }
}
