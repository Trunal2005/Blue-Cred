// Changes remote permissions; disabled until separately reviewed.
if (process.env.BLUECRED_ALLOW_PROVISIONING !== 'true') {
    throw new Error('Provisioning disabled. Review permissions and costs before explicitly enabling.');
}
const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'bluecred-db';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || 'projects';
const TRANSACTIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'project-images';

async function setup() {
    console.log('🚀 Starting Robust Appwrite Provisioning...');

    try {
        // 1. Database
        let db;
        try {
            db = await databases.get(DATABASE_ID);
            console.log('ℹ️ Database exists:', DATABASE_ID);
        } catch (e) {
            db = await databases.create(DATABASE_ID, 'BlueCred Database');
            console.log('✅ Database created:', DATABASE_ID);
        }

        // 2. Projects Collection
        let projectsCol;
        try {
            projectsCol = await databases.getCollection(DATABASE_ID, PROJECTS_COLLECTION_ID);
            console.log('ℹ️ Projects collection exists, updating permissions...');
            await databases.updateCollection(DATABASE_ID, PROJECTS_COLLECTION_ID, 'Projects', [
                Permission.read(Role.any()),
                Permission.write(Role.users()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]);
        } catch (e) {
            projectsCol = await databases.createCollection(DATABASE_ID, PROJECTS_COLLECTION_ID, 'Projects', [
                Permission.read(Role.any()),
                Permission.write(Role.users()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]);
            console.log('✅ Projects collection created');
        }

        const projectAttrs = [
            { key: 'projectName', type: 'string', size: 255, required: true },
            { key: 'locationName', type: 'string', size: 255, required: true },
            { key: 'ecosystemType', type: 'string', size: 100, required: true },
            { key: 'areaSize', type: 'integer', required: true },
            { key: 'estimatedCO2', type: 'integer', required: true },
            { key: 'creditsIssued', type: 'integer', required: false, default: 0 },
            { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
            { key: 'submittedByUserId', type: 'string', size: 100, required: true },
            { key: 'imageFileIds', type: 'string', size: 255, required: false, array: true },
            { key: 'ipfsHash', type: 'string', size: 255, required: false },
            { key: 'latitude', type: 'float', required: false, default: 0 },
            { key: 'longitude', type: 'float', required: false, default: 0 },
            { key: 'description', type: 'string', size: 2000, required: false },
            { key: 'beneficiaryWallet', type: 'string', size: 255, required: false },
            { key: 'createdAt', type: 'datetime', required: false },
        ];

        const existingProjectAttrs = projectsCol.attributes.map(a => a.key);
        for (const attr of projectAttrs) {
            if (existingProjectAttrs.includes(attr.key)) {
                console.log(`  ℹ️ Attribute projects.${attr.key} already exists`);
                continue;
            }
            if (attr.type === 'string') {
                await databases.createStringAttribute(DATABASE_ID, PROJECTS_COLLECTION_ID, attr.key, attr.size, attr.required, attr.default, attr.array);
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(DATABASE_ID, PROJECTS_COLLECTION_ID, attr.key, attr.required, 0, 1000000, attr.default);
            } else if (attr.type === 'float') {
                await databases.createFloatAttribute(DATABASE_ID, PROJECTS_COLLECTION_ID, attr.key, attr.required, -180, 180, attr.default);
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(DATABASE_ID, PROJECTS_COLLECTION_ID, attr.key, attr.required, attr.default);
            }
            console.log(`  ✅ Attribute created: projects.${attr.key}`);
        }

        // 3. Transactions Collection
        let txCol;
        try {
            txCol = await databases.getCollection(DATABASE_ID, TRANSACTIONS_COLLECTION_ID);
            console.log('ℹ️ Transactions collection exists, updating permissions...');
            await databases.updateCollection(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, 'Transactions', [
                Permission.read(Role.any()),
                Permission.write(Role.any()), // Allow anyone for hackathon ease
            ]);
        } catch (e) {
            txCol = await databases.createCollection(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, 'Transactions', [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
            ]);
            console.log('✅ Transactions collection created');
        }

        const txAttrs = [
            { key: 'buyerUserId', type: 'string', size: 100, required: true },
            { key: 'projectId', type: 'string', size: 100, required: true },
            { key: 'creditAmount', type: 'integer', required: true },
            { key: 'pricePaid', type: 'float', required: true },
            { key: 'transactionDate', type: 'string', size: 100, required: true },
            { key: 'tokenId', type: 'string', size: 100, required: true },
        ];

        const existingTxAttrs = txCol.attributes.map(a => a.key);
        for (const attr of txAttrs) {
            if (existingTxAttrs.includes(attr.key)) {
                console.log(`  ℹ️ Attribute transactions.${attr.key} already exists`);
                continue;
            }
            if (attr.type === 'string') {
                await databases.createStringAttribute(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, attr.key, attr.size, attr.required);
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, attr.key, attr.required);
            } else if (attr.type === 'float') {
                await databases.createFloatAttribute(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, attr.key, attr.required, 0, 10000000);
            }
            console.log(`  ✅ Attribute created: transactions.${attr.key}`);
        }

        // 4. Bucket
        try {
            await storage.getBucket(BUCKET_ID);
            console.log('ℹ️ Storage bucket exists:', BUCKET_ID);
        } catch (e) {
            await storage.createBucket(BUCKET_ID, 'Project Images', [
                Permission.read(Role.any()),
                Permission.write(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ], true);
            console.log('✅ Storage bucket created:', BUCKET_ID);
        }

        console.log('✨ Appwrite Provisioning Complete!');

    } catch (error) {
        console.error('❌ Provisioning failed:', error.message);
        if (error.response) console.error(JSON.stringify(error.response, null, 2));
    }
}

setup();
