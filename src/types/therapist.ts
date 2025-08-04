export interface Therapist {
  id: string;
  user_id?: string;
  full_name?: string;
  profile_image_url?: string | null;
  email?: string;
  bio: string | null;
  specialization: string | null;
  years_experience: number;
  hourly_rate: number;
  availability: any; // JSONB from database
  rating: number;
  languages: string[];
  therapy_approaches: string[];
  education: string | null;
  license_number: string | null;
  license_type: string | null;
  insurance_info: string | null;
  session_formats: string[];
  has_insurance: boolean;
  is_verified: boolean;
  is_community_therapist: boolean;
  application_status: string;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export interface TherapistAdmin {
  id: string;
  full_name: string;
  email: string;
  bio: string | null;
  specialization: string | null;
  years_experience: number;
  hourly_rate: number;
  availability: any;
  rating: number;
  languages: string[];
  therapy_approaches: string[];
  education: string | null;
  license_number: string | null;
  license_type: string | null;
  insurance_info: string | null;
  session_formats: string[];
  has_insurance: boolean;
  is_verified: boolean;
  is_community_therapist: boolean;
  application_status: string;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  notes?: string | null;
  client_notes?: string | null;
  booking_request_id?: string | null;
  payment_id?: string | null;
  created_at: string;
  updated_at: string;
  meeting_link?: string;
}

export interface TherapistWithProfile extends Therapist {
  full_name: string;
  profile_image_url: string | null;
  email: string;
  // Add specialization as computed field
  specialization: string;
}