# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "dental-clinic")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 3: Set Up Firestore Security Rules

**IMPORTANT**: If you're getting "Missing or insufficient permissions" error, you need to update your security rules.

1. In Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Replace the existing rules with these (for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Click "Publish"

**Note**: These rules allow full access for development. For production, you should implement proper authentication and more restrictive rules.

## Step 4: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "dental-clinic-web")
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 5: Create Environment File

1. In your `dental-clinic` folder, create a file named `.env`
2. Add the following content, replacing with your actual values:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```

## Step 6: Add Sample Dentist Data

1. In Firebase Console, go to "Firestore Database"
2. Click "Start collection"
3. Collection ID: `dentists`
4. Add a document with the following fields:

```json
{
  "first_name": "Lisa",
  "last_name": "Chen",
  "specialization": "Orthodontics",
  "years_of_experience": 10,
  "education": "DDS, University of Pennsylvania",
  "certifications": "Board Certified in Orthodontics",
  "email": "lisa.chen@dental.com",
  "phone_number": "555-0102",
  "license_number": "DDS234567",
  "languages": "English, Mandarin",
  "created_at": "2025-07-06T21:29:40.000Z",
  "updated_at": "2025-07-06T21:29:40.000Z"
}
```

Add a few more dentists with different specializations:

```json
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "specialization": "General Dentistry",
  "years_of_experience": 12,
  "education": "DDS, Harvard School of Dental Medicine",
  "certifications": "Board Certified in General Dentistry",
  "email": "sarah.johnson@dental.com",
  "phone_number": "555-0103",
  "license_number": "DDS234568",
  "languages": "English, Spanish",
  "created_at": "2025-07-06T21:29:40.000Z",
  "updated_at": "2025-07-06T21:29:40.000Z"
}
```

```json
{
  "first_name": "Michael",
  "last_name": "Rodriguez",
  "specialization": "Cosmetic Dentistry",
  "years_of_experience": 15,
  "education": "DDS, Cosmetic Dentistry, NYU College of Dentistry",
  "certifications": "Board Certified in Cosmetic Dentistry",
  "email": "michael.rodriguez@dental.com",
  "phone_number": "555-0104",
  "license_number": "DDS234569",
  "languages": "English, Spanish, Portuguese",
  "created_at": "2025-07-06T21:29:40.000Z",
  "updated_at": "2025-07-06T21:29:40.000Z"
}
```

## Step 7: Test Your Application

1. Make sure your `.env` file is saved
2. Restart your development server:
   ```bash
   npm start
   ```
3. Navigate to the "Dentists" page
4. You should now see your dentist data loaded from Firestore!

## Step 8: Test Appointment Booking

1. Go to the "Book Appointment" page
2. Select a dentist from the dropdown
3. Fill out the appointment form
4. Submit the form
5. Check your Firestore Database - you should see a new `appointments` collection with your booking

## Troubleshooting

- **"Missing or insufficient permissions" error**: Make sure you've updated the Firestore security rules to allow read/write access
- **"Firebase not initialized" error**: Make sure your `.env` file is in the correct location and has the right variable names
- **No data showing**: Verify that your collection is named exactly `dentists` and documents have the correct field names
- **Collection not found**: Make sure you've created the `dentists` collection in Firestore

## Security Rules for Production

For production, you should implement proper authentication and more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read dentists
    match /dentists/{document} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to create appointments
    match /appointments/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Your dental clinic website should now be fully functional with real data from Firebase! 🦷✨ 