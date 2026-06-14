import { db } from '../firebase-config.js';

/**
 * Helper to wrap promises with a timeout to prevent infinite hangs.
 */
async function withTimeout(promise, timeoutMs = 6000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Tempo limite do Firebase excedido. Verifique se o Firestore Database foi criado no Console do Firebase e se as regras estão como públicas/modo teste.'));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

/**
 * Get all documents from a collection.
 * Returns array of { id, ...data }, ordered by createdAt desc when available.
 */
export async function getAll(collectionName) {
  try {
    const snapshot = await db.collection(collectionName)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // If ordering fails (no index or no createdAt field), fallback without order
    console.warn(`OrderBy failed for ${collectionName}, fetching without order:`, error.message);
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

/**
 * Get a single document by ID.
 */
export async function getById(collectionName, id) {
  const doc = await db.collection(collectionName).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Create a new document with a server timestamp.
 * Returns the new document ID.
 */
export async function create(collectionName, data) {
  const promise = db.collection(collectionName).add({
    ...data,
    createdAt: new Date().toISOString()
  });
  const docRef = await withTimeout(promise, 6000);
  return docRef.id;
}

/**
 * Update fields on an existing document.
 */
export async function update(collectionName, id, data) {
  const promise = db.collection(collectionName).doc(id).update(data);
  await withTimeout(promise, 6000);
}

/**
 * Delete a document by ID.
 */
export async function remove(collectionName, id) {
  const promise = db.collection(collectionName).doc(id).delete();
  await withTimeout(promise, 6000);
}
