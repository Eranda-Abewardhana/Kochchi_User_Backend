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
```

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

## Features

- 🔐 Automatic super admin initialization on startup
- 📧 Email verification sent to actual users
- 🖼️ Profile picture upload functionality
- 🗄️ Database indexes for performance
- 🧹 Automatic cleanup of expired records
- 🔄 Periodic maintenance tasks
- ⚙️ Environment-based configuration
- 🚀 Easy setup with helper scripts
