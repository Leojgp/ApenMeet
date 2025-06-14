import { User } from './User';

export interface Plan {
  id: string;
  _id?: string;
  title: string;
  description: string;
  creatorId: string;
  creatorUsername?: string;
  imageUrl?: string;
  location: {
    address: string;
    coordinates: [number, number];
    city?: string;
    country?: string;
  };
  tags: string[];
  dateTime: string;
  maxParticipants: number;
  participants: {
    id: string;
    _id?: string;
    username: string;
  }[];
  admins: {
    id: string;
    _id?: string;
    username: string;
  }[];
  origin: string;
  createdAt: Date;
  status: string;
  creator?: User;
  participantsDetails?: User[];
}

export const fromApiResponse = (data: any): Plan => ({
  id: data._id || data.id,
  title: data.title,
  description: data.description,
  creatorId: data.creatorId?._id || data.creatorId || '',
  creatorUsername: data.creatorId?.username || data.creatorUsername || '',
  imageUrl: data.imageUrl,
  location: data.location,
  tags: data.tags || [],
  dateTime: data.dateTime,
  maxParticipants: data.maxParticipants,
  participants: data.participants || [],
  admins: data.admins || [],
  origin: data.origin,
  createdAt: new Date(data.createdAt),
  status: data.status,
  creator: data.creator,
  participantsDetails: data.participantsDetails
}); 