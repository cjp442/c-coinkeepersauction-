# 🚀 Deployment Secrets Setup Guide

## GitHub Secrets Required

Add these secrets to GitHub → Settings → Secrets and variables → Actions:

### 1. VERCEL_TOKEN
- Go to https://vercel.com/account/tokens
- Create a new token (copy the full token)
- Add to GitHub Secrets as `VERCEL_TOKEN`

### 2. VERCEL_ORG_ID
- In Vercel dashboard, go to Settings
- Copy your Organization ID or Team ID
- Add to GitHub Secrets as `VERCEL_ORG_ID`

### 3. VERCEL_PROJECT_ID
- In Vercel dashboard, select keepersauction.com project
- Go to Settings → General
- Copy Project ID
- Add to GitHub Secrets as `VERCEL_PROJECT_ID`

## Vercel Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_key
VITE_DOMAIN = keepersauction.com
VITE_HOST_PHONE = 606-412-3121
```

## GoDaddy DNS Configuration

1. Sign in to GoDaddy.com
2. Go to My Products → keepersauction.com
3. Click "Manage DNS"
4. Update Nameservers to Vercel's:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com
5. Wait 24-48 hours for DNS propagation

## Verification

Check deployment status:
- GitHub Actions: https://github.com/cjp442/keepersauction.com/actions
- Vercel Dashboard: https://vercel.com/dashboard
- Live Site: https://keepersauction.com