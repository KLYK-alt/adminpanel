// Admin user type
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor';
}

// Blog post type
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

// Team member type
export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  image_url?: string;
  bio?: string;
}

// Testimonial type
export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  content: string;
  rating?: number;
  image_url?: string;
}

// Statistics type
export interface Statistics {
  programs_delivered: number;
  professionals_trained: number;
  satisfaction_rate: number;
  corporate_partners: number;
}

// Partner type
export interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
}

// Authentication context types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface NewTraining {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  image_url?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  message: string;
  req_type: string;
  created_at: string;
  updated_at: string;
}

// FAQ type
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

// Service type
export interface Service {
  id: string;
  title: string;
  short_description: string;
  bullet_points: string[];
  image_url?: string;
  keywords: string[];
  created_at: string;
}

// Social Contact type
export interface SocialContact {
  id: string;
  platform: string;
  handle_or_url: string;
  contact_type?: string;
  value?: string;
  created_at: string;
}

// Mission & Vision type
export interface MissionVision {
  id: string;
  type: 'mission' | 'vision';
  content: string;
  created_at: string;
}
