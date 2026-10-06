import fs from 'fs';
import path from 'path';
import { getDatabase } from './mongodb';
import { DELIVERED_ORDERS_MOCK, DeliveredOrder } from './deliveredOrdersData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'delivered_orders.json');

declare global {
  // eslint-disable-next-line no-var
  var __cs_delivered_orders_cache: DeliveredOrder[] | undefined;
}

function stripMongoId<T extends { _id?: any }>(item: T): Omit<T, '_id'> {
  const { _id, ...rest } = item;
  return rest as any;
}

function readLocalDeliveredOrders(): DeliveredOrder[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Erreur lecture locale delivered_orders.json:', err);
  }
  return DELIVERED_ORDERS_MOCK;
}

function writeLocalDeliveredOrders(orders: DeliveredOrder[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch {
    // Environnement read-only (ex: Vercel serverless)
  }
}

export async function getAllDeliveredOrders(): Promise<DeliveredOrder[]> {
  try {
    const db = await getDatabase();
    if (db) {
      const docs = await db.collection('delivered_orders').find({}).toArray();
      if (docs.length > 0) {
        const orders = docs.map(stripMongoId) as DeliveredOrder[];
        global.__cs_delivered_orders_cache = orders;
        return orders;
      } else {
        // Initialiser avec les exemples par défaut
        try {
          await db.collection('delivered_orders').insertMany(DELIVERED_ORDERS_MOCK.map(o => ({ ...o })));
        } catch {
          // ignore duplicate key or index error
        }
        global.__cs_delivered_orders_cache = DELIVERED_ORDERS_MOCK;
        return DELIVERED_ORDERS_MOCK;
      }
    }
  } catch (err) {
    console.warn('Erreur getAllDeliveredOrders MongoDB Atlas (fallback local actif):', err);
  }

  if (global.__cs_delivered_orders_cache && global.__cs_delivered_orders_cache.length > 0) {
    return global.__cs_delivered_orders_cache;
  }

  const local = readLocalDeliveredOrders();
  global.__cs_delivered_orders_cache = local;
  return local;
}

export async function saveAllDeliveredOrders(orders: DeliveredOrder[]): Promise<void> {
  global.__cs_delivered_orders_cache = orders;
  writeLocalDeliveredOrders(orders);

  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('delivered_orders').deleteMany({});
      if (orders.length > 0) {
        await db.collection('delivered_orders').insertMany(orders.map(o => ({ ...o })));
      }
    }
  } catch (err) {
    console.error('Erreur saveAllDeliveredOrders MongoDB Atlas:', err);
  }
}

export async function createDeliveredOrder(payload: Omit<DeliveredOrder, 'id'>): Promise<DeliveredOrder> {
  const all = await getAllDeliveredOrders();
  const newOrder: DeliveredOrder = {
    ...payload,
    id: `deliv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  };

  const updated = [newOrder, ...all];
  await saveAllDeliveredOrders(updated);
  return newOrder;
}

export async function updateDeliveredOrder(id: string, updates: Partial<DeliveredOrder>): Promise<DeliveredOrder | null> {
  const all = await getAllDeliveredOrders();
  const index = all.findIndex(o => o.id === id);
  if (index === -1) return null;

  const merged: DeliveredOrder = {
    ...all[index],
    ...updates,
    id: all[index].id
  };

  all[index] = merged;
  await saveAllDeliveredOrders(all);
  return merged;
}

export async function deleteDeliveredOrder(id: string): Promise<boolean> {
  const all = await getAllDeliveredOrders();
  const filtered = all.filter(o => o.id !== id);
  if (filtered.length === all.length) return false;

  await saveAllDeliveredOrders(filtered);
  return true;
}

export async function resetToDefaultDeliveredOrders(): Promise<DeliveredOrder[]> {
  await saveAllDeliveredOrders(DELIVERED_ORDERS_MOCK);
  return DELIVERED_ORDERS_MOCK;
}
