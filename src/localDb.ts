import { PullRequest } from './types';

// In-memory store
let pullRequests: Record<string, any> = {};
let systemConfig: Record<string, any> = { isMergePaused: false };

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
  listeners.forEach(l => l());
};

// Mock Firestore API
export const db = {};

export const collection = (db: any, path: string) => path;
export const doc = (db: any, path: string, id?: string) => ({ path, id });

export const onSnapshot = (ref: any, callback: (snapshot: any) => void) => {
  const isDoc = typeof ref === 'object' && ref.id;
  
  const trigger = () => {
    if (isDoc) {
      if (ref.path === 'system' && ref.id === 'config') {
        callback({ data: () => systemConfig, exists: () => true, id: ref.id });
      }
    } else {
      if (ref === 'pullRequests') {
        const docs = Object.entries(pullRequests).map(([id, data]) => ({
          id,
          data: () => data,
          exists: () => true
        }));
        callback({ docs });
      }
    }
  };

  trigger();
  listeners.add(trigger);
  return () => { listeners.delete(trigger); };
};

export const addDoc = async (ref: any, data: any) => {
  const id = Math.random().toString(36).substring(2, 9);
  if (ref === 'pullRequests') {
    pullRequests[id] = { ...data, id };
    notify();
  }
  return { id };
};

export const updateDoc = async (ref: any, data: any) => {
  if (ref.path === 'pullRequests' && ref.id) {
    if (pullRequests[ref.id]) {
      pullRequests[ref.id] = { ...pullRequests[ref.id], ...data };
      notify();
    }
  }
};

export const setDoc = async (ref: any, data: any, options?: any) => {
  if (ref.path === 'system' && ref.id === 'config') {
    if (options?.merge) {
      systemConfig = { ...systemConfig, ...data };
    } else {
      systemConfig = data;
    }
    notify();
  }
};

export const query = (ref: any, ...constraints: any[]) => {
  return { ref, constraints };
};

export const where = (field: string, op: string, value: any) => {
  return { field, op, value };
};

export const getDocs = async (q: any) => {
  if (q === 'pullRequests') {
    const docs = Object.entries(pullRequests).map(([id, data]) => ({
      id,
      data: () => data,
      exists: () => true
    }));
    return { docs };
  }

  if (q.ref === 'pullRequests') {
    let docs = Object.entries(pullRequests).map(([id, data]) => ({
      id,
      data: () => data,
      exists: () => true
    }));

    if (q.constraints && q.constraints.length > 0) {
      q.constraints.forEach((c: any) => {
        if (c.op === 'in') {
          docs = docs.filter(d => c.value.includes(d.data()[c.field]));
        } else if (c.op === '==') {
          docs = docs.filter(d => d.data()[c.field] === c.value);
        }
      });
    }
    return { docs };
  }
  return { docs: [] };
};

export const serverTimestamp = () => Date.now();
