# Keepers Auction

## Overview
Keepers Auction is an innovative platform designed to streamline the auction process for collectors and enthusiasts. This documentation outlines how to set up the environment, features of the application, API references, and deployment guidance.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/cjp442/keepersauction-com.git
   cd keepersauction-com
   ```

2. **Install Dependencies**
   Ensure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your configurations:
   ```
   DATABASE_URL=your_database_url
   API_KEY=your_api_key
   ```

4. **Run the Application**
   Start the development server:
   ```bash
   npm start
   ```

## Feature Overview

- **User Authentication:** Secure login system via OAuth.
- **Auction Listings:** Create, edit, and delete auction listings.
- **Bid Management:** Real-time updates on bidding status.
- **Payment Integration:** Process transactions securely.

## API Documentation

### Authentication
- **POST /api/auth/login**
   - Description: Logs in a user and returns authentication tokens.
   - Request Body:
     - `username`: string
     - `password`: string

### Auctions
- **GET /api/auctions**
   - Description: Retrieves all auctions.
   - Response: Array of auction objects.

- **POST /api/auctions**
   - Description: Creates a new auction.
   - Request Body:
     - `title`: string
     - `description`: string
     - `startTime`: date
     - `endTime`: date

## Deployment Guide

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Your Server**
   Upload the contents of the `build` directory to your web server.

3. **Configuration**
   Ensure the server is set up with the correct environment variables.

4. **Access the Application**
   Once deployed, navigate to your domain to access Keepers Auction.

## License
This project is licensed under the MIT License.
