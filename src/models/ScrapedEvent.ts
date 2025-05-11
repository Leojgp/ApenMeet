export interface ScrapedEvent {
    _id: string;
    name: string;
    url: string;
    type: 'event' | 'place' | 'activity';
    title: string;
    description: string;
    location?: string;
    date?: string;
    price?: string;
    imageUrl?: string;
    sourceUrl: string;
    lastScraped: string;
    isActive: boolean;
  }