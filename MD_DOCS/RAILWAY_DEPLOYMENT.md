# Railway Deployment Guide

This guide covers deploying the Inside Edition Call List backend to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. GitHub repository connected to Railway
3. Twilio account for SMS functionality (optional)

## Step 1: Create Railway Project

1. Log in to Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` directory as the root

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create and configure the database
4. The `DATABASE_URL` environment variable is set automatically

## Step 3: Configure Environment Variables

Add these environment variables in Railway:

### Required
```
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NODE_ENV=production
```

### Automatically Set by Railway
```
DATABASE_URL=<set-automatically-by-postgresql-plugin>
PORT=<set-automatically>
```

### Optional (for SMS)
```
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
```

### For Frontend CORS
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Step 4: Deploy

Railway deploys automatically when you push to your connected branch.

### Manual Deploy
1. Go to your Railway project
2. Click on the backend service
3. Click "Deploy" → "Trigger Deploy"

### Deployment Process
1. Railway detects Bun/Node project
2. Runs `bun install`
3. Runs `bunx prisma generate`
4. Runs `bun run build`
5. Starts server with `bunx prisma migrate deploy && bun run start`

## Step 5: Verify Deployment

1. Get your Railway URL from the "Deployments" tab
2. Test the health endpoint: `https://your-app.up.railway.app/health`
3. Should return: `{"status":"ok"}`

## Database Management

### Run Migrations
Migrations run automatically on deploy. To run manually:
```bash
railway run bunx prisma migrate deploy
```

### Seed Database
```bash
railway run bun run seed
```

### View Database (Prisma Studio)
```bash
railway run bunx prisma studio
```

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL service is running
- Check if migrations have been applied

### "CORS error"
- Add your frontend domain to `FRONTEND_URL` env var
- Or update `backend/src/index.ts` with allowed origins

### "Twilio not configured"
- This is expected if you haven't added Twilio credentials
- SMS sending will fail gracefully with helpful error message

## Cost Estimate

Railway Pricing:
- **Hobby Plan**: $5/month includes:
  - 512 MB RAM
  - Shared CPU
  - $5 usage credit

- **PostgreSQL**: Included in hobby tier
  - 1 GB storage
  - Automatic backups

For a low-traffic app like this, expect ~$5-10/month total.

## Custom Domain

1. In Railway, go to Settings → Domains
2. Click "Generate Domain" for a free `.up.railway.app` domain
3. Or click "Custom Domain" to add your own

Remember to update `BACKEND_URL` environment variable if using custom domain.

## Production Checklist

- [ ] PostgreSQL database created
- [ ] `BETTER_AUTH_SECRET` is set (32+ characters)
- [ ] `NODE_ENV=production` is set
- [ ] Migrations applied successfully
- [ ] Health check returns 200
- [ ] CORS configured for frontend domain
- [ ] (Optional) Twilio credentials added
- [ ] (Optional) Custom domain configured

