import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import {
  FileArteiaProvider,
  LIBRARY_FILES,
  findLocalArteiaRoot,
  mimeTypeFor,
  referenceKey,
} from "../../netlify/lib/arteia/providers.mjs";

const siteID = process.env.NETLIFY_SITE_ID;
const token = process.env.NETLIFY_AUTH_TOKEN;
if (!siteID || !token) {
  throw new Error("NETLIFY_SITE_ID와 NETLIFY_AUTH_TOKEN 환경 변수가 필요합니다.");
}

const root = await findLocalArteiaRoot();
if (!root) throw new Error("ARTEIA 폴더를 찾지 못했습니다. ARTEIA_DATA_DIR을 설정하세요.");

const provider = new FileArteiaProvider(root);
const directories = await provider.directories();
const store = getStore("arteia", { siteID, token });

for (const fileName of LIBRARY_FILES) {
  const data = JSON.parse(await readFile(path.join(directories.library, fileName), "utf8"));
  await store.setJSON(`library/${fileName}`, data);
  console.log(`uploaded library/${fileName}`);
}

const scripts = await provider.listScripts();
await store.setJSON("scripts/index.json", scripts);
for (const scriptName of scripts) {
  const script = await readFile(path.join(directories.library, "scripts", scriptName), "utf8");
  await store.set(`scripts/${scriptName}`, script);
  console.log(`uploaded scripts/${scriptName}`);
}

const includeImages = process.argv.includes("--include-images");
if (includeImages) {
  const referenceIndex = {};
  const memberEntries = await readdir(directories.references, { withFileTypes: true });
  for (const memberEntry of memberEntries.filter((entry) => entry.isDirectory())) {
    const references = await provider.listReferences(memberEntry.name);
    referenceIndex[memberEntry.name] = references;
    for (const reference of references) {
      const imagePath = path.join(directories.references, memberEntry.name, reference.name);
      await store.set(referenceKey(memberEntry.name, reference.name), await readFile(imagePath), {
        metadata: { memberName: memberEntry.name, fileName: reference.name, mimeType: mimeTypeFor(reference.name) },
      });
      console.log(`uploaded ${memberEntry.name}/${reference.name}`);
    }
  }
  await store.setJSON("references/index.json", referenceIndex);
} else {
  console.log("reference images skipped; pass --include-images to upload them");
}

console.log("ARTEIA data sync complete");
