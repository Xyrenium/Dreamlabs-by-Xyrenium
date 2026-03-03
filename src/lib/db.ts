/**
 * Simple file-based user database for server-side persistence
 * Stores user data + tokens in a JSON file on the server
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'users.json');

interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  tokens: number;
  createdAt: string;
  transactions: {
    id: string;
    type: 'purchase' | 'usage' | 'bonus';
    amount: number;
    description: string;
    date: string;
  }[];
}

interface Database {
  users: UserRecord[];
}

function ensureDbExists(): void {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

export function readDb(): Database {
  ensureDbExists();
  const raw = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function writeDb(db: Database): void {
  ensureDbExists();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const db = readDb();
  return db.users.find(u => u.email === email);
}

export function findUserById(id: string): UserRecord | undefined {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

export function createUser(email: string, password: string, name: string): UserRecord {
  const db = readDb();
  const newUser: UserRecord = {
    id: 'user_' + Date.now(),
    email,
    password,
    name,
    tokens: 300,
    createdAt: new Date().toISOString(),
    transactions: [{
      id: Date.now().toString(),
      type: 'bonus',
      amount: 300,
      description: 'Welcome bonus - 300 free tokens!',
      date: new Date().toISOString(),
    }],
  };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function updateUserTokens(userId: string, tokens: number): void {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.tokens = tokens;
    writeDb(db);
  }
}

export function addTransaction(userId: string, tx: UserRecord['transactions'][0]): void {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.transactions.unshift(tx);
    writeDb(db);
  }
}
