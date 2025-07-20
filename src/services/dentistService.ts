import { collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Dentist, Appointment, DentistAvailability, Patient } from '../types';

export const dentistService = {
  // Get all dentists
  async getAllDentists(): Promise<Dentist[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'dentists'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dentist[];
    } catch (error) {
      console.error('Error fetching dentists:', error);
      throw error;
    }
  },

  // Get a single dentist by ID
  async getDentistById(id: string): Promise<Dentist | null> {
    try {
      const docRef = doc(db, 'dentists', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Dentist;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching dentist:', error);
      throw error;
    }
  },

  // Get availability for a specific dentist
  async getDentistAvailability(dentistId: string): Promise<DentistAvailability[]> {
    try {
      const q = query(collection(db, 'dentist_availability'), where('dentist_id', '==', dentistId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DentistAvailability[];
    } catch (error) {
      console.error('Error fetching dentist availability:', error);
      throw error;
    }
  },

  // Update availability slot (mark as unavailable/available)
  async updateAvailabilitySlot(slotId: string, isAvailable: boolean): Promise<void> {
    try {
      const slotRef = doc(db, 'dentist_availability', slotId);
      await updateDoc(slotRef, {
        is_available: isAvailable,
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating availability slot:', error);
      throw error;
    }
  },

  // Get patient by phone number
  async getPatientByPhone(phoneNumber: string): Promise<Patient | null> {
    try {
      const q = query(collection(db, 'patients'), where('phone_number', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Patient;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching patient by phone:', error);
      throw error;
    }
  },

  // Create a new patient
  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...patientData,
        created_at: new Date(),
        updated_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Get or create patient by phone number
  async getOrCreatePatient(patientInfo: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    date_of_birth: string;
    address: string;
    emergency_contact: string;
    medical_history: string;
    insurance_info: string;
  }): Promise<string> {
    try {
      // First, try to find existing patient by phone number
      const existingPatient = await this.getPatientByPhone(patientInfo.phone_number);
      
      if (existingPatient) {
        console.log('Found existing patient:', existingPatient.id);
        return existingPatient.id;
      } else {
        // Create new patient
        const patientId = await this.createPatient(patientInfo);
        console.log('Created new patient:', patientId);
        return patientId;
      }
    } catch (error) {
      console.error('Error getting or creating patient:', error);
      throw error;
    }
  },

  // Create a new appointment
  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointment,
        created_at: new Date(),
        updated_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Get appointments for a specific dentist
  async getDentistAppointments(dentistId: string): Promise<Appointment[]> {
    try {
      const q = query(collection(db, 'appointments'), where('dentist_id', '==', dentistId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get appointments for a specific patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const q = query(collection(db, 'appointments'), where('patient_id', '==', patientId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'expired'): Promise<void> {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: status,
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Get availability slot by appointment details - Using date field directly
  async getAvailabilitySlotByAppointment(appointmentDate: string, appointmentTime: string, dentistId: string): Promise<DentistAvailability | null> {
    try {
      console.log('Looking for slot with:', {
        dentistId,
        appointmentDate,
        appointmentTime
      });
      
      // Get all availability slots for this dentist
      const allSlots = await this.getDentistAvailability(dentistId);
      console.log('All slots for dentist:', allSlots.map(slot => ({
        id: slot.id,
        day: slot.day_of_week,
        date: slot.date,
        time: slot.slot_time,
        available: slot.is_available
      })));
      
      // Find the specific slot by matching date and time directly
      const targetSlot = allSlots.find(slot => {
        // Try to match by date first (if available)
        if (slot.date) {
          const dateMatches = slot.date === appointmentDate;
          const timeMatches = slot.slot_time === appointmentTime;
          const matches = dateMatches && timeMatches;
          
          console.log(`Checking slot with date: date=${slot.date} (${appointmentDate}), time=${slot.slot_time} (${appointmentTime})`);
          console.log(`  Date matches: ${dateMatches}, Time matches: ${timeMatches}, Total matches: ${matches}`);
          
          return matches;
        } else {
          // Fallback to day_of_week matching (for backward compatibility)
          const [year, month, day] = appointmentDate.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const appointmentDayOfWeek = daysOfWeek[date.getDay()];
          
          const dayMatches = slot.day_of_week === appointmentDayOfWeek;
          const timeMatches = slot.slot_time === appointmentTime;
          const matches = dayMatches && timeMatches;
          
          console.log(`Checking slot with day: day=${slot.day_of_week} (${appointmentDayOfWeek}), time=${slot.slot_time} (${appointmentTime})`);
          console.log(`  Day matches: ${dayMatches}, Time matches: ${timeMatches}, Total matches: ${matches}`);
          
          return matches;
        }
      });
      
      if (targetSlot) {
        console.log('✅ Found target slot:', {
          id: targetSlot.id,
          day: targetSlot.day_of_week,
          date: targetSlot.date,
          time: targetSlot.slot_time,
          available: targetSlot.is_available
        });
      } else {
        console.log('❌ No matching slot found');
      }
      
      return targetSlot || null;
      
    } catch (error) {
      console.error('Error fetching availability slot by appointment:', error);
      throw error;
    }
  },

  // Cancel appointment and free up the slot
  async cancelAppointmentAndFreeSlot(appointmentId: string, appointmentDate: string, appointmentTime: string, dentistId: string): Promise<void> {
    try {
      console.log('=== STARTING CANCELLATION PROCESS ===');
      console.log('Cancelling appointment:', {
        appointmentId,
        appointmentDate,
        appointmentTime,
        dentistId
      });

      // First, update the appointment status
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updated_at: new Date()
      });
      
      console.log('✅ Appointment status updated to cancelled');

      // Then find and update the availability slot
      console.log('🔍 Looking for availability slot to free...');
      const availabilitySlot = await this.getAvailabilitySlotByAppointment(appointmentDate, appointmentTime, dentistId);
      
      if (availabilitySlot) {
        console.log('✅ Found availability slot to free:', availabilitySlot.id);
        
        const slotRef = doc(db, 'dentist_availability', availabilitySlot.id);
        await updateDoc(slotRef, {
          is_available: true,
          updated_at: new Date()
        });
        
        console.log('✅ Availability slot freed successfully');
      } else {
        console.log('❌ No availability slot found to free');
      }
      
      console.log('=== CANCELLATION PROCESS COMPLETED ===');
      
    } catch (error) {
      console.error('❌ Error cancelling appointment and freeing slot:', error);
      throw error;
    }
  }
}; 