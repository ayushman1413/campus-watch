// Lost & Found Types
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'claimed' | 'returned' | 'closed';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export type Category = 
  | 'Wallet'
  | 'Phone'
  | 'Keys'
  | 'Bag'
  | 'ID Card'
  | 'Electronics'
  | 'Accessories'
  | 'Documents'
  | 'Books'
  | 'Other';

export type Location = 
  | 'Library'
  | 'Cafeteria'
  | 'Hostel'
  | 'Classroom'
  | 'Playground'
  | 'Sports Complex'
  | 'Parking'
  | 'Medical Center'
  | 'Admin Building'
  | 'Other';

// User & Profile Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  role?: 'student' | 'staff' | 'admin' | 'security';
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  department?: string;
  roll_number?: string;
  hostel_block?: string;
  room_number?: string;
  role: 'student' | 'staff' | 'admin' | 'security';
  is_verified: boolean;
  reputation_score: number;
  items_found: number;
  items_lost: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

// Lost & Found Item Types
export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  location: Location;
  status: ItemStatus;
  item_type: ItemType;
  image_url?: string;
  images?: string[];
  color?: string;
  distinguishing_marks?: string;
  date_found_lost?: string;
  ai_match_score?: number;
  ai_suggestions?: string[];
  is_claimed: boolean;
  verification_question?: string;
  tags?: string[];
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  item_owner_id: string;
  status: ClaimStatus;
  verification_answer?: string;
  message?: string;
  otp?: string;
  otp_expires_at?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  item?: Item;
  claimant?: User;
}

export interface Message {
  id: string;
  claim_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
}

// Classroom & Room Finder Types
export interface ClassroomBlock {
  id: string;
  name: string;
  building_code: string;
  floor_count: number;
  description?: string;
  location?: string;
  capacity?: number;
  created_at: string;
}

export interface Classroom {
  id: string;
  block_id: string;
  room_number: string;
  floor: number;
  capacity: number;
  amenities?: string[];
  is_available: boolean;
  availability_schedule?: Record<string, string[]>;
  last_updated: string;
  block?: ClassroomBlock;
}

export interface RoomStatus {
  id: string;
  room_id: string;
  status: 'available' | 'occupied' | 'maintenance';
  timestamp: string;
  updated_by?: string;
}

// Notification Types
export type NotificationType = 'claim' | 'message' | 'match' | 'status' | 'security' | 'announcement';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  related_item_id?: string;
  related_claim_id?: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

// Analytics Types
export interface AnalyticsData {
  total_items_lost: number;
  total_items_found: number;
  total_items_claimed: number;
  claim_success_rate: number;
  avg_time_to_claim: number;
  top_lost_categories: Record<string, number>;
  top_lost_locations: Record<string, number>;
  active_users: number;
  monthly_trend?: Record<string, number>;
}

// AI Suggestion Types
export interface AIMatch {
  item_id: string;
  matched_items: Array<{
    id: string;
    title: string;
    match_score: number;
    reason: string;
  }>;
  timestamp: string;
}

// Security Incident Types
export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  location: string;
  incident_type: 'theft' | 'damage' | 'suspicious_activity' | 'fraud';
  severity: 'low' | 'medium' | 'high';
  reported_by: string;
  reported_at: string;
  resolved: boolean;
  resolved_at?: string;
  assigned_to?: string;
  tags?: string[];
}
