import { Stronghold } from 'tauri-plugin-stronghold-api';

const STORAGE_NAME = 'vaults/vault.';

export function useSecureStorage(userid: string, mode: 'rw'): {
  save: (key: string, value: string, userid: string) => Promise<void>;
  load: (key: string, userid: string) => Promise<string>;
}

export function useSecureStorage(userid: string, mode: 'r'): {
  load: (key: string, userid: string) => Promise<string>;
}

export function useSecureStorage(userid: string, mode: 'rw' | 'r') {
  async function getClient(stronghold: Stronghold) {
    try {
      return await stronghold.loadClient(userid);
    } catch {
      return await stronghold.createClient(userid);
    }
  }

  const save = async (key: string, value: string, userid: string) => {
    const storagePath = await getStoragePath(userid);
    const stronghold = await Stronghold.load(storagePath, userid);
    const client = await getClient(stronghold);
    const store = client.getStore();
    await store.insert(key, Array.from(new TextEncoder().encode(value)));
    await stronghold.save();
  };

  const load = async (key: string, userid: string) => {
    const storagePath = await getStoragePath(userid);
    const stronghold = await Stronghold.load(storagePath, userid);
    const client = await getClient(stronghold);
    const store = client.getStore();
    const value = await store.get(key);
    const decoded = new TextDecoder().decode(new Uint8Array(value ?? []));
    return decoded;
  };

  const getStoragePath = async (userid: string) => {
    const { appDataDir } = await import('@tauri-apps/api/path');
    return `${await appDataDir()}${STORAGE_NAME}${userid.slice(0, 8)}`;
  };

  return mode === 'rw' ? { save, load } : { load };
}