# Quick Push Instructions

## Option 1: Run with Token (Recommended)

Open PowerShell and run:

```powershell
cd "c:\Users\joeba\Documents\inside_edition_call_list"
$token = "YOUR_TOKEN_HERE"
git remote set-url origin "https://$token@github.com/avgjoe1017/inside_edition_call_list.git"
git push -u origin main
git remote set-url origin https://github.com/avgjoe1017/inside_edition_call_list.git
```

Replace `YOUR_TOKEN_HERE` with your Personal Access Token.

## Option 2: Use the Script

```powershell
cd "c:\Users\joeba\Documents\inside_edition_call_list"
.\push-to-github.ps1 -Token "YOUR_TOKEN_HERE"
```

## Option 3: Interactive Push

```powershell
cd "c:\Users\joeba\Documents\inside_edition_call_list"
git push -u origin main
```

Then when prompted:
- Username: `avgjoe1017`
- Password: [paste your token]
