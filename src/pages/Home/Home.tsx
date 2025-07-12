import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const handleVoiceConsultation = () => {
    // Open voice call interface in a new tab
    //const voiceCallUrl = 'http://localhost:3000/#cam=0&mic=1&screen=0&video=0&audio=1&chat=1&theme_color=cyan';
    const voiceCallUrl = 'https://206.206.123.234:3002/';
    window.open(voiceCallUrl, '_blank');
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to Smile Dental Clinic
          </h1>
          <p className={styles.heroSubtitle}>
            Professional dental care with a personal touch. Our experienced team of dentists 
            is committed to providing you with the highest quality dental services in a 
            comfortable and welcoming environment.
          </p>
          <div className={styles.heroActions}>
            <Link to="/appointments" className={styles.primaryButton}>
              Book Your Appointment
            </Link>
            <Link to="/dentists" className={styles.secondaryButton}>
              Meet Our Team
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imagePlaceholder}>
            <span>🏥</span>
          </div>
        </div>
      </section>

      {/* Voice Consultation Section */}
      <section className={styles.voiceConsultation}>
        <div className={styles.container}>
          <div className={styles.voiceContent}>
            <div className={styles.voiceInfo}>
              <h2>Need Immediate Assistance?</h2>
              <p>Start a voice consultation with our dental experts right now. Get instant answers to your questions and professional advice without waiting for an appointment.</p>
              <div className={styles.voiceFeatures}>
                <div className={styles.voiceFeature}>
                  <span className={styles.voiceFeatureIcon}>🎤</span>
                  <span>Voice-only consultation</span>
                </div>
                <div className={styles.voiceFeature}>
                  <span className={styles.voiceFeatureIcon}>⚡</span>
                  <span>Instant connection</span>
                </div>
                <div className={styles.voiceFeature}>
                  <span className={styles.voiceFeatureIcon}>👨‍⚕️</span>
                  <span>Expert dental advice</span>
                </div>
              </div>
              <div className={styles.voiceActions}>
                <button 
                  className={styles.voiceButton}
                  onClick={handleVoiceConsultation}
                >
                  <span className={styles.voiceIcon}>🎤</span>
                  Start Voice Consultation
                </button>
                <div className={styles.phoneNumber}>
                  <span className={styles.phoneIcon}>📞</span>
                  <a 
                    href="tel:425-620-4552" 
                    className={styles.phoneText}
                  >
                    Call: 000-000-0000
                  </a>
                </div>
              </div>
            </div>
            <div className={styles.voiceVisual}>
              <div className={styles.voiceImagePlaceholder}>
                <span>📞</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🦷</div>
              <h3>General Dentistry</h3>
              <p>Comprehensive dental care including cleanings, fillings, and preventive treatments.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🦷</div>
              <h3>Cosmetic Dentistry</h3>
              <p>Transform your smile with our advanced cosmetic dental procedures.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🦷</div>
              <h3>Orthodontics</h3>
              <p>Straighten your teeth with modern orthodontic solutions.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🦷</div>
              <h3>Emergency Care</h3>
              <p>24/7 emergency dental care when you need it most.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.whyChooseUs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>👨‍⚕️</div>
              <h3>Expert Team</h3>
              <p>Our dentists have years of experience and stay updated with the latest dental technologies.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🕒</div>
              <h3>Flexible Hours</h3>
              <p>We offer convenient appointment times to fit your busy schedule.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💳</div>
              <h3>Affordable Care</h3>
              <p>We provide quality dental care at competitive prices with flexible payment options.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🏆</div>
              <h3>Patient-First Approach</h3>
              <p>Your comfort and satisfaction are our top priorities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to Transform Your Smile?</h2>
          <p>Book your appointment today and take the first step towards a healthier, more beautiful smile.</p>
          <Link to="/appointments" className={styles.ctaButton}>
            Schedule Your Visit
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 