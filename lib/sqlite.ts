import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'library.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

function sanitizeCollectionName(collection: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(collection)) {
    throw new Error(`Invalid collection name: ${collection}`);
  }
  return `col_${collection}`;
}

function ensureCollectionTable(collection: string) {
  const table = sanitizeCollectionName(collection);
  sqlite.prepare(`CREATE TABLE IF NOT EXISTS "${table}" (id TEXT PRIMARY KEY, doc TEXT NOT NULL)`).run();
}

function parseJsonDoc(row: { doc: string }) {
  try {
    return JSON.parse(row.doc);
  } catch (error) {
    return {};
  }
}

function getFieldValue(document: any, field: string) {
  if (!field) return undefined;
  const parts = field.split('.');
  let current = document;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

function matchesFilter(document: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) {
    return true;
  }

  if (typeof filter !== 'object' || filter instanceof RegExp) {
    return document === filter;
  }

  if (Array.isArray(filter)) {
    return filter.some((item) => matchesFilter(document, item));
  }

  if (filter.$or && Array.isArray(filter.$or)) {
    return filter.$or.some((item: any) => matchesFilter(document, item));
  }

  if (filter.$and && Array.isArray(filter.$and)) {
    return filter.$and.every((item: any) => matchesFilter(document, item));
  }

  for (const key of Object.keys(filter)) {
    if (key === '$or' || key === '$and') continue;
    const value = filter[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof RegExp)) {
      if ('$exists' in value) {
        const exists = getFieldValue(document, key) !== undefined;
        if (exists !== Boolean(value.$exists)) return false;
      }
      if ('$ne' in value) {
        if (getFieldValue(document, key) === value.$ne) return false;
      }
      if ('$regex' in value) {
        const fieldValue = getFieldValue(document, key);
        if (fieldValue == null) return false;
        const regex = value.$regex;
        if (regex instanceof RegExp) {
          if (!regex.test(String(fieldValue))) return false;
        } else if (typeof regex === 'string') {
          if (!new RegExp(regex).test(String(fieldValue))) return false;
        } else {
          return false;
        }
      }
      if ('$in' in value) {
        if (!Array.isArray(value.$in) || !value.$in.includes(getFieldValue(document, key))) {
          return false;
        }
      }
      if ('$nin' in value) {
        if (Array.isArray(value.$nin) && value.$nin.includes(getFieldValue(document, key))) {
          return false;
        }
      }
      if ('$gt' in value) {
        if (!(getFieldValue(document, key) > value.$gt)) return false;
      }
      if ('$lt' in value) {
        if (!(getFieldValue(document, key) < value.$lt)) return false;
      }
      if ('$gte' in value) {
        if (!(getFieldValue(document, key) >= value.$gte)) return false;
      }
      if ('$lte' in value) {
        if (!(getFieldValue(document, key) <= value.$lte)) return false;
      }
      if ('$eq' in value) {
        if (getFieldValue(document, key) !== value.$eq) return false;
      }
      if (!('$exists' in value || '$ne' in value || '$regex' in value || '$in' in value || '$nin' in value || '$gt' in value || '$lt' in value || '$gte' in value || '$lte' in value || '$eq' in value)) {
        // Treat object as nested equality
        const nestedValue = getFieldValue(document, key);
        if (typeof nestedValue !== 'object' || nestedValue === null) return false;
        if (!matchesFilter(nestedValue, value)) return false;
      }
    } else if (value instanceof RegExp) {
      const fieldValue = getFieldValue(document, key);
      if (fieldValue == null || !value.test(String(fieldValue))) return false;
    } else {
      if (getFieldValue(document, key) !== value) return false;
    }
  }

  return true;
}

function applyProjection(document: any, projection: any) {
  if (!projection || Object.keys(projection).length === 0) {
    return { ...document };
  }
  const result: any = {};
  const includeFields = Object.values(projection).some((value) => value === 1 || value === true);
  if (includeFields) {
    for (const key of Object.keys(projection)) {
      if (projection[key]) {
        result[key] = getFieldValue(document, key);
      }
    }
    if (projection._id === undefined && document._id !== undefined) {
      result._id = document._id;
    }
  } else {
    Object.assign(result, document);
    for (const key of Object.keys(projection)) {
      if (!projection[key]) {
        delete result[key];
      }
    }
  }
  return result;
}

function sortDocuments(docs: any[], sortSpec: any) {
  const keys = Object.keys(sortSpec || {});
  return docs.slice().sort((a, b) => {
    for (const key of keys) {
      const direction = sortSpec[key] === -1 ? -1 : 1;
      const aValue = getFieldValue(a, key);
      const bValue = getFieldValue(b, key);
      if (aValue === bValue) continue;
      if (aValue === undefined) return 1 * direction;
      if (bValue === undefined) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      if (aValue < bValue) return -1 * direction;
    }
    return 0;
  });
}

function getExpressionValue(document: any, expression: any) {
  if (typeof expression === 'string') {
    if (expression.startsWith('$')) {
      return getFieldValue(document, expression.slice(1));
    }
    return expression;
  }
  if (typeof expression === 'object' && expression !== null) {
    if ('$sum' in expression) {
      const value = expression.$sum;
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.startsWith('$')) return getFieldValue(document, value.slice(1));
    }
    return expression;
  }
  return expression;
}

