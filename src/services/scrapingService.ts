import { chromium, Browser, Page } from 'playwright';
import ScrapedSource, { IScrapedSource } from '../db/models/ScrapedSource';


class ScrapingService {
  private browser: Browser | null = null;

  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true, 
      });
    }
    return this.browser;
  }

  async scrapeEventPage(url: string): Promise<Partial<IScrapedSource>> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', 
        (el) => el.getAttribute('content') || '');

      const scrapedData: Partial<IScrapedSource> = {
        name: title,
        url: url,
        type: 'event',
        title: title,
        description: description,
        sourceUrl: url,
        lastScraped: new Date(),
        isActive: true
      };

      return scrapedData;
    } catch (error) {
      console.error('Error scraping page:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async saveScrapedData(data: Partial<IScrapedSource>): Promise<IScrapedSource> {
    try {
      const scrapedSource = new ScrapedSource(data);
      await scrapedSource.save();
      return scrapedSource;
    } catch (error) {
      console.error('Error saving scraped data:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default new ScrapingService(); 