export interface Location {
  city: string;
  country: string;
  coordinates: [number, number];
  formattedAddress: string;
  postalCode?: string;
  region?: string;
  timezone?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  bio: string;
  location: Location;
  interests: string[];
  profileImage: string;
  rating: number;
  joinedAt: string | Date;
  isVerified: boolean;
}