function aggregateGroup(documents: any[], groupSpec: any) {
  const grouped = new Map<string, any>();

  for (const document of documents) {
    const groupId = getExpressionValue(document, groupSpec._id);
    const key = JSON.stringify(groupId);
    if (!grouped.has(key)) {
      grouped.set(key, { _id: groupId });
    }
    const accumulator = grouped.get(key);

    for (const field of Object.keys(groupSpec)) {
      if (field === '_id') continue;
      const expression = groupSpec[field];
      if (typeof expression === 'object' && expression !== null && '$sum' in expression) {
        if (expression.$sum === 1) {
          accumulator[field] = (accumulator[field] || 0) + 1;
        } else {
          accumulator[field] = (accumulator[field] || 0) + Number(getExpressionValue(document, expression.$sum) || 0);
        }
      }
    }
  }

  return Array.from(grouped.values());
}

function cursor(rows: any[]) {
  let currentRows = rows;
  return {
    project(spec: any) {
      if (spec && Object.keys(spec).length > 0) {
        currentRows = currentRows.map((row) => applyProjection(row, spec));
      }
      return this;
    },
    sort(spec: any) {
      if (spec && Object.keys(spec).length > 0) {
        currentRows = sortDocuments(currentRows, spec);
      }
      return this;
    },
    limit(limitCount: number) {
      if (typeof limitCount === 'number') {
        currentRows = currentRows.slice(0, limitCount);
      }
      return this;
    },
    toArray() {
      return currentRows;
    },
    next() {
      return currentRows[0] ?? null;
    },
  };
}

function collection(name: string) {
  ensureCollectionTable(name);
  const table = sanitizeCollectionName(name);

  function loadDocuments() {
    const rows = sqlite.prepare(`SELECT doc FROM "${table}"`).all() as Array<{ doc: string }>;
    return rows.map((row) => parseJsonDoc(row));
  }

  function writeDocument(id: string, document: any) {
    sqlite.prepare(`INSERT OR REPLACE INTO "${table}" (id, doc) VALUES (?, ?)`).run(id, JSON.stringify(document));
  }

  function removeDocument(id: string) {
    sqlite.prepare(`DELETE FROM "${table}" WHERE id = ?`).run(id);
  }

  return {
    find(filter: any = {}) {
      const documents = loadDocuments().filter((document) => matchesFilter(document, filter));
      return cursor(documents);
    },
    findOne(filter: any = {}) {
      return this.find(filter).limit(1).toArray()[0] || null;
    },
    async insertOne(document: any) {
      const doc = { ...document };
      if (!doc._id) {
        doc._id = uuidv4();
      }
      writeDocument(doc._id, doc);
      return { acknowledged: true, insertedId: doc._id };
    },
    async insertMany(documents: any[]) {
      const insertedIds: string[] = [];
      for (const document of documents) {
        const doc = { ...document };
        if (!doc._id) {
          doc._id = uuidv4();
        }
        writeDocument(doc._id, doc);
        insertedIds.push(doc._id);
      }
      return { acknowledged: true, insertedIds };
    },
    async updateOne(filter: any, update: any) {
      const documents = loadDocuments();
      const existing = documents.find((document) => matchesFilter(document, filter));
      if (!existing) {
        return { matchedCount: 0, modifiedCount: 0 };
      }
      const existingId = existing._id;
      const updated = { ...existing };
      if (update.$set && typeof update.$set === 'object') {
        Object.assign(updated, update.$set);
      }
      if ('$set' in update === false) {
        Object.assign(updated, update);
      }
      writeDocument(existingId, updated);
      return { matchedCount: 1, modifiedCount: 1 };
    },
    async findOneAndUpdate(filter: any, update: any, options?: any) {
      const documents = loadDocuments();
      const existing = documents.find((document) => matchesFilter(document, filter));
      if (!existing) {
        return { value: null, lastErrorObject: { n: 0, updatedExisting: false }, ok: 0 };
      }

      const existingId = existing._id;
      const updated = { ...existing };
      if (update && typeof update === 'object' && !Array.isArray(update)) {
        if (update.$set && typeof update.$set === 'object') {
          Object.assign(updated, update.$set);
        }
        if (update.$set === undefined) {
          Object.assign(updated, update);
        }
      }

      writeDocument(existingId, updated);
      return {
        value: updated,
        lastErrorObject: { n: 1, updatedExisting: true },
        ok: 1,
        ...(options && options.returnDocument === 'after' ? {} : {}),
      };
    },
    async deleteOne(filter: any) {
      const documents = loadDocuments();
      const existing = documents.find((document) => matchesFilter(document, filter));
      if (!existing) {
        return { deletedCount: 0 };
      }
      removeDocument(existing._id);
      return { deletedCount: 1 };
    },
    async countDocuments(filter: any = {}) {
      return loadDocuments().filter((document) => matchesFilter(document, filter)).length;
    },
    aggregate(pipeline: any[] = []) {
      let documents = loadDocuments();
      for (const stage of pipeline) {
        if (stage.$match) {
          documents = documents.filter((document) => matchesFilter(document, stage.$match));
        } else if (stage.$group) {
          documents = aggregateGroup(documents, stage.$group);
        } else if (stage.$sort) {
          documents = sortDocuments(documents, stage.$sort);
        } else if (stage.$project) {
          documents = documents.map((document) => applyProjection(document, stage.$project));
        } else if (stage.$limit) {
          documents = documents.slice(0, stage.$limit);
        }
      }
      return {
        toArray() {
          return documents;
        },
      };
    },
  };
}

export async function getDatabase() {
  return {
    collection,
  };
}

export function getMockUsers() {
  return [];
}

export function setMockUsers(users: any[]) {
  // No-op: SQLite persistence is primary.
}

export async function closeDatabase(): Promise<void> {
  sqlite.close();
}
