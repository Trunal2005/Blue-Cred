# Frontend Setup Guide

This document details how to install dependencies, configure environment variables, and run the **BlueCred** Next.js web application.

---

## 1. Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi v2, Viem v2, RainbowKit v2, Ethers v6
- **Database / Backend**: Appwrite Cloud (`appwrite` and `node-appwrite` SDKs)
- **Data Visualization**: Chart.js, React-ChartJS-2, React-Leaflet
- **Exporting**: html2canvas, jsPDF for downloadable credit certificates

---

## 2. Prerequisites

- **Node.js**: v18.x or v20.x
- **npm**: v9+ or modern package manager
- **MetaMask / Web3 Wallet**: Configured for Sepolia or Polygon Amoy testnet
- **Appwrite Project**: Set up on [Appwrite Cloud](https://cloud.appwrite.io)

---

## 3. Installation

Navigate to the `frontend` directory from the repository root:

```bash
cd frontend
npm install
```

---

## 4. Environment Variables

Create `.env.local` inside the `frontend` folder (you can copy `.env.example`):

```bash
cp .env.example .env.local
```

Populate the required keys:

```env
# Appwrite Settings
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_API_KEY=your_appwrite_api_key_for_scripts
NEXT_PUBLIC_APPWRITE_DATABASE_ID=bluecred-db
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=projects
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions
NEXT_PUBLIC_APPWRITE_BUCKET_ID=project-images

# Web3 Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

---

## 5. Development Server

Start the local Next.js dev server:

```bash
npm run dev
```

The Next.js development interface runs on your designated dev port.

---

## 6. Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the production bundle |
| `npm run start` | Serves the production build |
| `npm run lint` | Runs ESLint analysis |
| `node src/scripts/init-appwrite.js` | Provisions Appwrite collections, attributes, and storage |
| `node src/scripts/check-appwrite.js` | Verifies Appwrite connection and schema |

---

## 7. Appwrite Setup & Provisioning

Before submitting projects or purchasing credits, provision your Appwrite collections:

```bash
node src/scripts/init-appwrite.js
```

This ensures the `projects` and `transactions` collections and the `project-images` storage bucket exist with all required schema attributes.

