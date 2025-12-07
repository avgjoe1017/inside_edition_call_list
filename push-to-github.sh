#!/bin/bash
# Push to GitHub Script
# Usage: ./push-to-github.sh [token]
# OR run and enter credentials when prompted

TOKEN=$1
# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="$SCRIPT_DIR"

cd "$REPO_PATH" || exit 1

if [ -n "$TOKEN" ]; then
    # Update remote URL with token
    REMOTE_URL="https://${TOKEN}@github.com/avgjoe1017/inside_edition_call_list.git"
    git remote set-url origin "$REMOTE_URL" || {
        echo -e "\033[0;31mError: Failed to update remote URL\033[0m" >&2
        exit 1
    }
    echo -e "\033[0;32mRemote URL updated with token. Pushing to GitHub...\033[0m"
    git push -u origin main || {
        echo -e "\033[0;31mError: Failed to push to GitHub\033[0m" >&2
        # Still remove token for security even on failure
        git remote set-url origin https://github.com/avgjoe1017/inside_edition_call_list.git
        exit 1
    }
    # Remove token from URL for security
    git remote set-url origin https://github.com/avgjoe1017/inside_edition_call_list.git
    echo -e "\033[0;33mToken removed from remote URL for security.\033[0m"
else
    echo -e "\033[0;33mPushing to GitHub. You will be prompted for credentials:\033[0m"
    echo -e "\033[0;36mUsername: avgjoe1017\033[0m"
    echo -e "\033[0;36mPassword: [Enter your Personal Access Token]\033[0m"
    echo ""
    git push -u origin main || {
        echo -e "\033[0;31mError: Failed to push to GitHub\033[0m" >&2
        exit 1
    }
fi
