const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY as string | undefined;
const BASE_URL = "https://api.jsonbin.io/v3/b";

const BIN_IDS_KEY = "campusconnect_bin_ids";

interface BinIds {
  students: string;
  posts: string;
  events: string;
}

function getHeaders() {
  if (!MASTER_KEY) {
    throw new Error("VITE_JSONBIN_MASTER_KEY is not set");
  }
  return {
    "Content-Type": "application/json",
    "X-Master-Key": MASTER_KEY,
  };
}

function getStoredBinIds(): BinIds | null {
  try {
    const stored = localStorage.getItem(BIN_IDS_KEY);
    if (stored) return JSON.parse(stored) as BinIds;
  } catch {
    // ignore
  }
  return null;
}

function storeBinIds(ids: BinIds) {
  localStorage.setItem(BIN_IDS_KEY, JSON.stringify(ids));
}

async function createBin(data: unknown, name: string): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "X-Bin-Name": name,
      "X-Bin-Private": "false",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create bin "${name}": ${res.status} ${text}`);
  }
  const json = (await res.json()) as { metadata: { id: string } };
  return json.metadata.id;
}

async function readBin<T>(binId: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${binId}/latest`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to read bin ${binId}: ${res.status}`);
  }
  const json = (await res.json()) as { record: T };
  return json.record;
}

async function updateBin<T>(binId: string, data: T): Promise<void> {
  const res = await fetch(`${BASE_URL}/${binId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update bin ${binId}: ${res.status} ${text}`);
  }
}

export async function initBins(initialData: {
  students: unknown[];
  posts: unknown[];
  events: unknown[];
}): Promise<BinIds> {
  const existing = getStoredBinIds();
  if (existing) return existing;

  const [studentsId, postsId, eventsId] = await Promise.all([
    createBin(initialData.students, "campusconnect-students"),
    createBin(initialData.posts, "campusconnect-posts"),
    createBin(initialData.events, "campusconnect-events"),
  ]);

  const ids: BinIds = { students: studentsId, posts: postsId, events: eventsId };
  storeBinIds(ids);
  return ids;
}

export async function getStudents<T>(): Promise<T[]> {
  const ids = getStoredBinIds();
  if (!ids) throw new Error("Bins not initialized");
  return readBin<T[]>(ids.students);
}

export async function getPosts<T>(): Promise<T[]> {
  const ids = getStoredBinIds();
  if (!ids) throw new Error("Bins not initialized");
  return readBin<T[]>(ids.posts);
}

export async function getEvents<T>(): Promise<T[]> {
  const ids = getStoredBinIds();
  if (!ids) throw new Error("Bins not initialized");
  return readBin<T[]>(ids.events);
}

export async function saveStudents<T>(data: T[]): Promise<void> {
  const ids = getStoredBinIds();
  if (!ids) throw new Error("Bins not initialized");
  await updateBin(ids.students, data);
}

export async function savePosts<T>(data: T[]): Promise<void> {
  const ids = getStoredBinIds();
  if (!ids) throw new Error("Bins not initialized");
  await updateBin(ids.posts, data);
}

export async function saveEvents<T>(data: T[]): Promise<void> {
  const ids = getStoredBinIds();
  if (!ids) throw new Error("Bins not initialized");
  await updateBin(ids.events, data);
}

export function isConfigured(): boolean {
  return !!MASTER_KEY;
}
