import { Request, Response } from 'express';
import scrapingService from '../../services/scrapingService';
import ScrapedSource from '../../db/models/ScrapedSource';

export const scrapeUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const scrapedData = await scrapingService.scrapeEventPage(url);
    const savedData = await Promise.all(scrapedData.map(data => scrapingService.saveScrapedData(data)));

    res.status(200).json(savedData);
  } catch (error) {
    console.error('Error in scraping controller:', error);
    res.status(500).json({ error: 'Error scraping the provided URL' });
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