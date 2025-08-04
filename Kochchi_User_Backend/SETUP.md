# Kochchi Backend Setup Guide

## Quick Setup

### 1. Automatic Environment Setup

Run the setup script to create your `.env` file:

```bash
python setup_env.py
```

### 2. Manual Environment Setup (Alternative)

If you prefer manual setup, copy the example configuration file:

```bash
cp config.env.example .env
```

### 3. Configure Environment Variables

Edit the `.env` file with your actual values:

```env
# Super Admin Credentials
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=SuperAdmin123!
SUPER_ADMIN_EMAIL=superadmin@company.com
SUPER_ADMIN_FIRST_NAME=Super
SUPER_ADMIN_LAST_NAME=Admin

# Application Settings
BASE_URL=http://localhost
PORT=8000

# Database Settings
MONGODB_URL=mongodb://localhost:27017

# Email Settings
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=Acme <onboarding@resend.dev>
FRONTEND_URL=http://localhost:3000
TEST_EMAIL=kavishkanimsara.official@gmail.com

# Payment Settings
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Firebase Settings (Optional - for Firebase Authentication)
# Option 1: Set Firebase service account key as JSON string
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
# Option 2: Set path to Firebase service account JSON file
# FIREBASE_SERVICE_ACCOUNT_PATH=path/to/firebase-service-account.json

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Application

```bash
python main.py
```

## Automatic Super Admin Initialization

The application will automatically:

- ✅ Check if super admin exists
- ✅ Create super admin if not found
- ✅ Use environment variables for credentials
- ✅ Create database indexes
- ✅ Display login credentials on first run

## Manual Super Admin Creation (Optional)

If you prefer to create the super admin manually:

```bash
python init_superadmin.py
```

## Default Super Admin Credentials

- **Username**: `superadmin` (or as set in SUPER_ADMIN_USERNAME)
- **Password**: `SuperAdmin123!` (or as set in SUPER_ADMIN_PASSWORD)
- **Email**: `superadmin@company.com` (or as set in SUPER_ADMIN_EMAIL)

⚠️ **Important**: Change the password after first login for security!

## Environment Variables Reference

| Variable                 | Description               | Default                     |
| ------------------------ | ------------------------- | --------------------------- |
| `SUPER_ADMIN_USERNAME`   | Super admin username      | `superadmin`                |
| `SUPER_ADMIN_PASSWORD`   | Super admin password      | `SuperAdmin123!`            |
| `SUPER_ADMIN_EMAIL`      | Super admin email         | `superadmin@company.com`    |
| `SUPER_ADMIN_FIRST_NAME` | Super admin first name    | `Super`                     |
| `SUPER_ADMIN_LAST_NAME`  | Super admin last name     | `Admin`                     |
| `BASE_URL`               | Application base URL      | `http://localhost`          |
| `PORT`                   | Application port          | `8000`                      |
| `MONGODB_URL`            | MongoDB connection string | `mongodb://localhost:27017` |
| `RESEND_API_KEY`         | Resend email API key      | Required                    |
| `FRONTEND_URL`           | Frontend application URL  | `http://localhost:3000`     |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase service account JSON string | Optional |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account file | `firebase-service-account.json` |

## Firebase Configuration (Optional)

If you want to use Firebase Authentication, you need to configure Firebase credentials:

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file

### 2. Configure Firebase Credentials

**Option 1: Environment Variable (Recommended)**
Add the entire JSON content as a single line in your `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
```

**Option 2: File Path**
Place the downloaded JSON file in your project root and set the path:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/your-firebase-key.json
```

### 3. Frontend Configuration

Make sure your frontend Firebase configuration matches your backend project.

## Features

- 🔐 Automatic super admin initialization on startup
- 📧 Email verification sent to actual users
- 🖼️ Profile picture upload functionality
- 🗄️ Database indexes for performance
- 🧹 Automatic cleanup of expired records
- 🔄 Periodic maintenance tasks
- ⚙️ Environment-based configuration
- 🚀 Easy setup with helper scripts
- 🔥 Firebase Authentication support (optional)
