export interface User {
  _id: string;
  username: string;
  email: string;
  bio: string;
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
    formattedAddress: string;
    postalCode?: string;
    region?: string;
    timezone?: string;
  };
  interests: string[];
  profileImage: string;
  rating: number;
  joinedAt: string;
  isVerified: boolean;
} 