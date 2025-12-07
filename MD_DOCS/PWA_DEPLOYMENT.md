# PWA Frontend Deployment Guide

This guide covers deploying the Inside Edition Call List PWA to Vercel or Netlify.

## Build the PWA

```bash
# Build for web
npx expo export --platform web

# Output is in ./dist directory
```

## Option 1: Deploy to Vercel

### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Via GitHub Integration
1. Connect your GitHub repo to Vercel
2. Set the following in Vercel project settings:
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

### Environment Variables (Vercel)
Add in Vercel Dashboard → Settings → Environment Variables:
```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
```

## Option 2: Deploy to Netlify

### Via Netlify CLI
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# For production
netlify deploy --prod
```

### Via GitHub Integration
1. Connect your GitHub repo to Netlify
2. Build settings are auto-detected from `netlify.toml`
3. Builds run automatically on push

### Environment Variables (Netlify)
Add in Netlify Dashboard → Site settings → Environment variables:
```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
```

## PWA Features

The app includes full PWA support:

### Installable
- Chrome: Click install icon in address bar
- Safari (iOS): Share → Add to Home Screen
- Safari (macOS): File → Add to Dock

### Offline Support
- Static assets cached by service worker
- API calls require network (real-time data)

### App-like Experience
- Standalone display mode (no browser chrome)
- Custom splash screen
- App icon on home screen

## Web Limitations

Some features work differently on web:

| Feature | Native | Web |
|---------|--------|-----|
| Phone calls | Opens phone app | Opens tel: link |
| Haptic feedback | ✅ Works | ❌ No-op (silent) |
| Voice recording | ✅ Works | ❌ Shows redirect message |
| Text alerts | ✅ Works | ✅ Works |
| Push notifications | ✅ Works | ⚠️ Requires extra setup |

## Testing PWA Locally

```bash
# Build for web
npx expo export --platform web

# Serve locally
npx serve dist

# Open http://localhost:3000
```

### Test PWA Features
1. Open Chrome DevTools → Application tab
2. Check "Manifest" section for PWA metadata
3. Check "Service Workers" for caching
4. Use "Lighthouse" to audit PWA compliance

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed

## Production Checklist

- [ ] `EXPO_PUBLIC_BACKEND_URL` points to Railway backend
- [ ] Build succeeds without errors
- [ ] All routes work (test navigation)
- [ ] PWA installable (check manifest)
- [ ] CORS configured on backend for frontend domain
- [ ] Test on mobile browser (responsive design)
- [ ] Voice Alert shows web message correctly

## Troubleshooting

### "Failed to fetch" errors
- Check `EXPO_PUBLIC_BACKEND_URL` is correct
- Verify CORS is configured on backend
- Check network tab for actual error

### PWA not installable
- Ensure manifest.json is served correctly
- Check for HTTPS (required for PWA)
- Verify icons are accessible

### Styles broken on web
- NativeWind should work, but check for web-specific issues
- Some React Native components need web alternatives

