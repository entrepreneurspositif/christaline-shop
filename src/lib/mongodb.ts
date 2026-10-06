import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'christaline_db';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let _lastMongoError = 0;
let _lastMongoErrorMessage = '';
const MONGO_COOLDOWN_MS = 30000; // 30 secondes de répit avant de retenter si indisponible

export async function getDatabase(): Promise<Db | null> {
  const currentUri = process.env.MONGODB_URI || uri;
  if (!currentUri) {
    return null;
  }

  // Circuit breaker : si la connexion a échoué récemment, ne pas bloquer les requêtes
  if (Date.now() - _lastMongoError < MONGO_COOLDOWN_MS && !global._mongoClientPromise) {
    return null;
  }

  try {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(currentUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2500,
      });
      global._mongoClientPromise = client.connect();
    }
    const client = await global._mongoClientPromise;
    _lastMongoError = 0;
    _lastMongoErrorMessage = '';
    return client.db(process.env.MONGODB_DB || dbName);
  } catch (err: any) {
    _lastMongoError = Date.now();
    _lastMongoErrorMessage = err?.message || 'Erreur inconnue';
    console.warn('MongoDB Atlas indisponible (mode local/fallback actif) :', _lastMongoErrorMessage);
    global._mongoClientPromise = undefined;
    return null;
  }
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI || uri);
}

export function getMongoConnectionStatus(): { configured: boolean; connected: boolean; error: string | null } {
  return {
    configured: Boolean(process.env.MONGODB_URI || uri),
    connected: _lastMongoError === 0 && Boolean(global._mongoClientPromise),
    error: _lastMongoErrorMessage || null
  };
}

