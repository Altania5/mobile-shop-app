# MongoDB Atlas Setup Guide

Since local MongoDB installation is encountering issues, let's use MongoDB Atlas (free cloud database).

## Steps to Set Up MongoDB Atlas:

### 1. Create a MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### 2. Create a Free Cluster
1. Choose "Build a database"
2. Select "M0 Sandbox" (FREE tier)
3. Choose a cloud provider and region (any will work)
4. Name your cluster (e.g., "mobile-shop-cluster")
5. Click "Create Cluster"

### 3. Create Database User
1. In the Atlas dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `mobile-shop-user`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Set Up Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version 4.0 or later
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your .env File
Replace the ATLAS_URI in your `.env` file with:
```
ATLAS_URI=mongodb+srv://mobile-shop-user:<password>@cluster0.xxxxx.mongodb.net/mobile-shop-app?retryWrites=true&w=majority
```

**Important**: Replace `<password>` with the actual password you created, and replace the cluster URL with your actual cluster URL.

## Alternative: Quick Test Database
If you want to test immediately, I can provide a temporary test database connection string, but you should set up your own Atlas cluster for actual development.

## After Setup:
1. Update the ATLAS_URI in your `.env` file
2. Restart your server
3. Try the login functionality again

The MongoDB connection error should be resolved once you have a valid Atlas connection string.
