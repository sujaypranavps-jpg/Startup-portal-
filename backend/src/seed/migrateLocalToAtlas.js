import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/startup_portal';
const atlasUri = process.env.MONGO_ATLAS_URI || process.env.MONGO_URI;
const dropTarget = process.env.DROP_TARGET === 'true';

if (!atlasUri) {
  console.error('Missing MONGO_ATLAS_URI or MONGO_URI');
  process.exit(1);
}

const copyCollection = async (localDb, atlasDb, name) => {
  const docs = await localDb.collection(name).find({}).toArray();
  if (dropTarget) {
    await atlasDb.collection(name).deleteMany({});
  }
  if (docs.length === 0) {
    return { name, copied: 0 };
  }
  try {
    await atlasDb.collection(name).insertMany(docs, { ordered: false });
    return { name, copied: docs.length };
  } catch (err) {
    if (err?.writeErrors?.length) {
      return { name, copied: docs.length - err.writeErrors.length, skipped: err.writeErrors.length };
    }
    throw err;
  }
};

const run = async () => {
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();

  try {
    const collections = await localConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in local DB.`);

    for (const col of collections) {
      const result = await copyCollection(localConn.db, atlasConn.db, col.name);
      const skipped = result.skipped ? `, skipped ${result.skipped}` : '';
      console.log(`Copied ${result.copied} docs from ${result.name}${skipped}.`);
    }

    console.log('Migration complete.');
  } finally {
    await localConn.close();
    await atlasConn.close();
  }
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
