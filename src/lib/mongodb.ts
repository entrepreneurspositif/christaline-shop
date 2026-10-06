import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'christaline_db';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDatabase(): Promise<Db | null> {
  const currentUri = process.env.MONGODB_URI || uri;
  if (!currentUri) {
    return null;
  }

  try {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(currentUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      global._mongoClientPromise = client.connect();
    }
    const client = await global._mongoClientPromise;
    return client.db(process.env.MONGODB_DB || dbName);
  } catch (err) {
    console.error('Erreur de connexion MongoDB Atlas:', err);
    // Réinitialiser la promesse pour permettre une reconnexion à la prochaine requête
    global._mongoClientPromise = undefined;
    return null;
  }
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI || uri);
}
