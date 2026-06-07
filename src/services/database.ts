export interface Farm {
  id: string;
  name: string;
  areaHa: number;
  geometry: any;
  cropType?: string;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = 'khetmap-farms';

function getAllFarms(): Farm[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAllFarms(farms: Farm[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
  } catch (e) {
    console.error('Failed to save farms:', e);
  }
}

export async function getFarms(_userId: string): Promise<Farm[]> {
  const farms = getAllFarms();
  return farms.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createFarm(_userId: string, farm: Omit<Farm, 'id' | 'createdAt'>): Promise<string> {
  const farms = getAllFarms();
  const id = crypto.randomUUID();
  farms.push({ id, ...farm, createdAt: Date.now() } as Farm);
  saveAllFarms(farms);
  return id;
}

export async function updateFarm(_userId: string, farmId: string, updates: Partial<Farm>) {
  const farms = getAllFarms();
  const idx = farms.findIndex(f => f.id === farmId);
  if (idx !== -1) {
    farms[idx] = { ...farms[idx], ...updates };
    saveAllFarms(farms);
  }
}

export async function deleteFarm(_userId: string, farmId: string) {
  const farms = getAllFarms().filter(f => f.id !== farmId);
  saveAllFarms(farms);
}

export function subscribeToFarms(_userId: string, callback: (farms: Farm[]) => void): () => void {
  // Initial call with current data
  callback(getAllFarms().sort((a, b) => b.createdAt - a.createdAt));

  // Listen for storage changes from other tabs
  const handler = () => {
    callback(getAllFarms().sort((a, b) => b.createdAt - a.createdAt));
  };
  window.addEventListener('storage', handler);

  // Poll for changes within the same tab
  const interval = setInterval(() => {
    callback(getAllFarms().sort((a, b) => b.createdAt - a.createdAt));
  }, 2000);

  return () => {
    window.removeEventListener('storage', handler);
    clearInterval(interval);
  };
}
