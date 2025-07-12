import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <h1>Smile Dental Clinic</h1>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/dentists" className={styles.navLink}>Our Dentists</Link>
          <Link to="/services" className={styles.navLink}>Services</Link>
          <Link to="/my-appointments" className={styles.navLink}>My Appointments</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 