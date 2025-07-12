# Smile Dental Clinic Website

A modern, responsive dental clinic website built with React, TypeScript, and Firebase. This application allows patients to view dentist information and book appointments online.

## Features

- 🏥 **Home Page**: Beautiful landing page with clinic information and services
- 👨‍⚕️ **Dentists Page**: View all dentists with search and filter functionality
- 📅 **Appointment Booking**: Easy-to-use appointment booking system
- 🦷 **Services Page**: Comprehensive list of dental services offered
- 📞 **Contact Page**: Clinic information and contact details
- 🔥 **Firebase Integration**: Real-time data from Firestore database
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Modern UI**: Clean, professional design with smooth animations

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS Modules for scoped styling
- **Routing**: React Router DOM
- **Database**: Firebase Firestore
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dental-clinic
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase configuration

4. Create environment variables:
   Create a `.env` file in the root directory with your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```

5. Set up Firestore collections:
   Create the following collections in your Firestore database:

   **dentists** collection:
   ```json
   {
     "name": "Dr. John Smith",
     "specialization": "General Dentistry",
     "experience": 15,
     "education": "DDS, University of Dental Medicine",
     "imageUrl": "https://example.com/dentist-image.jpg",
     "bio": "Experienced general dentist with expertise in preventive care...",
     "availableSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
     "rating": 4.8,
     "languages": ["English", "Spanish"]
   }
   ```

   **appointments** collection:
   ```json
   {
     "dentistId": "dentist_document_id",
     "patientName": "Jane Doe",
     "patientEmail": "jane@example.com",
     "patientPhone": "+1234567890",
     "date": "2024-01-15",
     "time": "10:00",
     "service": "General Checkup",
     "status": "pending",
     "createdAt": "2024-01-10T10:00:00Z"
   }
   ```

6. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header/         # Navigation header
│   └── DentistCard/    # Individual dentist display card
├── pages/              # Main application pages
│   ├── Home/           # Landing page
│   ├── Dentists/       # Dentists listing page
│   ├── Appointments/   # Appointment booking page
│   ├── Services/       # Services offered page
│   └── Contact/        # Contact information page
├── services/           # API and data services
│   └── dentistService.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── firebase/           # Firebase configuration
│   └── config.ts
└── App.tsx            # Main application component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Customization

### Adding New Dentists

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Add new documents to the `dentists` collection with the required fields

### Modifying Services

Edit the services array in `src/pages/Services/Services.tsx` to add or modify services offered.

### Styling

The application uses CSS Modules for styling. Each component has its own `.module.css` file for scoped styling.

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Hosting:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
