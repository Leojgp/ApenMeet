import { chromium, Browser, Page } from 'playwright';
import ScrapedSource, { IScrapedSource } from '../db/models/ScrapedSource';

class ScrapingService {
  private browser: Browser | null = null;

  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async scrapeEventPage(url: string): Promise<Partial<IScrapedSource>[]> {
    console.log('Iniciando scraping de:', url);
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    try {
      console.log('Navegando a la página...');
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      return await this.scrapeFeverGranada(page, url);
    } catch (error) {
      console.error('Error en scrapeEventPage:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async scrapeFeverGranada(page: Page, url: string): Promise<Partial<IScrapedSource>[]> {
    try {
      await page.waitForSelector('ul.fv-plan-carousel__feed > li.fv-plan-carousel__item', { timeout: 10000 });
      const activities = await page.$$eval(
        'ul.fv-plan-carousel__feed > li.fv-plan-carousel__item',
        (cards, url) => {
          const excludeKeywords = [
            'tarjeta regalo',
            'tarjeta de regalo',
            'gift card',
            '¡feliz cumple!',
            '¡te quiero!',
            'para el mejor compi',
            '¡felicidades!',
            '¡gracias!',
            '¡te quiero papá!',
            '¡te quiero mamá!'
          ];
          return cards.map(card => {
            const title = card.querySelector('h3.fv-plan-preview-card__name')?.textContent?.trim() || 'Sin título';
            const location = card.querySelector('.fv-location__name')?.textContent?.trim() || 'Sin ubicación';
            const date = card.querySelector('.fv-plan-preview-card__date-range')?.textContent?.trim() || '';
            const price = card.querySelector('.plan-price__amount')?.textContent?.trim() || '';
            const imageUrl = (card.querySelector('img.fv-plan-preview-card__img') as HTMLImageElement)?.src || '';
            const link = (card.querySelector('a.fv-plan-preview-card__link') as HTMLAnchorElement)?.href || '';
            const description = title + (location ? ' en ' + location : '');
            return {
              name: title,
              url: link.startsWith('http') ? link : `https://feverup.com${link}`,
              type: 'event',
              title,
              description,
              price,
              imageUrl,
              location,
              date,
              sourceUrl: url,
              lastScraped: new Date(),
              isActive: true,
            } as Partial<IScrapedSource>;
          })
          .filter(item => {
            const lowerTitle = (item.title || '').toLowerCase();
            return !excludeKeywords.some(keyword => lowerTitle.includes(keyword));
          });
        },
        url
      );
      return activities;
    } catch (error) {
      console.error('Error scraping Fever Granada:', error);
      throw new Error(`Error al extraer actividades de Fever Granada: ${(error as Error).message}`);
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