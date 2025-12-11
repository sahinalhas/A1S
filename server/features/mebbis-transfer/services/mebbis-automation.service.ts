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

  private async waitForLoadingOverlay(): Promise<void> {
    if (!this.page) return;

    try {
      // 1. "İşlem yapılıyor" veya "Lütfen bekleyiniz" metni içeren ve görünür olan elementleri bekle
      // Bu elementler varsa, işlem devam ediyor demektir.
      const isLoadingVisible = await this.page.evaluate(() => {
        const loadingTexts = ['İşlem yapılıyor', 'Lütfen bekleyiniz', 'Yükleniyor'];

        // Tüm div, span ve p elementlerini kontrol et
        const elements = document.querySelectorAll('div, span, p, td');

        for (const el of elements) {
          const text = el.textContent || '';
          const isVisible = (el as HTMLElement).offsetParent !== null; // Görünürlük kontrolü

          if (isVisible && loadingTexts.some(t => text.includes(t))) {
            return true;
          }
        }

        // Ayrıca genel spinner ID'lerini kontrol et
        const updateProgress = document.getElementById('UpdateProgress1');
        if (updateProgress && updateProgress.style.display !== 'none' && updateProgress.offsetParent !== null) {
          return true;
        }

        return false;
      });

      if (isLoadingVisible) {
        logger.info('Loading overlay detected, waiting for it to disappear...', 'MEBBISAutomation');

        // Spinner kaybolana kadar bekle (maksimum 15 saniye)
        await this.page.waitForFunction(() => {
          const loadingTexts = ['İşlem yapılıyor', 'Lütfen bekleyiniz', 'Yükleniyor'];
          const allElements = document.querySelectorAll('div, span, p, td');
          let found = false;

          for (const el of allElements) {
            const text = el.textContent || '';
            const isVisible = (el as HTMLElement).offsetParent !== null;
            if (isVisible && loadingTexts.some(t => text.includes(t))) {
              found = true;
              break;
            }
          }

          const updateProgress = document.getElementById('UpdateProgress1');
          if (updateProgress && updateProgress.style.display !== 'none' && updateProgress.offsetParent !== null) {
            found = true;
          }

          return !found;
        }, { timeout: 15000, polling: 500 }).catch(() => {
          logger.warn('Loading overlay wait timed out, proceeding anyway...', 'MEBBISAutomation');
        });

        // Spinner kaybolduktan sonra (veya timeout) DOM'un stabil olması için biraz daha bekle
        await this.wait(1000);
      }
    } catch (error) {
      // Hata olsa bile akışı kesme, sadece logla
      logger.debug('Error in waitForLoadingOverlay', 'MEBBISAutomation');
    }
  }

  private async clickByXPath(xpath: string, timeout = 15000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    try {
      // Tıklamadan önce loading varsa bekle
      await this.waitForLoadingOverlay();

      const locator = this.page.locator(`::-p-xpath(${xpath})`);
      await locator.setTimeout(timeout);
      await locator.click();
      logger.debug(`Successfully clicked element: ${xpath}`, 'MEBBISAutomation');

      // Tıkladıktan sonra loading çıkabilir, kısa bekle ve kontrol et
      await this.wait(500);
      await this.waitForLoadingOverlay();
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

  private async waitForDropdownPopulated(selector: string, timeout = 15000): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    logger.debug(`Waiting for dropdown ${selector} to propagate...`, 'MEBBISAutomation');

    try {
      // Polling ile bekle: Seçenek sayısı 1'den fazla olana kadar (Varsayılan 'Seçiniz' dışında)
      await this.page.waitForFunction(
        (sel) => {
          const el = document.querySelector(sel) as HTMLSelectElement;
          if (!el) return false;
          // Seçenek sayısı 1'den büyükse DOLU kabul et
          // Veya tek seçenek varsa ama o seçenek "Seçiniz" (-1) değilse DOLU kabul et
          return el.options.length > 1 || (el.options.length === 1 && el.value !== '-1' && el.value !== '');
        },
        { timeout, polling: 500 }, // Her 500ms'de bir kontrol et
        selector
      );

      const optionCount = await this.page.$eval(selector, (el) => (el as HTMLSelectElement).options.length);
      logger.debug(`Dropdown ${selector} populated with ${optionCount} options.`, 'MEBBISAutomation');

      // Garanti olsun diye çok kısa bekle
      await this.wait(200);

    } catch (error) {
      logger.warn(`Dropdown ${selector} population wait timed out or failed. Proceeding anyway...`, 'MEBBISAutomation');
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

      // Inject script to suppress alerts immediately (prevents visual flash)
      await this.page.evaluateOnNewDocument(() => {
        window.alert = (msg) => { console.log(`Supressed alert: ${msg}`); };
        window.confirm = (msg) => { console.log(`Supressed confirm: ${msg}`); return true; };
        window.prompt = (msg) => { console.log(`Supressed prompt: ${msg}`); return null; };
      });

      // Handle alerts/dialogs automatically (DataTables warnings, etc.)
      this.page.on('dialog', async (dialog) => {
        logger.warn(`Browser Dialog blocked: [${dialog.type()}] ${dialog.message()}`, 'MEBBISAutomation');
        try {
          await dialog.accept();
        } catch (e) {
          logger.debug('Failed to dismiss dialog', 'MEBBISAutomation');
        }
      });

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

      await this.page.waitForFunction(() => {
        const url = window.location.href;
        return url.includes('main.aspx') ||
          url.includes('index.aspx') ||
          url.includes('Anasayfa') ||
          url.includes('default.aspx') ||
          url.includes('ERH00001.aspx');
      }, { timeout: 180000, polling: 1000 });

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

      // Sayfanın tam yüklenmesini bekle (okul aktif edildikten sonra)
      await this.wait(2000);

      // Sol menüden "RPD Hizmetleri Veri Girişi" elementinin görünür olmasını bekle
      logger.info('Waiting for RPD Hizmetleri Veri Girişi to be visible in left menu...', 'MEBBISAutomation');
      try {
        await this.page.waitForFunction(
          () => {
            const element = Array.from(document.querySelectorAll('td')).find(
              td => td.getAttribute('title') === 'RPD Hizmetleri Veri Girişi'
            );
            return element && (element as HTMLElement).offsetParent !== null;
          },
          { timeout: 10000 }
        );
      } catch (e) {
        logger.warn('Element wait timed out, attempting direct click...', 'MEBBISAutomation');
      }

      logger.info('Step 1: Clicking RPD Hizmetleri Veri Girişi from left menu...', 'MEBBISAutomation');
      await this.retry(
        () => this.clickByXPath("//td[@title='RPD Hizmetleri Veri Girişi']"),
        3,
        2000,
        'RPD Hizmetleri Veri Girişi click'
      );
      await this.wait(1500);

      logger.info('Step 2: Clicking Bireysel Veri Girişi from dropdown...', 'MEBBISAutomation');
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

  private async selectDropdownOption(selector: string, valueOrText: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });

      // Önce değer olarak seçmeyi dene (mapped value direkt ID olabilir)
      const options = await this.page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLSelectElement;
        if (!el) return [];
        return Array.from(el.options as unknown as HTMLOptionElement[]).map(opt => ({
          value: opt.value,
          text: opt.text.trim()
        }));
      }, selector);

      let finalValue = valueOrText;

      // 1. Tam eşleşme (Value)
      const valueMatch = options.find(opt => opt.value === valueOrText);
      if (valueMatch) {
        finalValue = valueOrText;
        logger.debug(`Found exact value match: ${valueOrText}`, 'MEBBISAutomation');
      } else {
        // Normalizasyon fonksiyonu
        const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
        const searchNormalized = normalize(valueOrText);

        // 2. Metin eşleşmeleri (Sırasıyla dene)
        let textMatch = options.find(opt => opt.text === valueOrText);

        // 3. Normalize edilmiş tam eşleşme
        if (!textMatch) {
          textMatch = options.find(opt => normalize(opt.text) === searchNormalized);
        }

        // 4. İçerme (Contains) - Normalize edilmiş
        if (!textMatch) {
          textMatch = options.find(opt => normalize(opt.text).includes(searchNormalized));
        }

        // 5. Kod bazlı eşleşme (Örn: "ÖOV" ile başlıyorsa)
        // Eğer aranan metin bir kod ile başlıyorsa (örn: "ÖOV - ...")
        if (!textMatch && valueOrText.includes(' - ')) {
          const codePart = valueOrText.split(' - ')[0].trim();
          if (codePart.length > 1) {
            textMatch = options.find(opt => opt.text.trim().startsWith(codePart));
            if (textMatch) {
              logger.info(`Matched via code prefix "${codePart}": "${textMatch.text}"`, 'MEBBISAutomation');
            }
          }
        }

        if (textMatch) {
          logger.info(`Mapping text "${valueOrText}" to value "${textMatch.value}" (Found text: "${textMatch.text}") for ${selector}`, 'MEBBISAutomation');
          finalValue = textMatch.value;
        } else {
          logger.warn(`No matching option found for "${valueOrText}" in ${selector}`, 'MEBBISAutomation');
          logger.warn(`Available options: ${JSON.stringify(options.map(o => o.text))}`, 'MEBBISAutomation');
        }
      }

      // Seçimi yap: Puppeteer select yerine JS ile doğrudan değer ata ve eventleri tetikle
      // Bu yöntem daha hızlıdır ve dropdown'ı görsel olarak açmadan işlemi yapar.
      await this.page.evaluate((sel, val) => {
        const el = document.querySelector(sel) as HTMLSelectElement;
        if (el) {
          el.value = val;
          // MEBBIS (ASP.NET) altyapısı için change eventi kritiktir
          el.dispatchEvent(new Event('change', { bubbles: true }));
          // Ek güvenlik için click ve blur da tetikleyelim
          el.dispatchEvent(new Event('click', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
        }
      }, selector, finalValue);

      // Kullanıcı talebi: Dropdown açılmasın diye FOCUS ve ENTER kaldırıldı.
      // Bunun yerine yukarıdaki JS kodu ve aşağıdaki postback mantığı tetikleyecek.

      // ASP.NET AutoPostBack Tetikleyici
      // Eğer elementin onchange attribute'u varsa (örn: __doPostBack), onu manuel çalıştır
      await this.page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLSelectElement;
        if (el) {
          if (el.onchange) {
            el.onchange(new Event('change') as any);
          } else {
            // Fallback: onchange attribute string'ini bul ve çalıştır
            const script = el.getAttribute('onchange');
            if (script) {
              // Güvenli olmayan eval yerine yeni fonksiyon
              try { new Function(script)(); } catch (e) { }
            }
          }
        }
      }, selector);

      // Loading overlay beklemesi
      try {
        // Önce kısa bir bekle, overlay'in belirmesi veya postback'in başlaması için
        await this.wait(200);

        // Şimdi akıllı bekleme: Loading overlay varsa kaybolana kadar bekle
        await this.waitForLoadingOverlay();
      } catch (e) {
        logger.debug(`Error waiting for overlay on ${selector}`, 'MEBBISAutomation');
      }

    } catch (error) {
      const err = error as Error;
      throw new Error(`Dropdown seçimi başarısız (${selector}): ${err.message}`);
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

      logger.info(`Session Data to Fill: ${JSON.stringify(data, null, 2)}`, 'MEBBISAutomation');

      await this.retry(async () => {
        await this.selectDropdownOption('#drp_hizmet_alani', data.hizmetAlani);
        // Wait for next dropdown to populate after selection
        await this.waitForDropdownPopulated('#drp_bir');
      }, 2, 1000, 'Service area selection');

      await this.retry(async () => {
        await this.selectDropdownOption('#drp_bir', data.birinci);
        await this.waitForDropdownPopulated('#drp_iki');
      }, 2, 1000, 'Primary category selection');

      await this.retry(async () => {
        await this.selectDropdownOption('#drp_iki', data.ikinci);
        // Wait for next dropdown (drp_uc) to populate if it exists
        await this.waitForDropdownPopulated('#drp_uc');
      }, 2, 1000, 'Secondary category selection');

      if (data.ucuncu) {
        try {
          await this.selectDropdownOption('#drp_uc', data.ucuncu);
          await this.wait(800);
        } catch (e) {
          logger.debug('Third category not available or not required', 'MEBBISAutomation');
        }
      }

      // Tarih Girişi - Klavye simülasyonu ile
      logger.info(`Entering date: ${data.gorusmeTarihi}`, 'MEBBISAutomation');
      await this.page.click('#txtgorusmetarihi', { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.wait(200);
      await this.page.type('#txtgorusmetarihi', data.gorusmeTarihi, { delay: 100 });
      await this.page.evaluate(() => {
        const el = document.getElementById('txtgorusmetarihi') as HTMLInputElement;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      await this.wait(500);

      // Başlangıç Saati - Klavye simülasyonu ile
      logger.info(`Entering start time: ${data.gorusmeSaati}`, 'MEBBISAutomation');
      await this.page.click('#txtgorusmesaati', { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.wait(200);
      await this.page.type('#txtgorusmesaati', data.gorusmeSaati, { delay: 100 });
      await this.page.evaluate(() => {
        const el = document.getElementById('txtgorusmesaati') as HTMLInputElement;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      await this.wait(500);

      // Bitiş Saati - Klavye simülasyonu ile
      logger.info(`Entering end time: ${data.gorusmeBitisSaati}`, 'MEBBISAutomation');
      await this.page.click('#txtgorusmebitissaati', { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.wait(200);
      await this.page.type('#txtgorusmebitissaati', data.gorusmeBitisSaati, { delay: 100 });
      await this.page.evaluate(() => {
        const el = document.getElementById('txtgorusmebitissaati') as HTMLInputElement;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      await this.wait(500);

      await this.retry(async () => {
        await this.selectDropdownOption('#cmbCalismaYeri', data.calismaYeri);
        await this.wait(800);
      }, 2, 1000, 'Workplace selection');

      // Kaydetmeden önce kısa bir bekle, DOM iyice otursun
      await this.wait(500);

      await this.retry(async () => {
        await this.page!.waitForSelector('#txtOturumSayisi', { timeout: 5000, visible: true });
        // Önce temizle sonra yaz
        await this.page!.click('#txtOturumSayisi', { clickCount: 3 });
        await this.page!.keyboard.press('Backspace');
        await this.wait(100);
        await this.page!.type('#txtOturumSayisi', String(data.oturumSayisi), { delay: 100 });
        await this.wait(500);
      }, 2, 1000, 'Session count entry');

      // Kaydet butonuna basmadan önce son kontrol
      await this.wait(500);

      await this.page.click('#ramToolBar1_imgButtonKaydet');
      await this.wait(1500); // User requested ~800ms, keeping 1500ms for safety as it covers it

      const successMessage = await this.page.$eval(
        '#ramToolBar1_lblBilgi',
        el => el.textContent?.trim()
      ).catch(() => '');

      // User specifically asked for "Bilgiler Kaydedilmiştir." check
      if (successMessage && (successMessage === 'Bilgiler Kaydedilmiştir.' || successMessage.includes('Kaydedilmiştir'))) {
        logger.info(`Session saved successfully for student ${data.studentNo} (Msg: ${successMessage})`, 'MEBBISAutomation');

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

  // ==================== GROUP SESSION METHODS ====================

  /**
   * Converts flexible class format to MEBBIS dropdown format.
   * Examples: "7A" -> "7. Sınıf / A Şubesi", "7-B" -> "7. Sınıf / B Şubesi"
   */
  private parseClassToMEBBISFormat(className: string): { grade: string; section: string; searchPattern: string } {
    // Normalize: remove extra spaces, convert to uppercase
    const normalized = className.trim().toUpperCase();

    // Pattern 1: "7A", "7B", "8C" (no separator)
    let match = normalized.match(/^(\d+)([A-ZÇĞİÖŞÜ]+)$/);
    if (match) {
      return {
        grade: match[1],
        section: match[2],
        searchPattern: `${match[1]}. Sınıf / ${match[2]} Şubesi`
      };
    }

    // Pattern 2: "7-A", "7/A", "7 A" (with separator)
    match = normalized.match(/^(\d+)[-\/\s]([A-ZÇĞİÖŞÜ]+)$/);
    if (match) {
      return {
        grade: match[1],
        section: match[2],
        searchPattern: `${match[1]}. Sınıf / ${match[2]} Şubesi`
      };
    }

    // Pattern 3: Special education formats like "7-Hafif Zihinsel-A"
    match = normalized.match(/^(\d+)[-\/\s](.+)[-\/\s]([A-ZÇĞİÖŞÜ])$/);
    if (match) {
      return {
        grade: match[1],
        section: match[3],
        searchPattern: `${match[1]}. Sınıf-${match[2]} / ${match[3]} Şubesi`
      };
    }

    // Fallback: return as-is, will try fuzzy matching
    logger.warn(`Could not parse class format: ${className}, using fuzzy match`, 'MEBBISAutomation');
    return {
      grade: '',
      section: '',
      searchPattern: className
    };
  }

  /**
   * Clicks the "Küçük Grup Görüşmesi" button to switch to group mode.
   */
  async selectGroupMode(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      logger.info('Switching to group session mode...', 'MEBBISAutomation');

      // Wait for page to fully load after navigating to data entry
      await this.wait(2000);
      await this.waitForLoadingOverlay();

      // The MEBBIS interface uses radio buttons inside .secenekler.ozelradio2
      // Click the label to trigger the radio button change
      logger.info('Looking for Küçük Grup Görüşmesi radio button...', 'MEBBISAutomation');

      // Try to find and click the radio button - use simple selectors to avoid strict mode issues
      const clicked = await this.page.evaluate(() => {
        // Method 1: Click the label for sec2 (most reliable)
        const label = document.querySelector('label[for="sec2"]');
        if (label) {
          (label as HTMLElement).click();
          return 'label';
        }

        // Method 2: Click the span containing the label
        const span = document.querySelector('span[title*="Küçük Grup"]');
        if (span) {
          (span as HTMLElement).click();
          return 'span';
        }

        // Method 3: Click the radio button directly
        const radio = document.getElementById('sec2');
        if (radio) {
          (radio as HTMLInputElement).checked = true;
          (radio as HTMLElement).click();
          return 'radio';
        }

        // Method 4: Find radio inside secenekic div
        const secenekDivs = document.querySelectorAll('.secenekic');
        if (secenekDivs.length > 1) {
          (secenekDivs[1] as HTMLElement).click();
          return 'secenekic';
        }

        return null;
      });

      if (clicked) {
        logger.info(`Clicked group session element via: ${clicked}`, 'MEBBISAutomation');
      } else {
        throw new Error('Küçük Grup Görüşmesi butonu bulunamadı');
      }

      // Wait for the page to update (ASP.NET postback)
      await this.wait(2000);
      await this.waitForLoadingOverlay();

      // For group mode, we should now see the class/student selection UI
      // Wait for either Sınıf/Şube dropdown or student list
      try {
        await this.page.waitForSelector('#drpsinifsube, #lstOgrenciler', { timeout: 10000 });
        logger.info('✅ Switched to group session mode successfully', 'MEBBISAutomation');
      } catch (e) {
        // Log current page state for debugging
        const pageContent = await this.page.content();
        const hasClassDropdown = pageContent.includes('drpsinifsube') || pageContent.includes('Sınıf');
        logger.info(`Page has class dropdown elements: ${hasClassDropdown}`, 'MEBBISAutomation');

        if (!hasClassDropdown) {
          throw new Error('Grup modu açıldı ama sınıf seçimi görünmedi');
        }
        logger.info('✅ Switched to group session mode (class elements found in page)', 'MEBBISAutomation');
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to switch to group mode', 'MEBBISAutomation', error);
      throw new Error(`Grup görüşmesi moduna geçilemedi: ${err.message}`);
    }
  }

  /**
   * Selects a class/section from the drpsinifsube dropdown.
   * @param className - Class name in any format (e.g., "7A", "7-B", "7/C")
   */
  async selectClassSection(className: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      const parsed = this.parseClassToMEBBISFormat(className);
      logger.info(`Selecting class: ${className} -> searching for: ${parsed.searchPattern}`, 'MEBBISAutomation');

      await this.page.waitForSelector('#drpsinifsube', { timeout: 5000 });

      // Find matching option
      const matchedValue = await this.page.evaluate((searchPattern: string, grade: string, section: string) => {
        const dropdown = document.getElementById('drpsinifsube') as HTMLSelectElement;
        if (!dropdown) return null;

        const options = Array.from(dropdown.options);
        const searchLower = searchPattern.toLowerCase();

        // Try exact match first
        for (const opt of options) {
          if (opt.value !== '-1' && opt.text.toLowerCase().includes(searchLower)) {
            return opt.value;
          }
        }

        // Try grade + section match
        if (grade && section) {
          for (const opt of options) {
            const text = opt.text.toLowerCase();
            if (opt.value !== '-1' &&
              text.includes(`${grade}. sınıf`) &&
              text.includes(`${section.toLowerCase()} şubesi`)) {
              return opt.value;
            }
          }
        }

        // Try partial grade match
        if (grade) {
          for (const opt of options) {
            const text = opt.text.toLowerCase();
            if (opt.value !== '-1' && text.includes(`${grade}. sınıf`)) {
              return opt.value;
            }
          }
        }

        return null;
      }, parsed.searchPattern, parsed.grade, parsed.section);

      if (!matchedValue) {
        throw new Error(`Sınıf bulunamadı: ${className}`);
      }

      // Select the class
      await this.page.evaluate((value) => {
        const dropdown = document.getElementById('drpsinifsube') as HTMLSelectElement;
        if (dropdown) {
          dropdown.value = value;
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, matchedValue);

      // Trigger ASP.NET postback
      await this.page.evaluate(() => {
        const dropdown = document.getElementById('drpsinifsube') as HTMLSelectElement;
        if (dropdown && dropdown.onchange) {
          dropdown.onchange(new Event('change') as any);
        }
      });

      await this.wait(1500);
      await this.waitForLoadingOverlay();

      // Wait for student list to populate
      await this.page.waitForSelector('#lstOgrenciler', { timeout: 10000 });
      await this.waitForDropdownPopulated('#lstOgrenciler');

      logger.info(`✅ Class selected: ${className}`, 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to select class: ${className}`, 'MEBBISAutomation', error);
      throw new Error(`Sınıf seçilemedi (${className}): ${err.message}`);
    }
  }

  /**
   * Finds and adds a student to the group by their student number.
   * @param studentNo - Student number to find in the list
   */
  async addStudentToGroup(studentNo: string): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      logger.info(`Adding student ${studentNo} to group...`, 'MEBBISAutomation');

      // Find the student in the list by number
      const studentFound = await this.page.evaluate((searchNo: string) => {
        const list = document.getElementById('lstOgrenciler') as HTMLSelectElement;
        if (!list) return false;

        const options = Array.from(list.options);

        for (const opt of options) {
          // Text format: "8 Toprak BULUT" - number is at the start
          const text = opt.text.trim();
          const match = text.match(/^(\d+)\s/);
          if (match && match[1] === searchNo) {
            opt.selected = true;
            return true;
          }
        }

        return false;
      }, studentNo);

      if (!studentFound) {
        logger.warn(`Student ${studentNo} not found in current class list`, 'MEBBISAutomation');
        return false;
      }

      // Click "Ekle" button
      await this.page.click('#btnListeyeEkle');
      await this.wait(1000);
      await this.waitForLoadingOverlay();

      // Verify student was added to selected list
      const addedSuccessfully = await this.page.evaluate((searchNo: string) => {
        const selectedList = document.getElementById('lstSecilenOgrenciler') as HTMLSelectElement;
        if (!selectedList) return false;

        const options = Array.from(selectedList.options);
        for (const opt of options) {
          const text = opt.text.trim();
          const match = text.match(/^(\d+)\s/);
          if (match && match[1] === searchNo) {
            return true;
          }
        }
        return false;
      }, studentNo);

      if (addedSuccessfully) {
        logger.info(`✅ Student ${studentNo} added to group`, 'MEBBISAutomation');
        return true;
      } else {
        logger.warn(`Student ${studentNo} may not have been added correctly`, 'MEBBISAutomation');
        return false;
      }
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to add student ${studentNo} to group`, 'MEBBISAutomation', error);
      return false;
    }
  }

  /**
   * Adds multiple students to a group session.
   * Groups students by class and processes each class separately.
   * @param students - Array of { studentNo, className } objects
   */
  async addStudentsToGroupSession(students: Array<{ studentNo: string; className: string }>): Promise<{ added: string[]; failed: string[] }> {
    const added: string[] = [];
    const failed: string[] = [];

    // Group students by class
    const studentsByClass = new Map<string, string[]>();
    for (const student of students) {
      const classKey = student.className.trim().toUpperCase();
      if (!studentsByClass.has(classKey)) {
        studentsByClass.set(classKey, []);
      }
      studentsByClass.get(classKey)!.push(student.studentNo);
    }

    logger.info(`Processing ${students.length} students from ${studentsByClass.size} class(es)`, 'MEBBISAutomation');

    // Process each class
    for (const [className, studentNos] of studentsByClass) {
      try {
        // Select the class
        await this.selectClassSection(className);

        // Add each student from this class
        for (const studentNo of studentNos) {
          const success = await this.addStudentToGroup(studentNo);
          if (success) {
            added.push(studentNo);
          } else {
            failed.push(studentNo);
          }
        }
      } catch (error) {
        logger.error(`Failed to process class ${className}`, 'MEBBISAutomation', error);
        // Mark all students from this class as failed
        failed.push(...studentNos.filter(no => !added.includes(no)));
      }
    }

    logger.info(`Group student selection complete: ${added.length} added, ${failed.length} failed`, 'MEBBISAutomation');
    return { added, failed };
  }

  /**
   * Clicks the "Devam" button after students are added.
   */
  async clickContinueButton(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      logger.info('Clicking Continue button...', 'MEBBISAutomation');

      await this.page.waitForSelector('#btnDevam', { timeout: 5000 });
      await this.page.click('#btnDevam');

      await this.wait(2000);
      await this.waitForLoadingOverlay();

      // Wait for form to appear (same as individual session form)
      await this.page.waitForSelector('#drp_hizmet_alani', { timeout: 10000 });

      logger.info('✅ Navigated to session form', 'MEBBISAutomation');
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to click continue button', 'MEBBISAutomation', error);
      throw new Error(`Devam butonuna tıklanamadı: ${err.message}`);
    }
  }

  /**
   * Fills the session form for a group session.
   * This is called after students are added to the group.
   * @param data - Session data (same as individual, but studentNo is not used here)
   */
  async fillGroupSessionForm(data: MEBBISSessionData): Promise<{ success: boolean; error?: string }> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      logger.info('Filling group session form...', 'MEBBISAutomation');
      logger.info(`Session Data: ${JSON.stringify(data, null, 2)}`, 'MEBBISAutomation');

      // Select service area dropdowns (same as individual)
      await this.retry(async () => {
        await this.selectDropdownOption('#drp_hizmet_alani', data.hizmetAlani);
        await this.waitForDropdownPopulated('#drp_bir');
      }, 2, 1000, 'Service area selection');

      await this.retry(async () => {
        await this.selectDropdownOption('#drp_bir', data.birinci);
        await this.waitForDropdownPopulated('#drp_iki');
      }, 2, 1000, 'Primary category selection');

      await this.retry(async () => {
        await this.selectDropdownOption('#drp_iki', data.ikinci);
        await this.waitForDropdownPopulated('#drp_uc');
      }, 2, 1000, 'Secondary category selection');

      if (data.ucuncu) {
        try {
          await this.selectDropdownOption('#drp_uc', data.ucuncu);
          await this.wait(800);
        } catch (e) {
          logger.debug('Third category not available or not required', 'MEBBISAutomation');
        }
      }

      // Date entry
      logger.info(`Entering date: ${data.gorusmeTarihi}`, 'MEBBISAutomation');
      await this.page.click('#txtgorusmetarihi', { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.wait(200);
      await this.page.type('#txtgorusmetarihi', data.gorusmeTarihi, { delay: 100 });
      await this.page.evaluate(() => {
        const el = document.getElementById('txtgorusmetarihi') as HTMLInputElement;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      await this.wait(500);

      // Start time
      logger.info(`Entering start time: ${data.gorusmeSaati}`, 'MEBBISAutomation');
      await this.page.click('#txtgorusmesaati', { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.wait(200);
      await this.page.type('#txtgorusmesaati', data.gorusmeSaati, { delay: 100 });
      await this.page.evaluate(() => {
        const el = document.getElementById('txtgorusmesaati') as HTMLInputElement;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      await this.wait(500);

      // End time
      logger.info(`Entering end time: ${data.gorusmeBitisSaati}`, 'MEBBISAutomation');
      await this.page.click('#txtgorusmebitissaati', { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.wait(200);
      await this.page.type('#txtgorusmebitissaati', data.gorusmeBitisSaati, { delay: 100 });
      await this.page.evaluate(() => {
        const el = document.getElementById('txtgorusmebitissaati') as HTMLInputElement;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      await this.wait(500);

      // Workplace
      await this.retry(async () => {
        await this.selectDropdownOption('#cmbCalismaYeri', data.calismaYeri);
        await this.wait(800);
      }, 2, 1000, 'Workplace selection');

      // Session count
      await this.wait(500);
      await this.retry(async () => {
        await this.page!.waitForSelector('#txtOturumSayisi', { timeout: 5000, visible: true });
        await this.page!.click('#txtOturumSayisi', { clickCount: 3 });
        await this.page!.keyboard.press('Backspace');
        await this.wait(100);
        await this.page!.type('#txtOturumSayisi', String(data.oturumSayisi), { delay: 100 });
        await this.wait(500);
      }, 2, 1000, 'Session count entry');

      // Save
      await this.wait(500);
      await this.page.click('#ramToolBar1_imgButtonKaydet');
      await this.wait(1500);

      const successMessage = await this.page.$eval(
        '#ramToolBar1_lblBilgi',
        el => el.textContent?.trim()
      ).catch(() => '');

      if (successMessage && (successMessage === 'Bilgiler Kaydedilmiştir.' || successMessage.includes('Kaydedilmiştir'))) {
        logger.info(`✅ Group session saved successfully (Msg: ${successMessage})`, 'MEBBISAutomation');

        // Click new for next session
        await this.page.click('#ramToolBar1_imgButtonyeni');
        await this.wait(1000);

        return { success: true };
      } else {
        logger.warn(`Group session save failed: ${successMessage}`, 'MEBBISAutomation');
        return { success: false, error: successMessage || 'Kayıt başarısız' };
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Error filling group session form', 'MEBBISAutomation', error);
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
          await Promise.all(pages.map(page => page.close().catch(() => { })));

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
