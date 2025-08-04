export interface Friend {
  id: string;
  full_name: string | null;
  profile_image_url?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface FriendDetails {
  id: string;
  friend_id: string;
  experience_description: string | null;
  area_of_experience: string | null;
  personal_story: string | null;
  communication_preferences: string | null;
  created_at: string;
  updated_at: string;
}

export interface FriendWithDetails extends Friend {
  friend_details: FriendDetails | null;
}

export interface FriendListingData {
  id: string;
  full_name: string | null;
  profile_image_url: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  friend_details: {
    experience_description: string;
    area_of_experience: string;
    personal_story: string;
    communication_preferences: string;
  };
}