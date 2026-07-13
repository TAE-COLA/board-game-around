import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const LIBRARY_FILES = ["members.json", "concepts.json", "options.json", "outfits.json", "enums.json"];

async function exists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function findNumberedDirectory(root, prefix) {
  const entries = await readdir(root, { withFileTypes: true });
  const entry = entries.find((item) => item.isDirectory() && item.name.startsWith(prefix));
  if (!entry) throw new Error(`${root} 아래에서 ${prefix} 폴더를 찾지 못했습니다.`);
  return path.join(root, entry.name);
}

export async function findLocalArteiaRoot() {
  const configured = process.env.ARTEIA_DATA_DIR;
  const candidates = [
    configured,
    path.resolve(process.cwd(), "..", "ARTEIA"),
    path.resolve(process.cwd(), "ARTEIA"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

export class FileArteiaProvider {
  constructor(root, stateFile = path.resolve(process.cwd(), ".arteia-local", "state.json")) {
    this.root = root;
    this.stateFile = stateFile;
    this.libraryCache = null;
  }

  async directories() {
    if (!this._directories) {
      this._directories = {
        library: await findNumberedDirectory(this.root, "20."),
        references: await findNumberedDirectory(this.root, "10."),
      };
    }
    return this._directories;
  }

  async loadLibrary() {
    if (this.libraryCache) return this.libraryCache;
    const { library } = await this.directories();
    const entries = await Promise.all(
      LIBRARY_FILES.map(async (fileName) => {
        const value = JSON.parse(await readFile(path.join(library, fileName), "utf8"));
        return [fileName.replace(/\.json$/, ""), value];
      })
    );
    this.libraryCache = Object.fromEntries(entries);
    return this.libraryCache;
  }

  async listScripts() {
    const { library } = await this.directories();
    const entries = await readdir(path.join(library, "scripts"), { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  }

  async loadScript(scriptName) {
    const { library } = await this.directories();
    const names = await this.listScripts();
    const normalized = normalizeScriptName(scriptName, names);
    return readFile(path.join(library, "scripts", normalized), "utf8");
  }

  async getActiveMember() {
    if (!(await exists(this.stateFile))) return null;
    const state = JSON.parse(await readFile(this.stateFile, "utf8"));
    return state.activeMember ?? null;
  }

  async setActiveMember(memberName) {
    await mkdir(path.dirname(this.stateFile), { recursive: true });
    await writeFile(this.stateFile, JSON.stringify({ activeMember: memberName }, null, 2), "utf8");
  }

  async listReferences(memberName) {
    const { references } = await this.directories();
    const memberDirectory = path.join(references, memberName);
    if (!(await exists(memberDirectory))) return [];
    const entries = await readdir(memberDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
      .map((entry) => ({ name: entry.name, mimeType: mimeTypeFor(entry.name) }))
      .sort((left, right) => left.name.localeCompare(right.name, "ko"));
  }

  async loadReference(memberName, referenceName) {
    const { references } = await this.directories();
    const safeName = path.basename(referenceName);
    return {
      data: await readFile(path.join(references, memberName, safeName)),
      mimeType: mimeTypeFor(safeName),
      name: safeName,
    };
  }
}

export class BlobArteiaProvider {
  constructor(store = getStore("arteia")) {
    this.store = store;
    this.libraryCache = null;
  }

  async loadLibrary() {
    if (this.libraryCache) return this.libraryCache;
    const entries = await Promise.all(
      LIBRARY_FILES.map(async (fileName) => {
        const value = await this.store.get(`library/${fileName}`, { type: "json", consistency: "strong" });
        if (value === null) throw new Error(`Netlify Blobs에 library/${fileName} 데이터가 없습니다.`);
        return [fileName.replace(/\.json$/, ""), value];
      })
    );
    this.libraryCache = Object.fromEntries(entries);
    return this.libraryCache;
  }

  async listScripts() {
    return (await this.store.get("scripts/index.json", { type: "json", consistency: "strong" })) ?? [];
  }

  async loadScript(scriptName) {
    const names = await this.listScripts();
    const normalized = normalizeScriptName(scriptName, names);
    const script = await this.store.get(`scripts/${normalized}`, { type: "text", consistency: "strong" });
    if (script === null) throw new Error(`Netlify Blobs에 scripts/${normalized} 데이터가 없습니다.`);
    return script;
  }

  async getActiveMember() {
    const state = await this.store.get("state/current-member.json", { type: "json", consistency: "strong" });
    return state?.activeMember ?? null;
  }

  async setActiveMember(memberName) {
    await this.store.setJSON("state/current-member.json", { activeMember: memberName });
  }

  async listReferences(memberName) {
    const index = (await this.store.get("references/index.json", { type: "json", consistency: "strong" })) ?? {};
    return index[memberName] ?? [];
  }

  async loadReference(memberName, referenceName) {
    const key = referenceKey(memberName, referenceName);
    const data = await this.store.get(key, { type: "arrayBuffer", consistency: "strong" });
    if (data === null) throw new Error(`Netlify Blobs에 ${key} 데이터가 없습니다.`);
    return { data: Buffer.from(data), mimeType: mimeTypeFor(referenceName), name: referenceName };
  }
}

export async function createArteiaProvider() {
  const localRoot = await findLocalArteiaRoot();
  if (localRoot) return new FileArteiaProvider(localRoot);
  return new BlobArteiaProvider();
}

export function normalizeScriptName(scriptName, availableNames) {
  const requested = scriptName || "gen_default.script.txt";
  if (availableNames.includes(requested)) return requested;
  const matches = availableNames.filter(
    (name) => name === `${requested}.script.txt` || name.replace(/\.script\.txt$/, "") === requested
  );
  if (matches.length === 1) return matches[0];
  throw new Error(`알 수 없는 스크립트: ${requested}`);
}

export function mimeTypeFor(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

export function referenceKey(memberName, referenceName) {
  return `references/${encodeURIComponent(memberName)}/${encodeURIComponent(referenceName)}`;
}

export { LIBRARY_FILES };
