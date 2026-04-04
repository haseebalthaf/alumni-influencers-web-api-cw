# Environment Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Configuration (MongoDB Atlas)](#database-configuration-mongodb-atlas)
4. [Email Configuration (Gmail SMTP)](#email-configuration-gmail-smtp)
5. [Environment Variables (.env Setup)](#environment-variables-env-setup)
6. [Running the Application](#running-the-application)
7. [Testing the Setup](#testing-the-setup)
8. [Troubleshooting](#troubleshooting)
9. [Project Structure](#project-structure)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### 1. **Node.js & npm**
- **Download**: [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
- **Verify installation**:
  ```bash
  node --version    # Should show v16.x or higher
  npm --version     # Should show v8.x or higher
  ```

### 2. **Git**
- **Download**: [https://git-scm.com/](https://git-scm.com/)
- **Verify installation**:
  ```bash
  git --version
  ```

### 3. **MongoDB Atlas Account**
- **Sign up**: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Free tier**: 512 MB storage (sufficient for development)
- Create a free MongoDB Atlas cluster before proceeding

### 4. **Gmail Account (for email functionality)**
- Need a Gmail account with 2-Factor Authentication enabled
- Will generate an App Password (different from regular password)

---

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/haseebalthaf/alumni-influencers-web-api-cw.git
cd alumni-influencers-web-api-cw
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs all required packages listed in `package.json`:
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **nodemailer**: Email sending
- **multer**: File upload handling
- **express-validator**: Input validation
- **helmet**: Security headers
- **cors**: Cross-origin requests
- **express-rate-limit**: Rate limiting
- **node-cron**: Scheduled tasks
- **swagger-ui-express**: API documentation

### Step 3: Create Environment File
```bash
cp .env.example .env
```

This creates a copy of the example environment file. You'll customize it in the next section.

---

## Database Configuration (MongoDB Atlas)

### Step 1: Create a MongoDB Atlas Cluster

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Create a Deployment"** → Select **M0 (Free Tier)**
3. Choose region closest to you
4. Click **"Create Cluster"** (takes 2-3 minutes)

### Step 2: Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Username: `alumni_admin` (or your choice)
3. Password: Generate secure password (copy it!)
4. Click **"Create User"**

### Step 3: Add Network Access

1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (for development)
   - For production, whitelist specific IPs
3. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Databases** → Click **"Connect"** on your cluster
2. Choose **"Drivers"** → Select **Node.js**
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://alumni_admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Replace Credentials

Replace `PASSWORD` with your database user's password and customize database name:
```
mongodb+srv://alumni_admin:your_password@cluster0.xxxxx.mongodb.net/alumni_bidding?retryWrites=true&w=majority
```

---

## Email Configuration (Gmail SMTP)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Click **"2-Step Verification"**
3. Follow the prompts to enable 2FA

### Step 2: Generate Gmail App Password

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - If link doesn't work: Go to Security → App Passwords (device/app section)
2. Select **Mail** and **Windows Computer** (or your OS)
3. Google generates a **16-character password**
4. Copy this password (you won't see it again!)

### Step 3: Save Credentials

Save your Gmail address and app password for the `.env` file:
- **Gmail Address**: your.email@gmail.com
- **App Password**: 16-character code from Google (spaces removed)

---

## Environment Variables (.env Setup)

### Open .env File

Use your text editor (VS Code, Notepad, etc.) to edit the `.env` file in your project root.

### Configure Each Variable

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================

# MongoDB connection string with authentication
# Format: mongodb+srv://username:password@cluster/database
MONGODB_URI=mongodb+srv://alumni_admin:your_password@cluster0.xxxxx.mongodb.net/alumni_bidding?retryWrites=true&w=majority

# ============================================
# JWT AUTHENTICATION
# ============================================

# Secret key for signing JWT tokens (use strong random string)
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_random_string_here_at_least_32_characters

# JWT token expiration time
JWT_EXPIRE=7d

# ============================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ============================================

# Gmail SMTP host
EMAIL_HOST=smtp.gmail.com

# Gmail SMTP port (587 for TLS, 465 for SSL)
EMAIL_PORT=587

# Your Gmail address
EMAIL_USER=your.email@gmail.com

# Gmail App Password (16-character code from Google, remove spaces)
EMAIL_PASS=xyzabcdefghijklm

# Email sender display name
EMAIL_FROM_NAME=Alumni Bidding Platform

# ============================================
# SERVER CONFIGURATION
# ============================================

# Server port (frontend runs on 3000)
PORT=3000

# Frontend URL for CORS and redirects
CLIENT_URL=http://localhost:3000

# Node environment (development/production)
NODE_ENV=development

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================

# Maximum file upload size
MAX_FILE_SIZE=5242880

# Allowed image file types (comma-separated MIME types)
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp

# ============================================
# API SECURITY
# ============================================

# Admin email (for notifications and access)
ADMIN_EMAIL=admin@example.com

# API rate limit (requests per window)
RATE_LIMIT_REQUESTS=100

# Rate limit window (in milliseconds)
RATE_LIMIT_WINDOW_MS=900000

# ============================================
# DATABASE CLEANUP (Optional)
# ============================================

# Whether to clean/reset database on startup
CLEAN_DATABASE_ON_START=false

# ============================================
# LOGGING
# ============================================

# Log level (error, warn, info, debug)
LOG_LEVEL=info
```

### Example Completed .env File

```bash
MONGODB_URI=mongodb+srv://alumni_admin:MySecurePass123@cluster0.abc123.mongodb.net/alumni_bidding?retryWrites=true&w=majority
JWT_SECRET=aB7cD9eF1gH3iJ5kL7mN9oP1qR3sT5uV7wX9yZ1aBcD3eF5gH7iJ9kL1
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=student@gmail.com
EMAIL_PASS=xyzabcdefghijklm
EMAIL_FROM_NAME=Alumni Bidding Platform
PORT=3000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ADMIN_EMAIL=admin@example.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
CLEAN_DATABASE_ON_START=false
LOG_LEVEL=info
```

### ⚠️ Important Security Notes

1. **Never commit .env to Git**: `.gitignore` already excludes it
2. **Keep JWT_SECRET secure**: Use a strong random string (32+ characters)
3. **Don't share app password**: Keep Gmail app password confidential
4. **For production**:
   - Use environment variables from hosting platform (Heroku, AWS, etc.)
   - Never hardcode secrets
   - Use HTTPS only
   - Restrict CORS to your domain

### Generating JWT_SECRET

If you need a new random secret, run this in Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Running the Application

### Option 1: Development Mode (with auto-reload)

```bash
npm run dev
```

This starts the server with **nodemon** which auto-restarts when you save files.

**Output should show:**
```
Server running on http://localhost:3000
Connected to MongoDB
```

### Option 2: Production Mode

```bash
npm start
```

This runs the standard Express server without auto-reload.

### Accessing the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Landing Page**: [http://localhost:3000](http://localhost:3000)

---

## Testing the Setup

### Test 1: Verify Server is Running

```bash
curl http://localhost:3000
```

Should return HTML (landing page).

### Test 2: Test API Documentation

1. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. You should see Swagger UI with all API endpoints

### Test 3: Test Database Connection

Create a test script `test-db.js`:

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
```

Run it:
```bash
node test-db.js
```

### Test 4: Test Email Configuration

Use the test endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

You should receive a test email within 30 seconds.

### Test 5: User Registration

1. Open [http://localhost:3000/register.html](http://localhost:3000/register.html)
2. Fill in:
   - Email: `test@my.westminster.ac.uk` (Westminster domain required)
   - Password: `TestPassword123` (min 8 characters)
   - First Name: `John`
   - Last Name: `Doe`
3. Click Register
4. Check your email for verification link
5. Click link to verify
6. Go to login and verify you can sign in

---

## Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solution 1**: Verify connection string
```bash
# Check MONGODB_URI in .env file
cat .env | grep MONGODB_URI
```

**Solution 2**: Restart MongoDB Atlas cluster
1. Go to MongoDB Atlas → Clusters
2. Click "..." → "Restart Cluster"
3. Wait for cluster to restart (usually 1-2 minutes)

**Solution 3**: Check IP whitelist
1. Go to MongoDB Atlas → Network Access
2. Ensure your IP is whitelisted or "Allow Access from Anywhere" is enabled

### Problem: "Invalid MongoDB connection string"

**Solution**: Ensure password doesn't contain special characters
- If password has special characters like `@`, `#`, `!`, URL encode them
- Use an online URL encoder: [https://www.urlencoder.org/](https://www.urlencoder.org/)
- Example: Password `my@pass#123` becomes `my%40pass%23123` in connection string

### Problem: Email not sending

**Solution 1**: Verify Gmail app password
```bash
# Check EMAIL_PASS in .env (should be 16 characters)
cat .env | grep EMAIL_PASS
```

**Solution 2**: Check Gmail 2FA is enabled
1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Verify "2-Step Verification" is ON

**Solution 3**: Generate new app password
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Delete old password
3. Generate new one and update .env

### Problem: Port 3000 already in use

**Solution 1**: Find and kill process on port 3000

**Windows (PowerShell)**:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Mac/Linux**:
```bash
lsof -ti:3000 | xargs kill -9
```

**Solution 2**: Use different port
```bash
PORT=5000 npm start
```

### Problem: "Failed to validate email domain"

**Solution**: Email must end with `@my.westminster.ac.uk`
- Correct: `student@my.westminster.ac.uk`
- Incorrect: `student@westminster.ac.uk` or `student@gmail.com`

### Problem: "JWT token expired" after login

**Solution**: This is expected behavior after 7 days
- User must login again
- To change expiration time, edit `JWT_EXPIRE` in .env
- Options: `7d`, `30d`, `24h`, etc.

### Problem: "Rate limit exceeded"

**Solution**: Wait 15 minutes or adjust in .env
```bash
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_REQUESTS=5        # requests per window
```

---

## Project Structure

```
alumni-influencers-web-api-cw/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic (register, login, verify)
│   ├── profileController.js # Profile management
│   ├── biddingController.js # Bidding operations
│   └── adminController.js   # Admin functions
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── apiAuth.js           # API token authentication
├── models/
│   ├── User.js              # User schema
│   ├── Profile.js           # User profile schema
│   ├── Bid.js               # Bid schema
│   ├── Winner.js            # Winner records schema
│   ├── Token.js             # API token schema
│   ├── Usage.js             # Usage tracking schema
│   └── Blacklist.js         # User blacklist schema
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── profile.js           # Profile endpoints
│   ├── bidding.js           # Bidding endpoints
│   └── admin.js             # Admin endpoints
├── public/
│   ├── index.html           # Landing page
│   ├── register.html        # Registration page
│   ├── login.html           # Login page
│   ├── profile.html         # User profile page
│   ├── bidding.html         # Bidding interface
│   └── *.js                 # Frontend JavaScript files
├── uploads/                 # User-uploaded files
├── .env                     # Environment variables (NOT in Git)
├── .env.example             # Example environment variables
├── .gitignore               # Files to ignore in Git
├── server.js                # Main application entry point
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

---

## Quick Start Checklist

✅ Install Node.js and npm  
✅ Clone the repository  
✅ Run `npm install`  
✅ Create MongoDB Atlas cluster  
✅ Generate Gmail app password  
✅ Create `.env` file with all variables  
✅ Run `npm run dev`  
✅ Access [http://localhost:3000](http://localhost:3000)  
✅ Register account with Westminster email  
✅ Verify email  
✅ Login and test bidding  

---

## Next Steps

After successful setup:

1. **Explore API Documentation**: Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. **Create Account**: Register with `@my.westminster.ac.uk` email
3. **Test Bidding**: Create bids and explore features
4. **Review Code**: Check `controllers/` and `models/` for implementation details
5. **Run Tests**: Create test scripts as needed

---

## Support

For issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review `.env` configuration
3. Check MongoDB Atlas dashboard
4. Review application logs: `npm run dev` shows errors in real-time
5. Check API documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Security Reminders

- ✅ `.env` is excluded from Git via `.gitignore`
- ✅ Never commit secrets to repository
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Gmail app password only for this app
- ✅ For production, use environment-specific security practices
- ✅ Regularly update dependencies: `npm update`
- ✅ Check for vulnerabilities: `npm audit`
