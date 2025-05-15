import { Request, Response } from 'express';
import scrapingService from '../../services/scrapingService';
import ScrapedSource from '../../db/models/ScrapedSource';

export const scrapeUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, country } = req.body;
    
    if (!city || !country) {
      res.status(400).json({ error: 'City and country are required' });
      return;
    }

    const scrapedData = await scrapingService.scrapeEventPage(city, country);
    const savedData = await Promise.all(scrapedData.map(data => scrapingService.saveScrapedData(data)));

    if (savedData.length === 0) {

      const cityLower = city.toLowerCase();
      const countryLower = country.toLowerCase();

      const existingEvents = await ScrapedSource.find({
        $or: [
          { 'location': { $regex: cityLower, $options: 'i' } },
          { 'sourceUrl': { $regex: cityLower, $options: 'i' } },
          { 'sourceUrl': { $regex: countryLower, $options: 'i' } }
        ],
        type: 'event',
        isActive: true
      }).sort({ lastScraped: -1 });
      res.status(200).json(existingEvents);
      return;
    }

    res.status(200).json(savedData);
  } catch (error) {
    console.error('Error in scraping controller:', error);
    res.status(500).json({ error: 'Error scraping the provided location' });
  }
};

export const getScrapedSources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, limit = 10, page = 1 } = req.query;
    const query = type ? { type } : {};
    
    const sources = await ScrapedSource.find(query)
      .sort({ lastScraped: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ScrapedSource.countDocuments(query);

    res.status(200).json({
      sources,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching scraped sources:', error);
    res.status(500).json({ error: 'Error fetching scraped sources' });
  }
}; 