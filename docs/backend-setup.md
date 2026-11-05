# Backend Setup Guide

This document provides instructions for setting up the backend services for BlueCred, including the blockchain layer and the Appwrite database/authentication layer.

## Architecture Overview

BlueCred uses a hybrid backend architecture:
1.  **Blockchain Layer**: Smart contracts deployed on Polygon Amoy (or Sepolia) for decentralized carbon credit issuance and tracking.
2.  **Appwrite Layer**: Provides database storage for project metadata, user authentication, and file storage for project images.

---

## Prerequisites

- **Node.js**: v18.x or higher
- **MetaMask**: Browser extension for managing blockchain accounts.
- **Appwrite**: An active Appwrite project (Cloud or Self-hosted).

---

## Environment Configuration

Create a `.env` file in the root directory and a `frontend/.env.local` file with the following variables:

### Root `.env` (Blockchain)
```env
PRIVATE_KEY=your_private_wallet_key
SEPOLIA_RPC_URL=your_rpc_endpoint_url
```

### `frontend/.env.local` (Appwrite & Frontend)
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_API_KEY=your_admin_api_key
NEXT_PUBLIC_APPWRITE_DATABASE_ID=bluecred-db
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=projects
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions
NEXT_PUBLIC_APPWRITE_BUCKET_ID=project-images
```

---

## 1. Blockchain Setup (Hardhat)

The blockchain layer is managed using Hardhat.

### Install Dependencies
From the root directory:
```bash
npm install
```

### Compile Smart Contracts
```bash
npx hardhat compile
```

### Deploy Smart Contracts
Ensure your `.env` is configured with a `PRIVATE_KEY` and `SEPOLIA_RPC_URL`.
```bash
npx hardhat run scripts/deploy.js
```
The script will output the deployed contract address. Update any contract address references in the frontend if necessary.

---

## 2. Appwrite Setup (Database & Auth)

We use an automated script to provision the necessary database collections, attributes, and storage buckets.

### Run Provisioning Script
From the `frontend` directory:
```bash
node src/scripts/init-appwrite.js
```

### What this script does:
- Creates the **BlueCred Database** (`bluecred-db`).
- Creates the **Projects Collection** with schema (Project Name, Location, Ecosystem Type, CO2, etc.).
- Creates the **Transactions Collection** for tracking purchases.
- Configures **Permissions** to allow public reading and authenticated writing.
- Creates the **Project Images Bucket** for file uploads.

---

## 3. Running the Backend Locally

While the blockchain resides on a testnet, you can simulate local interactions if needed. However, the standard development flow is:
1.  Deploy contracts to a testnet.
2.  Run Appwrite (Cloud or Local Docker).
3.  Configure the frontend to point to these endpoints.

## Troubleshooting

- **Provider Error**: Ensure your RPC URL is valid and the network matches (Sepolia/Amoy).
- **Appwrite Permission Denied**: Check that your `NEXT_PUBLIC_APPWRITE_API_KEY` has sufficient scopes (Database, Collections, Attributes, Buckets).
- **Contract Not Found**: Run `npx hardhat compile` to regenerate the artifacts.
