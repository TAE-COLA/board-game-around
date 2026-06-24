#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';

const PROTOCOL_VERSION = '2024-11-05';
const WRITE_ENABLED = process.env.FIREBASE_MCP_ENABLE_WRITES === 'true';

const env = {
  ...readEnvFile(path.resolve(process.cwd(), '.env')),
  ...process.env,
};

const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID;
const databaseUrl = trimSlash(env.FIREBASE_DATABASE_URL || env.REACT_APP_FIREBASE_DATABASE_URL);
const serviceAccountPath = env.GOOGLE_APPLICATION_CREDENTIALS;

let cachedAccessToken = null;

const tools = [
  {
    name: 'firebase_project_info',
    description: 'Show the Firebase project/database configured for this MCP server.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'firestore_get_document',
    description: 'Read one Firestore document by document path, for example "Games/the-mind".',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Document path under the default Firestore database.' },
      },
      required: ['path'],
      additionalProperties: false,
    },
  },
  {
    name: 'firestore_list_collection',
    description: 'List Firestore documents in a collection path, for example "Games".',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Collection path under the default Firestore database.' },
        pageSize: { type: 'number', description: 'Maximum documents to return. Default 50.' },
      },
      required: ['path'],
      additionalProperties: false,
    },
  },
  {
    name: 'rtdb_get',
    description: 'Read a Realtime Database path, for example "Lounge" or "User-lounge/{uid}".',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Realtime Database path.' },
      },
      required: ['path'],
      additionalProperties: false,
    },
  },
  {
    name: 'rtdb_query_equal',
    description: 'Query a Realtime Database path with orderBy and equalTo, for example Lounge by code.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Realtime Database path to query.' },
        orderBy: { type: 'string', description: 'Child key to order by.' },
        equalTo: {
          description: 'Value to match. Strings, numbers, booleans, and null are supported.',
        },
      },
      required: ['path', 'orderBy', 'equalTo'],
      additionalProperties: false,
    },
  },
  {
    name: 'rtdb_update',
    description: 'Patch a Realtime Database path. Requires FIREBASE_MCP_ENABLE_WRITES=true.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Realtime Database path to update.' },
        value: { type: 'object', description: 'Object patch value.' },
      },
      required: ['path', 'value'],
      additionalProperties: false,
    },
  },
  {
    name: 'rtdb_set',
    description: 'Replace a Realtime Database path. Requires FIREBASE_MCP_ENABLE_WRITES=true.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Realtime Database path to set.' },
        value: { description: 'New value for the path. Use null to delete.' },
      },
      required: ['path', 'value'],
      additionalProperties: false,
    },
  },
];

const handlers = {
  firebase_project_info: async () => ({
    projectId,
    databaseUrl,
    serviceAccountConfigured: !!serviceAccountPath,
    writeEnabled: WRITE_ENABLED,
  }),
  firestore_get_document: async ({ path: documentPath }) => {
    requireProject();
    const response = await firebaseRequest(
      'GET',
      firestoreUrl(`documents/${cleanPath(documentPath)}`)
    );
    return decodeFirestoreDocument(response);
  },
  firestore_list_collection: async ({ path: collectionPath, pageSize = 50 }) => {
    requireProject();
    const url = firestoreUrl(`documents/${cleanPath(collectionPath)}`);
    url.searchParams.set('pageSize', String(Math.min(Math.max(Number(pageSize) || 50, 1), 100)));
    const response = await firebaseRequest('GET', url);
    return {
      documents: (response.documents ?? []).map(decodeFirestoreDocument),
      nextPageToken: response.nextPageToken ?? null,
    };
  },
  rtdb_get: async ({ path: databasePath }) => {
    requireDatabase();
    return firebaseRequest('GET', rtdbUrl(databasePath));
  },
  rtdb_query_equal: async ({ path: databasePath, orderBy, equalTo }) => {
    requireDatabase();
    const url = rtdbUrl(databasePath);
    url.searchParams.set('orderBy', JSON.stringify(orderBy));
    url.searchParams.set('equalTo', JSON.stringify(equalTo));
    return firebaseRequest('GET', url);
  },
  rtdb_update: async ({ path: databasePath, value }) => {
    requireDatabase();
    requireWrites();
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      throw new Error('rtdb_update requires value to be an object patch.');
    }
    return firebaseRequest('PATCH', rtdbUrl(databasePath), value);
  },
  rtdb_set: async ({ path: databasePath, value }) => {
    requireDatabase();
    requireWrites();
    return firebaseRequest('PUT', rtdbUrl(databasePath), value);
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Number.POSITIVE_INFINITY,
});

