import { ScrapedEvent } from '../models/ScrapedEvent';
import api from '../api/config/axiosInstance';

function normalizeString(str: string) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export const eventService = {
  getScrapedEvents: async (city: string, country: string): Promise<ScrapedEvent[]> => {
    try {
      const normalizedCity = normalizeString(city);
      const normalizedCountry = normalizeString(country);
      
      console.log('Obteniendo eventos para:', { city: normalizedCity, country: normalizedCountry });

      const response = await api.post('/scraping/scrape', {
        city: normalizedCity,
        country: normalizedCountry
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('No se encontraron eventos para esa ciudad.');
      }

      console.log('Eventos obtenidos:', response.data.length);
      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 500 &&
        error.response.data?.error === 'Error scraping the provided location'
      ) {
        throw new Error('No se encontraron eventos para esa ciudad. Prueba con otra ciudad o revisa la ortografía.');
      }
      throw error;
    }
  },
}; 