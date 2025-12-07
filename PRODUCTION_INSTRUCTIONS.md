# Production Instructions

## Local Development Setup

### Prerequisites
- Bun installed (`npm install -g bun`)
- Node.js 18+

### Starting the Backend (Required)

The frontend needs the backend API running to fetch market data, send alerts, etc.

```bash
# Terminal 1: Start the backend
cd backend
bun install
bun run dev
```

The backend will start on `http://localhost:3000`

### Starting the Frontend

```bash
# Terminal 2: Start the Expo frontend
bun install
bunx expo start --clear
```

### Configuring the API URL

When running on a **physical device**, `localhost` refers to the device itself, not your computer. You must update the API URL:

1. Find your computer's local IP address:
   - **Windows**: `ipconfig` → Look for "IPv4 Address" (e.g., `192.168.86.37`)
   - **Mac**: `ifconfig | grep "inet "` → Look for your Wi-Fi IP

2. Update `src/lib/api.ts` with your IP:
   ```typescript
   const BACKEND_URL = 
     process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || 
     process.env.EXPO_PUBLIC_BACKEND_URL ||
     "http://YOUR_IP_HERE:3000";  // e.g., "http://192.168.86.37:3000"
   ```

3. Ensure your firewall allows connections on port 3000

### Database Setup (Local)

The backend uses PostgreSQL. For local development:

1. Create a `.env` file in the `backend` folder:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/inside_edition"
   BETTER_AUTH_SECRET="your-dev-secret-at-least-32-chars-long"
   NODE_ENV=development
   PORT=3000
   ```

2. Run migrations:
   ```bash
   cd backend
   bunx prisma migrate dev
   ```

3. (Optional) Seed test data:
   ```bash
   bun run seed
   ```

---

## Deployment Overview

The Inside Edition Call List can be deployed as:
1. **PWA** (Progressive Web App) - Works on any browser
2. **Mobile App** - Native iOS/Android via Expo

### Recommended Architecture
- **Backend**: Railway (with PostgreSQL)
- **Frontend**: Vercel or Netlify (PWA)
- **Mobile**: Expo EAS Build (optional)

## Railway Backend Deployment

See `MD_DOCS/RAILWAY_DEPLOYMENT.md` for full instructions.

### Quick Start
1. Create Railway project from GitHub
2. Add PostgreSQL database (auto-configures `DATABASE_URL`)
3. Set environment variables:
   - `BETTER_AUTH_SECRET` (required, 32+ chars)
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.vercel.app`

## Frontend PWA Deployment

See `MD_DOCS/PWA_DEPLOYMENT.md` for full instructions.

### Quick Start
1. Connect GitHub to Vercel/Netlify
2. Set `EXPO_PUBLIC_BACKEND_URL` to your Railway backend URL
3. Deploy automatically on push

## Environment Variables

### Backend (Railway)

```env
# Required
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
NODE_ENV=production

# Auto-set by Railway
DATABASE_URL=postgresql://...
PORT=3000

# Optional (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# For CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel/Netlify)

```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
```

### Getting Twilio Credentials

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console dashboard
3. Purchase a phone number (or use the free trial number for testing)
4. Add the credentials to your environment variables

### Webhook Configuration

The Twilio webhook is automatically configured to:
- URL: `{BACKEND_URL}/api/webhooks/twilio/status`
- Method: POST
- This is set automatically in the code when sending SMS

If you need to configure webhooks manually in Twilio Console:
1. Go to Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Under "Messaging", set the webhook URL to: `{BACKEND_URL}/api/webhooks/twilio/status`

## Testing SMS Functionality

1. Ensure Twilio credentials are set in environment variables
2. Open the app and navigate to "Text Alert" screen
3. Compose a message and select a recipient group
4. Send the alert
5. Check the Alert History screen to see delivery status
6. Twilio will automatically update delivery status via webhook

## Phone Number Validation

Phone numbers are now validated using libphonenumber:
- Invalid numbers are caught when editing markets
- Numbers are automatically formatted to E.164 format (+15551234567)
- Validation happens on both frontend and backend

## Search Functionality

The fuzzy search uses Fuse.js:
- No configuration needed
- Works automatically in the market list search field
- Handles typos and partial matches

## Troubleshooting

### SMS Not Sending
- Check that Twilio credentials are set correctly
- Verify the Twilio phone number is active
- Check backend logs for error messages
- Ensure webhook URL is accessible (for status updates)

### Phone Validation Errors
- Ensure phone numbers include country code or are in US format
- Check that numbers are not empty or just spaces
- Validation errors will show which phone number has the issue

### Search Not Working
- Clear the search field and try again
- Check that markets are loaded (pull to refresh)
- Fuse.js search is case-insensitive and handles typos

