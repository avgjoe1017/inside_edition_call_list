# Quick Setup Guide for Backend Database

## Problem
You're seeing: `error: Error validating datasource 'db': the URL must start with the protocol 'postgresql://' or 'postgres://'`

## Solution: Set up your `.env` file

### Option 1: SQLite (Easiest for Development)

1. **Change Prisma schema to use SQLite:**

```powershell
# Edit backend/prisma/schema.prisma
# Change line 7 from:
provider = "postgresql"
# To:
provider = "sqlite"
```

2. **Create `.env` file:**

```powershell
cd backend
# Create .env file with:
DATABASE_URL="file:./dev.db"
```

3. **Run migrations:**

```powershell
bunx prisma migrate dev --name init
```

4. **Import your data:**

```powershell
bun run import-csv "../data/ie data as of 12-6.csv"
```

5. **Open Prisma Studio:**

```powershell
bun run studio
```

### Option 2: PostgreSQL (For Production)

If you want to use PostgreSQL (like on Railway):

1. **Create `.env` file in backend directory:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inside_edition?schema=public"
```

2. **Run migrations:**

```powershell
cd backend
bunx prisma migrate deploy
```

3. **Import data:**

```powershell
bun run import-csv "../data/ie data as of 12-6.csv"
```

## Recommended: Use SQLite for Now

For local development on Windows, SQLite is much easier:

### Quick Setup Commands:

```powershell
# 1. Navigate to backend
cd C:\Users\joeba\Documents\inside_edition_call_list\backend

# 2. Create .env file (if it doesn't exist)
echo DATABASE_URL="file:./dev.db" > .env

# 3. Update schema to SQLite (if needed)
# Edit prisma/schema.prisma line 7: provider = "sqlite"

# 4. Run migrations
bunx prisma migrate dev --name init

# 5. Import CSV data
bun run import-csv "../data/ie data as of 12-6.csv"

# 6. Start Prisma Studio
bun run studio
```

Then open http://localhost:3001 to see your database!

## Why This Happened

Your `schema.prisma` is set to `provider = "postgresql"` but you don't have a PostgreSQL connection string in your `.env` file. You need to either:
- Switch to SQLite (easier for development)
- Set up PostgreSQL and configure the connection string

## Next Steps

After setting up the database:

1. **Start backend server:**
```powershell
cd backend
bun run dev
```

2. **Start frontend (in another terminal):**
```powershell
bunx expo start --web
```

Now your app will have data to display!
