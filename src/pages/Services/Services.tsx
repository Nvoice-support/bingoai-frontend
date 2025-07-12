import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Services.module.css';

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      name: 'General Dentistry',
      description: 'Comprehensive dental care including regular checkups, cleanings, and preventive treatments to maintain your oral health.',
      icon: '🦷',
      features: ['Regular Checkups', 'Professional Cleaning', 'Cavity Fillings', 'Gum Disease Treatment'],
      duration: '30-60 minutes',
      price: 'From $100'
    },
    {
      id: 2,
      name: 'Cosmetic Dentistry',
      description: 'Transform your smile with our advanced cosmetic dental procedures designed to enhance your appearance and confidence.',
      icon: '✨',
      features: ['Teeth Whitening', 'Dental Veneers', 'Bonding', 'Smile Makeover'],
      duration: '1-3 hours',
      price: 'From $300'
    },
    {
      id: 3,
      name: 'Orthodontics',
      description: 'Straighten your teeth and improve your bite with modern orthodontic solutions including braces and clear aligners.',
      icon: '🦷',
      features: ['Traditional Braces', 'Clear Aligners', 'Retainers', 'Early Orthodontics'],
      duration: '18-24 months',
      price: 'From $2,500'
    },
    {
      id: 4,
      name: 'Emergency Care',
      description: '24/7 emergency dental care for urgent situations including severe pain, broken teeth, and dental trauma.',
      icon: '🚨',
      features: ['Emergency Extractions', 'Pain Relief', 'Broken Tooth Repair', 'Dental Trauma'],
      duration: '30-90 minutes',
      price: 'From $150'
    },
    {
      id: 5,
      name: 'Root Canal Therapy',
      description: 'Save your natural teeth with advanced root canal treatment to eliminate pain and preserve your smile.',
      icon: '🔬',
      features: ['Pain-Free Treatment', 'Advanced Technology', 'Single Visit Options', 'Follow-up Care'],
      duration: '1-2 hours',
      price: 'From $800'
    },
    {
      id: 6,
      name: 'Dental Implants',
      description: 'Permanent tooth replacement solutions that look, feel, and function like your natural teeth.',
      icon: '🦷',
      features: ['Single Implants', 'Multiple Implants', 'Full Arch Restoration', 'Implant-Supported Dentures'],
      duration: '3-6 months',
      price: 'From $3,000'
    }
  ];

  return (
    <div className={styles.services}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Our Services</h1>
          <p>Comprehensive dental care tailored to your needs</p>
        </div>

        <div className={styles.servicesGrid}>
          {services.map(service => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                {service.icon}
              </div>
              <h3 className={styles.serviceName}>{service.name}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
              
              <div className={styles.serviceDetails}>
                <div className={styles.detail}>
                  <strong>Duration:</strong> {service.duration}
                </div>
                <div className={styles.detail}>
                  <strong>Starting Price:</strong> {service.price}
                </div>
              </div>

              <div className={styles.features}>
                <h4>What's Included:</h4>
                <ul>
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <Link to="/appointments" className={styles.bookButton}>
                Book This Service
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <h2>Ready to Transform Your Smile?</h2>
          <p>Contact us today to schedule a consultation and discuss your dental care needs.</p>
          <div className={styles.ctaButtons}>
            <Link to="/appointments" className={styles.primaryButton}>
              Book Consultation
            </Link>
            <Link to="/contact" className={styles.secondaryButton}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services; 