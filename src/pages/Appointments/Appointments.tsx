import React, { useState, useEffect } from 'react';
import { dentistService } from '../../services/dentistService';
import { Dentist, DentistAvailability } from '../../types';
import styles from './Appointments.module.css';

interface FormData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  procedureType: string;
  urgencyLevel: string;
  notes: string;
}

const Appointments: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [availabilities, setAvailabilities] = useState<DentistAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    date: '',
    time: '',
    procedureType: '',
    urgencyLevel: 'routine',
    notes: ''
  });

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const dentistsData = await dentistService.getAllDentists();
        setDentists(dentistsData);
      } catch (err) {
        console.error('Error fetching dentists:', err);
      }
    };

    fetchDentists();
  }, []);

  // Fetch availability when dentist or date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedDentist && formData.date) {
        try {
          console.log('Fetching availability for dentist:', selectedDentist);
          const availabilityData = await dentistService.getDentistAvailability(selectedDentist);
          console.log('Fetched availability data:', availabilityData);
          
          // Log the unique day values in the database (fixed for TypeScript)
          const uniqueDays = availabilityData
            .map(slot => slot.day_of_week)
            .filter((day, index, array) => array.indexOf(day) === index);
          console.log('Unique day values in database:', uniqueDays);
          
          console.log('Setting availabilities state with:', availabilityData.length, 'records');
          setAvailabilities(availabilityData);
        } catch (err) {
          console.error('Error fetching availability:', err);
          setAvailabilities([]);
        }
      } else {
        console.log('No dentist or date selected, clearing availabilities');
        setAvailabilities([]);
      }
    };

    fetchAvailability();
  }, [selectedDentist, formData.date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset time when date changes
    if (name === 'date') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        time: ''
      }));
    }
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

  const getAvailableSlotsForDate = () => {
    if (!formData.date || !selectedDentist) {
      console.log('No date or dentist selected');
      return [];
    }
    
    // Convert date to day of week
    const [year, month, day] = formData.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    console.log('Looking for slots:', {
      selectedDate: formData.date,
      dayOfWeek: dayOfWeek,
      totalAvailabilities: availabilities.length,
      availabilities: availabilities
    });
    
    const filteredSlots = availabilities
      .filter(avail => {
        // Make the comparison case-insensitive
        const dayMatches = avail.day_of_week.toLowerCase() === dayOfWeek.toLowerCase();
        const available = avail.is_available;
        console.log(`Checking slot: day=${avail.day_of_week} (${dayOfWeek}), available=${avail.is_available}, matches=${dayMatches && available}`);
        return dayMatches && available;
      })
      .sort((a, b) => a.slot_time.localeCompare(b.slot_time));
    
    console.log('Available slots for date:', filteredSlots);
    
    return filteredSlots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDentist) {
      setError('Please select a dentist');
      return;
    }

    if (!formData.patientName || !formData.patientEmail || !formData.patientPhone || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare patient data
      const patientData = {
        first_name: formData.patientName.split(' ')[0] || formData.patientName,
        last_name: formData.patientName.split(' ').slice(1).join(' ') || '',
        email: formData.patientEmail,
        phone_number: formData.patientPhone,
        date_of_birth: '',
        address: '',
        emergency_contact: '',
        medical_history: '',
        insurance_info: ''
      };

      // Get or create patient
      const patientId = await dentistService.getOrCreatePatient(patientData);

      // Convert appointment date to day of week for availability check
      const [year, month, day] = formData.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = daysOfWeek[date.getDay()];

      console.log('Looking for slot in handleSubmit:', {
        dayOfWeek: dayOfWeek,
        appointmentTime: formData.time,
        availabilitiesCount: availabilities.length
      });

      // Find the availability slot with case-insensitive comparison
      const slotObj = availabilities.find(
        avail => 
          avail.day_of_week.toLowerCase() === dayOfWeek.toLowerCase() && 
          avail.slot_time === formData.time
      );

      console.log('Found slot object:', slotObj);

      if (!slotObj) {
        throw new Error('Selected time slot is not available. Please choose a different time.');
      }

      if (!slotObj.is_available) {
        throw new Error('This time slot is already booked. Please choose a different time.');
      }

      // Create appointment
      await dentistService.createAppointment({
        dentist_id: selectedDentist,
        patient_id: patientId,
        appointment_date: formData.date,
        appointment_time: formData.time,
        procedure_type: formData.procedureType,
        urgency_level: formData.urgencyLevel as 'routine' | 'urgent' | 'emergency',
        notes: formData.notes || null,
        status: 'scheduled'
      });

      // Update availability slot to unavailable
      await dentistService.updateAvailabilitySlot(slotObj.id, false);

      setSubmitted(true);
      setFormData({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        date: '',
        time: '',
        procedureType: '',
        urgencyLevel: 'routine',
        notes: ''
      });
      setSelectedDentist('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment. Please try again.');
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDentistData = dentists.find(d => d.id === selectedDentist);
  const availableSlots = getAvailableSlotsForDate();

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>✅</div>
          <h2>Appointment Booked Successfully!</h2>
          <p>Thank you for choosing our dental clinic. We've received your appointment request and will contact you shortly to confirm the details.</p>
          <button 
            onClick={() => setSubmitted(false)} 
            className={styles.newAppointmentButton}
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appointments}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Book Your Appointment</h1>
          <p>Schedule your visit with our experienced dental professionals</p>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Dentist Selection */}
            <div className={styles.formGroup}>
              <label htmlFor="dentist" className={styles.label}>
                Select Dentist *
              </label>
              <select
                id="dentist"
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Choose a dentist...</option>
                {dentists.map(dentist => (
                  <option key={dentist.id} value={dentist.id}>
                    Dr. {dentist.first_name} {dentist.last_name} - {dentist.specialization}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Dentist Info */}
            {selectedDentistData && (
              <div className={styles.dentistInfo}>
                <h3>Selected Dentist</h3>
                <div className={styles.dentistCard}>
                  <div className={styles.dentistImage}>
                    <span>👨‍⚕️</span>
                  </div>
                  <div className={styles.dentistDetails}>
                    <h4>Dr. {selectedDentistData.first_name} {selectedDentistData.last_name}</h4>
                    <p>{selectedDentistData.specialization}</p>
                    <p>{selectedDentistData.years_of_experience} years of experience</p>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="patientName" className={styles.label}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="patientEmail" className={styles.label}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="patientEmail"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="patientPhone" className={styles.label}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="patientPhone"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            {/* Appointment Details */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date" className={styles.label}>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={styles.input}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="time" className={styles.label}>
                  Preferred Time *
                </label>
                {availableSlots.length > 0 ? (
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Select available time...</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.slot_time} value={slot.slot_time}>
                        {formatTime(slot.slot_time)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    className={styles.select}
                    disabled
                  >
                    <option value="">No available slots for selected date</option>
                  </select>
                )}
              </div>
            </div>

            {availableSlots.length === 0 && formData.date && selectedDentist && (
              <div className={styles.noSlots}>
                <p>No available time slots for the selected date. Please choose a different date or contact the clinic directly.</p>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="procedureType" className={styles.label}>
                  Procedure Type *
                </label>
                <select
                  id="procedureType"
                  name="procedureType"
                  value={formData.procedureType}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select procedure...</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="Dental Cleaning">Dental Cleaning</option>
                  <option value="Cavity Filling">Cavity Filling</option>
                  <option value="Root Canal">Root Canal</option>
                  <option value="Tooth Extraction">Tooth Extraction</option>
                  <option value="Dental Crown">Dental Crown</option>
                  <option value="Teeth Whitening">Teeth Whitening</option>
                  <option value="Orthodontic Consultation">Orthodontic Consultation</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="urgencyLevel" className={styles.label}>
                  Urgency Level *
                </label>
                <select
                  id="urgencyLevel"
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={4}
                placeholder="Any special requirements or additional information..."
              />
            </div>

            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading || availableSlots.length === 0}
              >
                {loading ? 'Booking Appointment...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {selectedDentist && formData.date && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          margin: '10px 0', 
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <h4>Debug Info:</h4>
          <p><strong>Selected Dentist ID:</strong> {selectedDentist}</p>
          <p><strong>Selected Date:</strong> {formData.date}</p>
          <p><strong>Day of Week:</strong> {(() => {
            const [year, month, day] = formData.date.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            return daysOfWeek[date.getDay()];
          })()}</p>
          <p><strong>Availabilities State Length:</strong> {availabilities.length}</p>
          <p><strong>Available Slots:</strong> {availableSlots.length}</p>
          {availabilities.length > 0 && (
            <div>
              <p><strong>First 5 Availability Records:</strong></p>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {availabilities.slice(0, 5).map((slot, index) => (
                  <li key={index}>
                    Day: {slot.day_of_week}, Time: {slot.slot_time}, Available: {slot.is_available ? 'Yes' : 'No'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {availabilities.length === 0 && (
            <p><strong>No availability records in state</strong></p>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments; 