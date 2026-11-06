# Local Setup Guide

> Current zero-cost workflow: see [validated local integration guide](ml/INTEGRATION_GUIDE.md) and [final validation](BLUECRED_FINAL_VALIDATION.md). No wallet private key, cloud provisioning or contract deployment is needed for local CNN inference. External setup/deployment sections below are legacy reference, not steps authorized by the ₹0 local workflow. Do not run provisioning: its broad permissions are gated pending separate review. `APPWRITE_API_KEY` is script-only and must never have a `NEXT_PUBLIC_` prefix.

This guide provides a step-by-step process to set up the entire BlueCred project locally from scratch.

## 1. Prerequisites

Ensure you have the following installed:
- **Git**: For version control.
- **Node.js**: v18.x or higher.
- **npm**: (Comes with Node.js).
- **MetaMask**: Browser extension for blockchain interactions.

---

## 2. Repository Setup

Clone the repository and install the root dependencies.

```bash
git clone https://github.com/Trunal2005/Blue-Cred.git
cd Blue-Cred
npm install
```

---

## 3. Environment Configuration

You need to set up two environment files.

### Root Directory (`.env`)
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_wallet_key
SEPOLIA_RPC_URL=your_rpc_endpoint_url
```

### Frontend Directory (`frontend/.env.local`)
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_admin_api_key
NEXT_PUBLIC_APPWRITE_DATABASE_ID=bluecred-db
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=projects
NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID=transactions
NEXT_PUBLIC_APPWRITE_BUCKET_ID=project-images
```

---

## 4. Backend & Blockchain Initialization

### Smart Contracts (Hardhat)
Compile and deploy the smart contracts to the testnet.
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js
```
*Note: Save the deployed contract address for frontend configuration if required.*

### Appwrite Provisioning
Configure your Appwrite backend automatically.
```bash
cd frontend
npm install
node src/scripts/init-appwrite.js
```

---

## 5. Running the Application

Start the Next.js development server.
```bash
cd frontend
npm run dev
```
The Next.js client starts on your designated local dev port.

---

## 6. Verification

To verify your setup:
1.  **Frontend**: The landing page loads in your browser.
2.  **Auth**: Try signing up or logging in (requires Appwrite setup).
3.  **Blockchain**: Ensure MetaMask is connected to the correct network (Sepolia/Amoy).
4.  **Database**: Check your Appwrite console to see if the `bluecred-db` collections were created.

---

## Related Documentation
- [Backend Setup Guide](./backend-setup.md)
- [Frontend Setup Guide](./frontend-setup.md)
