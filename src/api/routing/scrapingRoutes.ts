import { Router } from 'express';

import { authenticateToken } from '../middlewares/authenticateToken';
import { getScrapedSources, scrapeUrl } from '../controllers/scrapingController';


const router = Router();

router.post('/scrape', authenticateToken, scrapeUrl);

router.get('/sources', authenticateToken, getScrapedSources);

export default router; 