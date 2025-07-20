import React, { useState } from 'react';
import { Appointment, Patient, Dentist } from '../../types';
import { dentistService } from '../../services/dentistService';
import styles from './MyAppointments.module.css';

interface AppointmentWithDetails extends Appointment {
  patient?: Patient;
  dentist?: Dentist | null; // Allow null for dentist
}

const MyAppointments: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const formatDate = (dateString: string) => {
    // Fix timezone issue by parsing the date properly
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return styles.statusScheduled;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'expired':
        return styles.statusExpired;
      default:
        return styles.statusScheduled;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return 'Scheduled';
    }
  };

  // Add function to check if appointment is expired
  const isAppointmentExpired = (appointmentDate: string, appointmentTime: string): boolean => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    return appointmentDateTime < now;
  };

  // Add function to update expired appointments
  const updateExpiredAppointments = async (appointments: AppointmentWithDetails[]) => {
    const updatedAppointments = [...appointments];
    let hasUpdates = false;

    for (let i = 0; i < updatedAppointments.length; i++) {
      const appointment = updatedAppointments[i];
      
      // Only check appointments that are not already expired, cancelled, or completed
      if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
        if (isAppointmentExpired(appointment.appointment_date, appointment.appointment_time)) {
          // Update the appointment status to expired in the database
          try {
            await dentistService.updateAppointmentStatus(appointment.id, 'expired');
            updatedAppointments[i] = { ...appointment, status: 'expired' };
            hasUpdates = true;
          } catch (error) {
            console.error('Error updating expired appointment:', error);
          }
        }
      }
    }

    if (hasUpdates) {
      setAppointments(updatedAppointments);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, find the patient by phone number
      const patientData = await dentistService.getPatientByPhone(phoneNumber.trim());
      
      if (!patientData) {
        setError('No patient found with this phone number. Please check your phone number or contact the clinic.');
        setAppointments([]);
        setPatient(null);
        setSearched(true);
        return;
      }

      setPatient(patientData);

      // Get appointments for this patient
      const patientAppointments = await dentistService.getPatientAppointments(patientData.id);
      
      // Get dentist details for each appointment
      const appointmentsWithDetails = await Promise.all(
        patientAppointments.map(async (appointment) => {
          const dentist = await dentistService.getDentistById(appointment.dentist_id);
          return {
            ...appointment,
            patient: patientData,
            dentist: dentist
          };
        })
      );

      // Sort appointments by date (most recent first)
      appointmentsWithDetails.sort((a, b) => {
        const dateA = new Date(a.appointment_date);
        const dateB = new Date(b.appointment_date);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(appointmentsWithDetails);
      
      // Check and update expired appointments
      await updateExpiredAppointments(appointmentsWithDetails);
      
      setSearched(true);
      
    } catch (error) {
      setError('Failed to fetch appointments. Please try again.');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, appointmentDate: string, appointmentTime: string, dentistId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    console.log('Cancelling appointment with data:', {
      appointmentId,
      appointmentDate,
      appointmentTime,
      dentistId
    });

    try {
      // Cancel appointment and free up the slot
      await dentistService.cancelAppointmentAndFreeSlot(appointmentId, appointmentDate, appointmentTime, dentistId);
      
      // Refresh the appointments list
      await handleSearch({ preventDefault: () => {} } as React.FormEvent);
      
      alert('Appointment cancelled successfully.');
    } catch (error) {
      alert('Failed to cancel appointment. Please try again.');
      console.error('Error cancelling appointment:', error);
    }
  };

  return (
    <div className={styles.myAppointments}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Appointments</h1>
          <p>Enter your phone number to view your appointments</p>
        </div>

        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className={styles.phoneInput}
                required
              />
            </div>
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Appointments'}
            </button>
          </form>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {patient && (
          <div className={styles.patientInfo}>
            <h3>Patient Information</h3>
            <div className={styles.patientDetails}>
              <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
              <p><strong>Phone:</strong> {patient.phone_number}</p>
              <p><strong>Email:</strong> {patient.email}</p>
            </div>
          </div>
        )}

        {searched && appointments.length === 0 && !error && (
          <div className={styles.noAppointments}>
            <h3>No Appointments Found</h3>
            <p>You don't have any appointments scheduled. Contact the clinic to book an appointment.</p>
          </div>
        )}

        {appointments.length > 0 && (
          <div className={styles.appointmentsList}>
            <h3>Your Appointments ({appointments.length})</h3>
            {appointments.map((appointment) => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.appointmentHeader}>
                  <div className={styles.appointmentDate}>
                    <h4>{formatDate(appointment.appointment_date)}</h4>
                    <p className={styles.appointmentTime}>
                      {formatTime(appointment.appointment_time)}
                    </p>
                  </div>
                  <div className={`${styles.statusBadge} ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </div>
                </div>

                <div className={styles.appointmentDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Dentist:</span>
                    <span className={styles.value}>
                      Dr. {appointment.dentist?.first_name} {appointment.dentist?.last_name}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Specialization:</span>
                    <span className={styles.value}>
                      {appointment.dentist?.specialization}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Procedure:</span>
                    <span className={styles.value}>
                      {appointment.procedure_type}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Urgency:</span>
                    <span className={styles.value}>
                      {appointment.urgency_level.charAt(0).toUpperCase() + appointment.urgency_level.slice(1)}
                    </span>
                  </div>
                  {appointment.notes && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Notes:</span>
                      <span className={styles.value}>{appointment.notes}</span>
                    </div>
                  )}
                </div>

                {/* Only show cancel button for non-expired, non-cancelled, non-completed appointments */}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <div className={styles.appointmentActions}>
                    <button
                      onClick={() => handleCancelAppointment(
                        appointment.id,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.dentist_id
                      )}
                      className={styles.cancelButton}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments; 