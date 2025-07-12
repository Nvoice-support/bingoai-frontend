import React from 'react';
import { Link } from 'react-router-dom';
import { Dentist } from '../../types';
import styles from './DentistCard.module.css';

interface DentistCardProps {
  dentist: Dentist;
}

const DentistCard: React.FC<DentistCardProps> = ({ dentist }) => {
  const fullName = `${dentist.first_name} ${dentist.last_name}`;
  
  const renderLanguages = (languages: string) => {
    return languages.split(',').map(lang => lang.trim()).join(', ');
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <div className={styles.imagePlaceholder}>
          <span>👨‍⚕️</span>
        </div>
        <div className={styles.specialization}>
          {dentist.specialization}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>Dr. {fullName}</h3>
        
        <div className={styles.details}>
          <p className={styles.experience}>
            <strong>{dentist.years_of_experience} years</strong> of experience
          </p>
          <p className={styles.education}>{dentist.education}</p>
          <p className={styles.certifications}>{dentist.certifications}</p>
        </div>
        
        <div className={styles.contact}>
          <p><strong>Email:</strong> {dentist.email}</p>
          <p><strong>Phone:</strong> {dentist.phone_number}</p>
          <p><strong>License:</strong> {dentist.license_number}</p>
        </div>
        
        <div className={styles.languages}>
          <strong>Languages:</strong> {renderLanguages(dentist.languages)}
        </div>
        
        <div className={styles.actions}>
          <Link 
            to={`/dentists/${dentist.id}`} 
            className={styles.viewProfile}
          >
            View Profile
          </Link>
          <Link 
            to={`/availabilities/${dentist.id}`} 
            className={styles.bookAppointment}
          >
            Availabilities
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DentistCard; 