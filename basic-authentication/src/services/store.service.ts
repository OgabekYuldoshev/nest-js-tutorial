class StoreService {
  private store = new Map<string, any>();

  set(key: string, value: any): void {
    this.store.set(key, value);
  }

  get<T>(key: string): T {
    return this.store.get(key) as T;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const storeService = new StoreService();
