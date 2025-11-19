#!/bin/bash

echo "🚀 Forumyzer Deployment Setup Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you set up automatic deployments to Railway and Vercel.${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Or use the web interface to add secrets manually:"
    echo "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/secrets/actions"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI found${NC}"
echo ""

# Authenticate with GitHub
echo "Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub:"
    gh auth login
fi

echo -e "${GREEN}✓ Authenticated with GitHub${NC}"
echo ""

# Get secrets from user
echo -e "${BLUE}Enter your deployment credentials:${NC}"
echo ""

read -p "Railway Token (from https://railway.app/account/tokens): " RAILWAY_TOKEN
read -p "Railway Project ID (from Railway project settings): " RAILWAY_PROJECT_ID
read -p "Vercel Token (from https://vercel.com/account/tokens): " VERCEL_TOKEN
read -p "Vercel Org ID (from .vercel/project.json): " VERCEL_ORG_ID
read -p "Vercel Project ID (from .vercel/project.json): " VERCEL_PROJECT_ID

echo ""
echo "Setting GitHub secrets..."

# Set secrets
gh secret set RAILWAY_TOKEN --body "$RAILWAY_TOKEN"
gh secret set RAILWAY_PROJECT_ID --body "$RAILWAY_PROJECT_ID"
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

echo ""
echo -e "${GREEN}✓ All secrets configured!${NC}"
echo ""

# Verify secrets were set
echo "Verifying secrets..."
echo ""
gh secret list

echo ""
echo -e "${GREEN}🎉 Deployment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Commit and push the deployment config files"
echo "2. Push to 'main' branch for production deployment"
echo "3. Push to 'claude/*' branches for preview deployments"
echo ""
echo "Example:"
echo "  git add ."
echo "  git commit -m 'Add deployment configuration'"
echo "  git push origin claude/youtube-message-board-01NF6xKeqJ5uHsuLuA16whgp"
echo ""
echo "Preview URLs will be available at:"
echo "  Frontend: https://forumyzer-claude-youtube-message-board-01NF6xKeqJ5uHsuLuA16whgp.vercel.app"
echo "  Backend: https://forumyzer-backend-claude-youtube-message-board-01NF6xKeqJ5uHsuLuA16whgp.railway.app"
echo ""
