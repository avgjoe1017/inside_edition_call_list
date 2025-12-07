# Push to GitHub Script
# Usage: .\push-to-github.ps1 -Token "your_token_here"
# OR run and enter credentials when prompted

param(
    [string]$Token
)

$repoPath = "c:\Users\joeba\Documents\inside_edition_call_list"
Set-Location $repoPath

if ($Token) {
    # Update remote URL with token
    $remoteUrl = "https://$Token@github.com/avgjoe1017/inside_edition_call_list.git"
    git remote set-url origin $remoteUrl
    Write-Host "Remote URL updated with token. Pushing to GitHub..." -ForegroundColor Green
    git push -u origin main
    # Remove token from URL for security
    git remote set-url origin https://github.com/avgjoe1017/inside_edition_call_list.git
    Write-Host "Token removed from remote URL for security." -ForegroundColor Yellow
} else {
    Write-Host "Pushing to GitHub. You will be prompted for credentials:" -ForegroundColor Yellow
    Write-Host "Username: avgjoe1017" -ForegroundColor Cyan
    Write-Host "Password: [Enter your Personal Access Token]" -ForegroundColor Cyan
    Write-Host ""
    git push -u origin main
}
