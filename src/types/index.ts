export interface Dentist {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  years_of_experience: number;
  education: string;
  certifications: string;
  email: string;
  phone_number: string;
  license_number: string;
  languages: string;
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  address: string;
  emergency_contact: string;
  medical_history: string;
  insurance_info: string;
  created_at: Date;
  updated_at: Date;
}

export interface DentistAvailability {
  id: string;
  dentist_id: string;
  day_of_week: string; // 'monday', 'tuesday', etc.
  date?: string; // '2024-01-15' - yyyy-mm-dd format (optional for backward compatibility)
  slot_time: string; // '09:00', '09:30', '10:00', etc. - 30-minute slots
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  dentist_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  procedure_type: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  urgency_level: 'routine' | 'urgent' | 'emergency';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
} 