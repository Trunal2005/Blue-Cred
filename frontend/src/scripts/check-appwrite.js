const { Client, Databases, Storage } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'bluecred-db';
const TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions';

async function check() {
    try {
        // Check Projects Attributes
        console.log('--- PROJECTS ---');
        const col = await databases.getCollection(DATABASE_ID, 'projects');
        col.attributes.forEach(attr => console.log(`- ${attr.key} (${attr.status})`));

        // Check Transactions Attributes
        console.log('\n--- TRANSACTIONS ---');
        const txCol = await databases.getCollection(DATABASE_ID, TRANSACTIONS_COLLECTION_ID);
        txCol.attributes.forEach(attr => console.log(`- ${attr.key} (${attr.status})`));

        // Check Buckets
        const buckets = await storage.listBuckets();
        console.log('\n--- BUCKETS ---');
        buckets.buckets.forEach(b => console.log(`- ${b.$id}: ${b.name}`));

    } catch (e) {
        console.error('FAILED:', e.message);
    }
}

check();
