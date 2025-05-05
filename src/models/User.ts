export interface User {
  username: string;
  email: string;
  bio?: string;
  location?: {
    city: string;
    coordinates: [number, number];
  };
  interests?: string[];
  profileImage?: string | null;
} 