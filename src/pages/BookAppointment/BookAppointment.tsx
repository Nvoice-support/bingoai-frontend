import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Dentist, DentistAvailability } from '../../types';
import { dentistService } from '../../services/dentistService';
import styles from './BookAppointment.module.css';

interface PatientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  insuranceInfo: string;
}

const BookAppointment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dentistId = searchParams.get('dentist');
  const selectedDay = searchParams.get('day');
  
  const [dentist, setDentist] = useState<Dentist | null>(null);
  const [availabilities, setAvailabilities] = useState<DentistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    insuranceInfo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!dentistId || !selectedDay) {
        setError('Missing dentist or day information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [dentistData, availabilityData] = await Promise.all([
          dentistService.getDentistById(dentistId),
          dentistService.getDentistAvailability(dentistId)
        ]);

        setDentist(dentistData);
        setAvailabilities(availabilityData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch appointment data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dentistId, selectedDay]);

  const formatDayOfWeek = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', time, error);
      return 'N/A';
    }
  };

  const getSlotsForDay = () => {
    if (!selectedDay) return [];
    return availabilities
      .filter(avail => avail.day_of_week === selectedDay)
      .sort((a, b) => a.slot_time.localeCompare(b.slot_time));
  };

  const handleSlotSelection = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update to use database date instead of calculating
  const getDateFromDatabase = (dayOfWeek: string): Date | null => {
    // Find the first availability slot for this day that has a date
    const slotWithDate = availabilities.find(
      avail => avail.day_of_week === dayOfWeek && avail.date
    );
    
    if (slotWithDate?.date) {
      const [year, month, day] = slotWithDate.date.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Fallback to calculated date if no database date found
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
    
    if (targetDay === -1) return null;
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return targetDate;
  };

  // Add this function to format date as yyyy-mm-dd
  const formatDateForDatabase = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update the handleBooking function to use database date
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !dentist) return;

    // Validate required fields
    if (!patientInfo.firstName || !patientInfo.lastName || !patientInfo.email || !patientInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Find the slot object to get its Firestore ID and date
      const slotObj = availabilities.find(
        avail => avail.day_of_week === selectedDay && avail.slot_time === selectedSlot
      );
      
      if (!slotObj) throw new Error('Slot not found');

      // Use the date from the database if available, otherwise calculate
      let appointmentDateFormatted: string;
      if (slotObj.date) {
        appointmentDateFormatted = slotObj.date; // Use the date from database
      } else {
        // Fallback to calculated date
        const appointmentDate = getDateFromDatabase(selectedDay!);
        if (!appointmentDate) {
          throw new Error('Could not calculate appointment date');
        }
        appointmentDateFormatted = formatDateForDatabase(appointmentDate);
      }

      // Prepare patient data
      const patientData = {
        first_name: patientInfo.firstName,
        last_name: patientInfo.lastName,
        email: patientInfo.email,
        phone_number: patientInfo.phone,
        date_of_birth: patientInfo.dateOfBirth,
        address: patientInfo.address,
        emergency_contact: patientInfo.emergencyContact,
        medical_history: patientInfo.medicalHistory,
        insurance_info: patientInfo.insuranceInfo
      };

      // Get or create patient
      const patientId = await dentistService.getOrCreatePatient(patientData);

      // Create appointment in Firestore with the database date
      const appointment = {
        dentist_id: dentist.id,
        patient_id: patientId,
        appointment_date: appointmentDateFormatted, // Use the date from database
        appointment_time: selectedSlot,
        procedure_type: "General Consultation",
        status: "scheduled" as const,
        urgency_level: "routine" as const,
        notes: `Patient: ${patientInfo.firstName} ${patientInfo.lastName}\nPhone: ${patientInfo.phone}\nEmail: ${patientInfo.email}\nMedical History: ${patientInfo.medicalHistory}`,
      };

      // Create the appointment
      await dentistService.createAppointment(appointment);
      
      // Update the availability slot to unavailable
      await dentistService.updateAvailabilitySlot(slotObj.id, false);

      // Check if this was a new patient or existing patient
      const existingPatient = await dentistService.getPatientByPhone(patientInfo.phone);
      const patientStatus = existingPatient ? 'existing patient' : 'new patient';

      // Format the date for display with proper null checking
      let displayDate: Date;
      if (slotObj.date) {
        const [year, month, day] = slotObj.date.split('-').map(Number);
        displayDate = new Date(year, month - 1, day);
      } else {
        const calculatedDate = getDateFromDatabase(selectedDay!);
        if (!calculatedDate) {
          throw new Error('Could not determine appointment date');
        }
        displayDate = calculatedDate;
      }

      alert(`Appointment scheduled successfully for ${formatDate(displayDate)} at ${formatTime(selectedSlot)} with Dr. ${dentist.first_name} ${dentist.last_name}. ${patientStatus === 'new patient' ? 'New patient record created.' : 'Existing patient information used.'}`);
      setSelectedSlot(null);
      
      // Reset patient form
      setPatientInfo({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        insuranceInfo: ''
      });
      
      // Refresh the availability data to show updated slots
      const updatedAvailabilities = await dentistService.getDentistAvailability(dentistId!);
      setAvailabilities(updatedAvailabilities);
      
    } catch (error) {
      alert('Failed to book appointment. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceAppointment = () => {
    // Open voice call interface in a new tab
    const voiceCallUrl = 'http://localhost:3000/#cam=0&mic=1&screen=0&video=0&audio=1&chat=1&theme_color=cyan';
    window.open(voiceCallUrl, '_blank');
  };

  // Add this function to format the date nicely
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading appointment slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <Link to="/dentists" className={styles.backButton}>
          Back to Dentists
        </Link>
      </div>
    );
  }

  if (!dentist) {
    return (
      <div className={styles.error}>
        <h2>Dentist Not Found</h2>
        <p>The requested dentist could not be found.</p>
        <Link to="/dentists" className={styles.backButton}>
          Back to Dentists
        </Link>
      </div>
    );
  }

  const slotsForDay = getSlotsForDay();

  return (
    <div className={styles.bookAppointment}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to={`/availabilities/${dentistId}`} className={styles.backLink}>
            ← Back to Availability
          </Link>
          <div className={styles.dentistInfo}>
            <h2>Dr. {dentist.first_name} {dentist.last_name}</h2>
            <p className={styles.specialization}>{dentist.specialization}</p>
            <p className={styles.dayInfo}>
              <strong>Day:</strong> {formatDayOfWeek(selectedDay!)}
            </p>
            {selectedDay && (() => {
              const dateFromDB = getDateFromDatabase(selectedDay);
              return dateFromDB ? (
                <p className={styles.dateInfo}>
                  <strong>Date:</strong> {formatDate(dateFromDB)}
                </p>
              ) : null;
            })()}
          </div>
        </div>

        {slotsForDay.length > 0 ? (
          <div className={styles.slotsSection}>
            <h3>Available Time Slots</h3>
            <div className={styles.slotsGrid}>
              {slotsForDay.map((slot) => (
                <button
                  key={slot.id}
                  className={`
                    ${styles.slotButton}
                    ${!slot.is_available ? styles.unavailable : ''}
                    ${selectedSlot === slot.slot_time ? styles.selected : ''}
                  `}
                  onClick={() => slot.is_available && handleSlotSelection(slot.slot_time)}
                  disabled={!slot.is_available}
                >
                  <span className={styles.time}>{formatTime(slot.slot_time)}</span>
                  <span className={styles.duration}>30 min</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noSlots}>
            <h3>No Available Slots</h3>
            <p>There are no available time slots for {formatDayOfWeek(selectedDay!)}.</p>
            <p>Please select a different day or contact the clinic directly.</p>
          </div>
        )}

        {selectedSlot && (
          <div className={styles.bookingSection}>
            <h3>Confirm Your Appointment</h3>
            <div className={styles.bookingDetails}>
              <p><strong>Dentist:</strong> Dr. {dentist.first_name} {dentist.last_name}</p>
              <p><strong>Day:</strong> {formatDayOfWeek(selectedDay!)}</p>
              <p><strong>Time:</strong> {formatTime(selectedSlot)}</p>
              <p><strong>Duration:</strong> 30 minutes</p>
            </div>
            
            <form onSubmit={handleBooking} className={styles.patientForm}>
              <h4>Patient Information</h4>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={patientInfo.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={patientInfo.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={patientInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={patientInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={patientInfo.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="emergencyContact">Emergency Contact</label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={patientInfo.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Name and phone number"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Full Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={patientInfo.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Street address, city, state, zip code"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="medicalHistory">Medical History</label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={patientInfo.medicalHistory}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Please list any medical conditions, allergies, or medications you're currently taking"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="insuranceInfo">Insurance Information</label>
                <textarea
                  id="insuranceInfo"
                  name="insuranceInfo"
                  value={patientInfo.insuranceInfo}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Insurance provider, policy number, group number"
                />
              </div>

              <div className={styles.bookingActions}>
                <button 
                  type="submit"
                  className={styles.bookButton}
                  disabled={submitting}
                >
                  {submitting ? 'Booking Appointment...' : 'Confirm Booking'}
                </button>
                <button 
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setSelectedSlot(null)}
                >
                  Change Time
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.contactInfo}>
          <h3>Need Help?</h3>
          <p>Contact us directly for assistance:</p>
          <div className={styles.contactDetails}>
            <p><strong>Phone:</strong> {dentist.phone_number}</p>
            <p><strong>Email:</strong> {dentist.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 