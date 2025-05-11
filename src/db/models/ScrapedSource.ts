import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapedSource extends Document {
  name: string;
  url: string;
  type: 'event' | 'place' | 'activity';
  title: string;
  description: string;
  location?: string;
  date?: Date;
  price?: string;
  imageUrl?: string;
  sourceUrl: string;
  lastScraped: Date;
  isActive: boolean;
}

const ScrapedSourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['event', 'place', 'activity'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  date: { type: Date },
  price: { type: String },
  imageUrl: { type: String },
  sourceUrl: { type: String, required: true },
  lastScraped: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

ScrapedSourceSchema.index({ url: 1, type: 1 });
ScrapedSourceSchema.index({ lastScraped: 1 });

export default mongoose.model<IScrapedSource>('scrapedsources', ScrapedSourceSchema); 