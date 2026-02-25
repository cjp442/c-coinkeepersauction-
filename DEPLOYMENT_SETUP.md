# Deployment Setup Instructions

## 1. Deployment on Vercel

### Step 1: Create an account on Vercel
- Go to [Vercel](https://vercel.com/) and sign up for an account using your GitHub credentials.

### Step 2: Import your project from GitHub
- After logging in, click on the "New Project" button.
- Select your GitHub repository (`cjp442/keepersauction-com`) to import the project.

### Step 3: Configure environment variables (if required)
- During the import process, you may need to set up any required environment variables. This can be done in the settings of your project on Vercel.

### Step 4: Deploy the project
- Once everything is configured, click on the "Deploy" button. 
- Vercel will build and deploy your application.

### Step 5: Verify the deployment
- After the deployment finishes, you will have a public URL where your application is accessible. Make sure to test it to confirm everything works as expected.

## 2. Configuring GoDaddy DNS

### Step 1: Log in to your GoDaddy account
- Visit [GoDaddy](https://www.godaddy.com/) and log in to your account.

### Step 2: Go to your domain management page
- Navigate to the "My Products" section, then to the "Domains" tab.
- Select the domain you wish to configure.

### Step 3: Navigate to DNS settings
- In your domain settings, click on the DNS button to access DNS management.

### Step 4: Update A record or CNAME record as necessary
- If you are using a custom domain with Vercel, you will typically need to update the CNAME record to point to your Vercel URL. 
- Set the following:
  - **Type**: CNAME  
  - **Name**: www (or your desired subdomain)  
  - **Value**: `<your-vercel-username>.vercel.app`

### Step 5: Save the settings and verify the configuration
- Once changes are made, save your DNS settings. 
- It may take some time for changes to propagate, so be patient and verify by visiting your domain after a few minutes.
