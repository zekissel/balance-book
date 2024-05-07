import { Stronghold } from 'tauri-plugin-stronghold-api';

export const STORAGE_NAME = 'vault.hold';

export function useSecureStorage(userid: string) {
  async function getClient(stronghold: Stronghold) {
    try {
      return await stronghold.loadClient(userid);
    } catch {
      return await stronghold.createClient(userid);
    }
  }

  const save = async (key: string, value: string, password: string) => {
    const storagePath = await getStoragePath();
    const stronghold = await Stronghold.load(storagePath, password);
    const client = await getClient(stronghold);
    const store = client.getStore();
    await store.insert(key, Array.from(new TextEncoder().encode(value)));
    await stronghold.save();
  };

  const load = async (key: string, password: string) => {
    const storagePath = await getStoragePath();
    const stronghold = await Stronghold.load(storagePath, password);
    const client = await getClient(stronghold);
    const store = client.getStore();
    const value = await store.get(key);
    const decoded = new TextDecoder().decode(new Uint8Array(value ?? []));
    return decoded;
  };

  const getStoragePath = async () => {
    const { appDataDir } = await import('@tauri-apps/api/path');
    return `${await appDataDir()}${STORAGE_NAME}`;
  };

  return { save, load };
}