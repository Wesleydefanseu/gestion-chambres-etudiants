export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'student' | 'owner' | 'admin';
  profile_picture?: string;
  created_at: string;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  district: string;
  room_type: 'single' | 'shared' | 'studio' | 'apartment';
  amenities: string[];
  images: string[];
  available: boolean;
  owner_id: string;
  owner?: User;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  room?: Room;
  student?: User;
}

export interface Review {
  id: string;
  room_id: string;
  student_id: string;
  rating: number;
  comment: string;
  created_at: string;
  student?: User;
}

export interface District {
  id: string;
  name: string;
  description: string;
}