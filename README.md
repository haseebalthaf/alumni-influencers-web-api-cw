# Alumni Influencers Web API

This is a simple Node.js project for an alumni bidding platform.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root.
3. Add your MongoDB connection string and email settings.
4. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

Your `.env` file should include at least:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM_NAME=Alumni Bidding Platform
PORT=3000
```

## Project Structure

- `server.js` - App entry point
- `config/` - Database and other setup
- `controllers/` - Request handlers
- `models/` - Mongoose schemas
- `routes/` - API routes
- `middleware/` - Authentication and helpers
- `public/` - Frontend pages and scripts

## Notes

- Use MongoDB Atlas or a local MongoDB instance.
- Generate a Gmail App Password for email sending.
- The app uses Express, Mongoose, JWT, and Nodemailer.


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
