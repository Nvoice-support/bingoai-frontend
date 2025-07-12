import React, { useState, useEffect } from 'react';
import DentistCard from '../../components/DentistCard/DentistCard';
import { Dentist } from '../../types';
import { dentistService } from '../../services/dentistService';
import styles from './Dentists.module.css';

const Dentists: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      setLoading(true);
      const data = await dentistService.getAllDentists();
      setDentists(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dentists. Please try again later.');
      console.error('Error fetching dentists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDentists = dentists.filter(dentist => {
    const fullName = `${dentist.first_name} ${dentist.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         dentist.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === '' || 
                                 dentist.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = Array.from(new Set(dentists.map(d => d.specialization)));

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading our amazing team...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchDentists} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dentists}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Meet Our Team</h1>
          <p className={styles.subtitle}>
            Our experienced and dedicated team of dental professionals is committed to 
            providing you with the highest quality care in a comfortable environment.
          </p>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search dentists by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.specializationFilter}>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className={styles.select}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className={styles.resultsCount}>
          {filteredDentists.length} dentist{filteredDentists.length !== 1 ? 's' : ''} found
        </div>

        {/* Dentists Grid */}
        {filteredDentists.length > 0 ? (
          <div className={styles.dentistsGrid}>
            {filteredDentists.map(dentist => (
              <DentistCard key={dentist.id} dentist={dentist} />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <h3>No dentists found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dentists; 