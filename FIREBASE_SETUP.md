# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for both your Next.js web app and Flutter mobile app, integrated with your FastAPI backend.

## 1. Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "kochchi-app")
4. Follow the setup wizard (you can disable Google Analytics for now)

### 1.2 Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable the following providers:
   - **Email/Password** (for traditional login)
   - **Google** (for Google Sign-In)
   - **Phone** (optional, for phone number authentication)

### 1.3 Get Firebase Configuration

#### For Web (Next.js):
1. Go to Project Settings → General
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "kochchi-web")
5. Copy the Firebase config object

#### For Mobile (Flutter):
1. In Project Settings → General
2. Click the Android icon to add Android app
3. Enter your Android package name (e.g., `com.yourcompany.kochchi`)
4. Download the `google-services.json` file
5. For iOS, click the iOS icon and enter your bundle ID
6. Download the `GoogleService-Info.plist` file

## 2. Backend Setup (FastAPI)

### 2.1 Get Firebase Admin SDK Service Account
1. In Firebase Console, go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Important**: Keep this file secure and never commit it to version control

### 2.2 Configure Environment Variables
You have two options for providing the Firebase credentials:

#### Option 1: Environment Variable (Recommended)
1. Open the downloaded service account JSON file
2. Copy the entire JSON content
3. Add it to your `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

#### Option 2: File Path
1. Save the service account JSON file as `firebase-service-account.json` in your project root
2. Add to your `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

### 2.3 Install Dependencies
```bash
pip install firebase-admin==6.4.0
```

### 2.4 Test the Setup
1. Start your FastAPI server
2. Test the Firebase endpoints:
   - `POST /auth/firebase` - Firebase login
   - `POST /auth/firebase/verify` - Verify Firebase token

## 3. Frontend Setup

### 3.1 Next.js Web App Setup

#### Install Firebase SDK
```bash
npm install firebase
# or
yarn add firebase
```

#### Create Firebase Configuration
Create `lib/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### Create Authentication Hook
Create `hooks/useAuth.js`:
```javascript
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get Firebase ID token
        const idToken = await firebaseUser.getIdToken();
        
        // Send to your FastAPI backend
        try {
          const response = await fetch('/api/auth/firebase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebase_id_token: idToken
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            // Store JWT token from your backend
            localStorage.setItem('access_token', data.access_token);
            setUser({
              ...firebaseUser,
              role: data.role,
              username: data.username
            });
          }
        } catch (error) {
          console.error('Backend authentication failed:', error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('access_token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign-in error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    logout
  };
};
```

### 3.2 Flutter Mobile App Setup

#### Add Firebase Dependencies
Add to `pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  google_sign_in: ^6.1.6
```

#### Initialize Firebase
In `main.dart`:
```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MyApp());
}
```

#### Create Authentication Service
Create `services/auth_service.dart`:
```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  
  // Stream to listen to auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  
  // Sign in with Google
  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;
      
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      final userCredential = await _auth.signInWithCredential(credential);
      
      // Send to your FastAPI backend
      await _authenticateWithBackend(userCredential.user!);
      
      return userCredential;
    } catch (e) {
      print('Google sign-in error: $e');
      return null;
    }
  }
  
  // Sign in with email and password
  Future<UserCredential?> signInWithEmail(String email, String password) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Send to your FastAPI backend
      await _authenticateWithBackend(userCredential.user!);
      
      return userCredential;
    } catch (e) {
      print('Email sign-in error: $e');
      return null;
    }
  }
  
  // Authenticate with your FastAPI backend
  Future<void> _authenticateWithBackend(User firebaseUser) async {
    try {
      final idToken = await firebaseUser.getIdToken();
      
      final response = await http.post(
        Uri.parse('YOUR_API_BASE_URL/auth/firebase'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'firebase_id_token': idToken,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Store JWT token from your backend
        // You can use shared_preferences or secure_storage
        print('Backend authentication successful: ${data['access_token']}');
      } else {
        print('Backend authentication failed: ${response.statusCode}');
      }
    } catch (e) {
      print('Backend authentication error: $e');
    }
  }
  
  // Sign out
  Future<void> signOut() async {
    try {
      await _auth.signOut();
      await _googleSignIn.signOut();
    } catch (e) {
      print('Sign-out error: $e');
    }
  }
}
```

## 4. API Endpoints

Your FastAPI backend now provides these Firebase-related endpoints:

### POST `/auth/firebase`
- **Purpose**: Authenticate user with Firebase ID token
- **Request Body**: `{"firebase_id_token": "firebase_id_token_here"}`
- **Response**: JWT token and user info
- **Behavior**: Creates new user in MongoDB if doesn't exist, updates existing user

### POST `/auth/firebase/verify`
- **Purpose**: Verify Firebase token without creating/updating user
- **Request Body**: `{"firebase_id_token": "firebase_id_token_here"}`
- **Response**: Verification status and user info
- **Behavior**: Only verifies token, doesn't modify database

## 5. Security Considerations

1. **Service Account Security**: Never commit your Firebase service account key to version control
2. **Environment Variables**: Use environment variables for sensitive configuration
3. **Token Validation**: Always verify Firebase tokens on the backend
4. **HTTPS**: Use HTTPS in production for all API calls
5. **Rate Limiting**: Implement rate limiting on authentication endpoints

## 6. Testing

### Test Firebase Authentication Flow:
1. User signs in with Google/Email on frontend
2. Frontend gets Firebase ID token
3. Frontend sends token to your FastAPI backend
4. Backend verifies token with Firebase
5. Backend creates/updates user in MongoDB
6. Backend returns JWT token
7. Frontend stores JWT token for subsequent API calls

### Test with curl:
```bash
# First, get a Firebase ID token from your frontend
# Then test the backend endpoint:
curl -X POST "http://localhost:8000/auth/firebase" \
  -H "Content-Type: application/json" \
  -d '{"firebase_id_token": "your_firebase_id_token_here"}'
```

## 7. Troubleshooting

### Common Issues:
1. **Firebase initialization error**: Check your service account credentials
2. **Token verification failed**: Ensure Firebase project settings are correct
3. **CORS errors**: Configure CORS in your FastAPI app
4. **Network errors**: Check your API base URL configuration

### Debug Steps:
1. Check Firebase Console for authentication logs
2. Verify service account permissions
3. Test Firebase token verification separately
4. Check MongoDB connection and user creation
5. Verify JWT token generation

## 8. Production Deployment

1. **Environment Variables**: Set all Firebase credentials in production environment
2. **CORS**: Configure CORS for your production domains
3. **HTTPS**: Ensure all API calls use HTTPS
4. **Monitoring**: Set up logging and monitoring for authentication flows
5. **Backup**: Regularly backup your MongoDB user data

This setup provides a robust Firebase authentication system that works seamlessly across your Next.js web app, Flutter mobile app, and FastAPI backend while maintaining your existing JWT token system and MongoDB user storage. 