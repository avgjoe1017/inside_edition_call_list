# Starting Your Inside Edition App as a PWA

## Quick Start

Open PowerShell in your project directory and run:

```powershell
bunx expo start --web
```

This will:
1. Start Metro bundler for web
2. Open your default browser to `http://localhost:8081`
3. The app will load as a PWA with full functionality

## What You'll See

When the server starts, you'll see output like:

```
Starting Metro Bundler
› Web is waiting on http://localhost:8081
› Press w │ open web
```

The browser should automatically open. If not, manually navigate to `http://localhost:8081`

## Installing as a PWA

Once the app loads in your browser:

### Chrome/Edge:
1. Look for the install icon (⊕) in the address bar
2. Click "Install" to add to your apps
3. The app will open in its own window, just like a native app

### Mobile Safari (iPhone/iPad):
1. Tap the Share button
2. Scroll down and tap "Add to Home Screen"
3. The app will appear on your home screen with the Inside Edition icon

### Android Chrome:
1. Tap the menu (⋮)
2. Tap "Install app" or "Add to Home Screen"
3. The app will appear in your app drawer

## PWA Features

Your installed PWA includes:

✅ **Offline-capable** (once loaded)
✅ **App shortcuts** (Text Alert, Call Logs)
✅ **Standalone window** (no browser UI)
✅ **Home screen icon**
✅ **Push notifications** (when implemented)
✅ **Theme colors** (matches Inside Edition branding)

## What Works in the PWA

- ✅ Market list, search, and filters
- ✅ Market detail and editing
- ✅ Text alerts (SMS via Twilio)
- ✅ Alert history
- ✅ Call logs
- ✅ Edit history
- ✅ CSV import
- ✅ Settings and theme switching
- ❌ Voice alerts (native-only, redirects to text alerts)

## Backend Connection

The PWA connects to your backend at `http://192.168.86.37:3000` (configured in `src/lib/config.ts`).

Make sure your backend is running:

```powershell
# In a separate terminal, in the backend directory:
cd backend
bun run dev
```

## Production Deployment

To deploy your PWA to production:

### Option 1: Vercel (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
bunx expo export:web
vercel --prod
```

### Option 2: Netlify
```powershell
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
bunx expo export:web
netlify deploy --prod --dir=dist
```

Your `vercel.json` and `netlify.toml` are already configured for proper routing and caching.

## Troubleshooting

### Port 8081 already in use
```powershell
# Use a different port
bunx expo start --web --port 8082
```

### Browser doesn't open automatically
Manually navigate to `http://localhost:8081`

### Backend connection fails
1. Check backend is running on port 3000
2. Check firewall isn't blocking the connection
3. Update `EXPO_PUBLIC_BACKEND_URL` in your `.env` file if needed

## Development Workflow

1. **Start backend**: `cd backend && bun run dev`
2. **Start frontend PWA**: `bunx expo start --web`
3. **Make changes**: Hot reload works automatically
4. **Test on phone**: Use your computer's LAN IP (e.g., `http://192.168.86.37:8081`)

## No iOS Build Needed!

The PWA approach means:
- ✅ No Xcode required
- ✅ No macOS required  
- ✅ No CocoaPods required
- ✅ Works on Windows for development
- ✅ Installs on iOS devices like a native app
- ✅ Full React Native Reanimated support
- ✅ Instant updates without app store approval

## Next Steps

1. Run `bunx expo start --web` to launch
2. Test all features in the browser
3. Install as PWA on your devices
4. Deploy to production when ready

Your app is fully functional as a PWA with no native build required!
