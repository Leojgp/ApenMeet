import { chromium, Browser, Page } from 'playwright';
import ScrapedSource, { IScrapedSource } from '../db/models/ScrapedSource';
import { getCountryCode } from './countryService';

class ScrapingService {
  private browser: Browser | null = null;

  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  private getFeverUrl(city: string, country: string): string {
    const countryCode = getCountryCode(country.toLowerCase().trim());
    const formattedCity = city.toLowerCase().trim().replace(/\s+/g, '-');
    return `https://feverup.com/${countryCode}/${formattedCity}`;
  }

  async scrapeEventPage(city: string, country: string): Promise<Partial<IScrapedSource>[]> {
    const url = this.getFeverUrl(city, country);
    console.log('Iniciando scraping de:', url);
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    try {
      console.log('Navegando a la página...');
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      return await this.scrapeFeverEvents(page, url);
    } catch (error) {
      console.error('Error en scrapeEventPage:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async scrapeFeverEvents(page: Page, url: string): Promise<Partial<IScrapedSource>[]> {
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
            const titleElement = card.querySelector('h3.fv-plan-preview-card__name');
            const title = titleElement?.textContent?.trim() || '';
            
            const locationElement = card.querySelector('.fv-location__name');
            const location = locationElement?.textContent?.trim() || '';
            
            const dateElement = card.querySelector('.fv-plan-preview-card__date-range');
            const date = dateElement?.textContent?.trim() || '';
            
            const priceElement = card.querySelector('.plan-price__amount');
            const price = priceElement?.textContent?.trim() || '';
            
            const imageElement = card.querySelector('img.fv-plan-preview-card__img') as HTMLImageElement;
            const imageUrl = imageElement?.src || '';
            
            const linkElement = card.querySelector('a.fv-plan-preview-card__link') as HTMLAnchorElement;
            const link = linkElement?.href || '';
            
            const description = [
              title,
              location ? `en ${location}` : '',
              date ? `(${date})` : '',
              price ? `- ${price}` : ''
            ].filter(Boolean).join(' ');

            if (!title || !location) {
              return null;
            }

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
          .filter((item): item is Partial<IScrapedSource> => {
            if (!item) return false;
            const lowerTitle = (item.title || '').toLowerCase();
            return !excludeKeywords.some(keyword => lowerTitle.includes(keyword));
          });
        },
        url
      );

      const validActivities = activities.filter(activity => 
        activity.title && 
        activity.location && 
        activity.imageUrl
      );

      return validActivities;
    } catch (error) {
      console.error('Error scraping Fever:', error);
      throw new Error(`Error al extraer actividades de Fever: ${(error as Error).message}`);
    }
  }

  async saveScrapedData(data: Partial<IScrapedSource>): Promise<IScrapedSource> {
    try {
      if (!data.title || !data.location) {
        throw new Error('Datos incompletos: título y ubicación son requeridos');
      }

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