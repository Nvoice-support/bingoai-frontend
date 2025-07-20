import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dentist, DentistAvailability } from '../../types';
import { dentistService } from '../../services/dentistService';
import styles from './Availabilities.module.css';

const Availabilities: React.FC = () => {
  const { dentistId } = useParams<{ dentistId: string }>();
  const [dentist, setDentist] = useState<Dentist | null>(null);
  const [availabilities, setAvailabilities] = useState<DentistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDentistAndAvailability = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching data for dentist ID:', dentistId);
      
      const [dentistData, availabilityData] = await Promise.all([
        dentistService.getDentistById(dentistId!),
        dentistService.getDentistAvailability(dentistId!)
      ]);
      
      console.log('Fetched dentist data:', dentistData);
      console.log('Fetched availability data:', availabilityData);
      console.log('Number of availability records:', availabilityData.length);
      
      if (availabilityData.length > 0) {
        console.log('First availability record:', availabilityData[0]);
        console.log('Available records:', availabilityData.filter(a => a.is_available));
      }
      
      setDentist(dentistData);
      setAvailabilities(availabilityData);
      setError(null);
    } catch (err) {
      console.error('Error in fetchDentistAndAvailability:', err);
      setError('Failed to fetch dentist information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dentistId]);

  useEffect(() => {
    if (dentistId) {
      fetchDentistAndAvailability();
    }
  }, [dentistId, fetchDentistAndAvailability]);

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

  const getAvailableSlotsByDay = () => {
    console.log('Processing availabilities:', availabilities);
    const availableSlots = availabilities.filter(avail => avail.is_available);
    console.log('Available slots:', availableSlots);
    
    const groupedByDay: { [key: string]: { slots: string[], date?: string } } = {};
    
    availableSlots.forEach(slot => {
      console.log('Processing slot:', slot);
      if (!groupedByDay[slot.day_of_week]) {
        groupedByDay[slot.day_of_week] = { slots: [], date: slot.date };
      }
      groupedByDay[slot.day_of_week].slots.push(slot.slot_time);
      // Use the date from the first slot for this day (they should all be the same)
      if (!groupedByDay[slot.day_of_week].date && slot.date) {
        groupedByDay[slot.day_of_week].date = slot.date;
      }
    });
    
    // Sort time slots within each day
    Object.keys(groupedByDay).forEach(day => {
      groupedByDay[day].slots.sort();
    });
    
    console.log('Grouped by day:', groupedByDay);
    console.log('Days with availability:', Object.keys(groupedByDay));
    Object.keys(groupedByDay).forEach(day => {
      console.log(`${day}: ${groupedByDay[day].slots.length} slots - ${groupedByDay[day].slots.join(', ')} - Date: ${groupedByDay[day].date}`);
    });
    
    return groupedByDay;
  };

  const getTimeRange = (slots: string[]) => {
    if (slots.length === 0) return 'No slots available';
    
    const startTime = formatTime(slots[0]);
    
    // Add 30 minutes to the last slot to get the end time
    const lastSlot = slots[slots.length - 1];
    const [hours, minutes] = lastSlot.split(':');
    const endHour = parseInt(hours);
    const endMinute = parseInt(minutes) + 30;
    
    let finalEndHour = endHour;
    let finalEndMinute = endMinute;
    
    if (finalEndMinute >= 60) {
      finalEndHour += 1;
      finalEndMinute -= 60;
    }
    
    const finalEndTime = formatTime(`${finalEndHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`);
    
    return `${startTime} - ${finalEndTime}`;
  };

  // Add this function to format the date from database
  const formatDateFromDatabase = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date from database:', dateString, error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchDentistAndAvailability} className={styles.retryButton}>
          Try Again
        </button>
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

  const availableDays = getAvailableSlotsByDay();
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  console.log('Total availabilities:', availabilities.length);
  console.log('Available days:', Object.keys(availableDays));
  console.log('Number of available days:', Object.keys(availableDays).length);
  console.log('Day order:', dayOrder);

  return (
    <div className={styles.availabilities}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/dentists" className={styles.backLink}>
            ← Back to Dentists
          </Link>
          <h1>Dr. {dentist.first_name} {dentist.last_name}</h1>
          <p className={styles.specialization}>{dentist.specialization}</p>
        </div>

        <div className={styles.dentistInfo}>
          <div className={styles.infoCard}>
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> {dentist.email}</p>
            <p><strong>Phone:</strong> {dentist.phone_number}</p>
            <p><strong>Experience:</strong> {dentist.years_of_experience} years</p>
            <p><strong>Education:</strong> {dentist.education}</p>
            <p><strong>Certifications:</strong> {dentist.certifications}</p>
          </div>
        </div>

        <div className={styles.availabilitySection}>
          <h2>Weekly Availability</h2>
          
          {Object.keys(availableDays).length > 0 ? (
            <div className={styles.availabilityGrid}>
              {dayOrder.map(day => {
                const dayData = availableDays[day];
                console.log(`Checking day ${day}:`, dayData);
                if (!dayData || dayData.slots.length === 0) {
                  console.log(`No slots for ${day}`);
                  return null;
                }
                
                // Use the date from the database
                const dateDisplay = formatDateFromDatabase(dayData.date);
                
                console.log(`Rendering card for ${day} with ${dayData.slots.length} slots, date: ${dayData.date}`);
                return (
                  <div key={day} className={styles.availabilityCard}>
                    <div className={styles.dayHeader}>
                      <h3>{formatDayOfWeek(day)}</h3>
                      {dateDisplay && (
                        <span className={styles.dateDisplay}>{dateDisplay}</span>
                      )}
                    </div>
                    <div className={styles.timeSlot}>
                      <p>
                        <strong>Available:</strong> {getTimeRange(dayData.slots)}
                      </p>
                      <p className={styles.slotCount}>
                        <strong>Slots:</strong> {dayData.slots.length} available
                      </p>
                    </div>
                    <Link 
                      to={`/book-appointment?dentist=${dentistId}&day=${day}`}
                      className={styles.bookButton}
                    >
                      Book Appointment
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noAvailability}>
              <h3>No Availability Found</h3>
              <p>This dentist currently has no available time slots.</p>
              <p>Please contact the clinic directly for scheduling.</p>
              <div className={styles.debugInfo}>
                <p><strong>Debug Info:</strong></p>
                <p>Total availability records: {availabilities.length}</p>
                <p>Available records: {availabilities.filter(a => a.is_available).length}</p>
                <p>Dentist ID being searched: {dentistId}</p>
                {availabilities.length > 0 && (
                  <div>
                    <p>Sample record:</p>
                    <pre>{JSON.stringify(availabilities[0], null, 2)}</pre>
                  </div>
                )}
                {availabilities.length === 0 && (
                  <div>
                    <p><strong>No records found in dentist_availability collection</strong></p>
                    <p>This could mean:</p>
                    <ul>
                      <li>No availability records exist for this dentist</li>
                      <li>The dentist_id field doesn't match</li>
                      <li>There's an issue with the Firestore query</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.cta}>
          <h3>Need to schedule urgently?</h3>
          <p>Contact us directly for emergency appointments or special scheduling needs.</p>
          <div className={styles.contactInfo}>
            <p><strong>Phone:</strong> {dentist.phone_number}</p>
            <p><strong>Email:</strong> {dentist.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availabilities; 