rl.on('line', async (line) => {
  if (!line.trim()) return;

  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    sendError(null, -32700, `Parse error: ${error.message}`);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(message, 'id')) {
    return;
  }

  try {
    const result = await handleRequest(message);
    send({ jsonrpc: '2.0', id: message.id, result });
  } catch (error) {
    sendError(message.id, -32000, error.message);
  }
});

async function handleRequest(message) {
  switch (message.method) {
    case 'initialize':
      return {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: 'board-game-around-firebase', version: '0.1.0' },
      };
    case 'ping':
      return {};
    case 'tools/list':
      return { tools };
    case 'tools/call': {
      const name = message.params?.name;
      const args = message.params?.arguments ?? {};
      const handler = handlers[name];
      if (!handler) throw new Error(`Unknown tool: ${name}`);

      const value = await handler(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(value, null, 2),
          },
        ],
      };
    }
    default:
      throw new Error(`Unsupported method: ${message.method}`);
  }
}

async function firebaseRequest(method, url, body) {
  const token = await getAccessToken();
  const bodyText = body === undefined ? undefined : JSON.stringify(body);
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };

  if (bodyText !== undefined) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(bodyText);
  }

  const responseText = await requestText(url, { method, headers, bodyText });
  const responseJson = responseText ? JSON.parse(responseText) : null;

  if (responseJson?.error) {
    const errorMessage =
      typeof responseJson.error === 'string'
        ? responseJson.error
        : responseJson.error.message ?? JSON.stringify(responseJson.error);
    throw new Error(errorMessage);
  }

  return responseJson;
}

async function getAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  if (!serviceAccountPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required.');
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: [
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/cloud-platform',
    ].join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const assertion = signJwt(
    { alg: 'RS256', typ: 'JWT' },
    claimSet,
    serviceAccount.private_key
  );

  const tokenResponse = await requestText('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    bodyText: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  const tokenJson = JSON.parse(tokenResponse);

  if (!tokenJson.access_token) {
    throw new Error(`Failed to obtain access token: ${tokenResponse}`);
  }

  cachedAccessToken = {
    token: tokenJson.access_token,
    expiresAt: Date.now() + Number(tokenJson.expires_in ?? 3600) * 1000,
  };

  return cachedAccessToken.token;
}

function signJwt(header, payload, privateKey) {
  const input = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = crypto.createSign('RSA-SHA256').update(input).sign(privateKey);
  return `${input}.${base64Url(signature)}`;
}

function requestText(urlInput, { method, headers = {}, bodyText } = {}) {
  const url = typeof urlInput === 'string' ? new URL(urlInput) : urlInput;

  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method,
        headers,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`HTTP ${response.statusCode}: ${text}`));
            return;
          }
          resolve(text);
        });
      }
    );

    request.on('error', reject);
    if (bodyText !== undefined) request.write(bodyText);
    request.end();
  });
}

function firestoreUrl(resourcePath) {
  return new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/(default)/${resourcePath}`
  );
}

function rtdbUrl(databasePath) {
  return new URL(`${databaseUrl}/${cleanPath(databasePath)}.json`);
}

function decodeFirestoreDocument(document) {
  return {
    name: document.name,
    id: document.name?.split('/').pop(),
    createTime: document.createTime,
    updateTime: document.updateTime,
    fields: decodeFirestoreFields(document.fields ?? {}),
  };
}

function decodeFirestoreFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function decodeFirestoreValue(value) {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('stringValue' in value) return value.stringValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map(decodeFirestoreValue);
  }
  if ('mapValue' in value) {
    return decodeFirestoreFields(value.mapValue.fields ?? {});
  }
  return value;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function requireProject() {
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID or REACT_APP_FIREBASE_PROJECT_ID is required.');
}

function requireDatabase() {
  if (!databaseUrl) {
    throw new Error('FIREBASE_DATABASE_URL or REACT_APP_FIREBASE_DATABASE_URL is required.');
  }
}

function requireWrites() {
  if (!WRITE_ENABLED) {
    throw new Error('Writes are disabled. Set FIREBASE_MCP_ENABLE_WRITES=true to enable this tool.');
  }
}

function cleanPath(value) {
  return String(value ?? '').replace(/^\/+|\/+$/g, '');
}

function trimSlash(value) {
  return value ? String(value).replace(/\/+$/g, '') : value;
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function send(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function sendError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}
