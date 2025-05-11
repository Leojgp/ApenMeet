import api from '../api/config/axiosInstance';
import { ScrapedEvent } from '../models/ScrapedEvent';


class EventService {
  async getScrapedEvents(): Promise<ScrapedEvent[]> {
    try {
      const response = await api.get('/scraping/sources');
      return response.data.sources;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }
}

export const eventService = new EventService(); 