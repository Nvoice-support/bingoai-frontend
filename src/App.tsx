import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Dentists from './pages/Dentists/Dentists';
import Appointments from './pages/Appointments/Appointments';
import MyAppointments from './pages/MyAppointments/MyAppointments';
import Services from './pages/Services/Services';
import Contact from './pages/Contact/Contact';
import Availabilities from './pages/Availabilities/Availabilities';
import BookAppointment from './pages/BookAppointment/BookAppointment';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dentists" element={<Dentists />} />
            <Route path="/availabilities/:dentistId" element={<Availabilities />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
