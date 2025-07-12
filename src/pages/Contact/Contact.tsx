import React from 'react';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  return (
    <div className={styles.contact}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Contact Us</h1>
          <p>Get in touch with us for any questions or concerns</p>
        </div>

        <div className={styles.content}>
          <div className={styles.infoSection}>
            <h2>Clinic Information</h2>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.icon}>📍</div>
                <h3>Address</h3>
                <p>123 Dental Street<br />
                Medical District<br />
                City, State 12345</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.icon}>📞</div>
                <h3>Phone</h3>
                <p>Main: (555) 123-4567<br />
                Emergency: (555) 987-6543</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.icon}>✉️</div>
                <h3>Email</h3>
                <p>info@smiledental.com<br />
                appointments@smiledental.com</p>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.icon}>🕒</div>
                <h3>Hours</h3>
                <p>Monday - Friday: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 3:00 PM<br />
                Sunday: Closed</p>
              </div>
            </div>
          </div>

          <div className={styles.emergencySection}>
            <h2>Emergency Care</h2>
            <p>For dental emergencies outside of regular hours, please call our emergency line:</p>
            <div className={styles.emergencyContact}>
              <strong>(555) 987-6543</strong>
            </div>
            <p>We provide 24/7 emergency dental care for urgent situations.</p>
          </div>

          <div className={styles.mapSection}>
            <h2>Find Us</h2>
            <div className={styles.mapPlaceholder}>
              <div className={styles.mapContent}>
                <span>🗺️</span>
                <p>Interactive Map Coming Soon</p>
                <p>We're located in the heart of the medical district, easily accessible by public transportation and with ample parking available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 