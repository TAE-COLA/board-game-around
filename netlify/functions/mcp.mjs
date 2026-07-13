import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { timingSafeEqual } from "node:crypto";
import { createArteiaProvider } from "../lib/arteia/providers.mjs";
import { createArteiaServer } from "../lib/arteia/server.mjs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, mcp-session-id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

export default async function handler(request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (!isAuthorized(request)) {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
      { status: 401, headers: CORS_HEADERS }
    );
  }
  if (!new Set(["POST", "GET", "DELETE"]).has(request.method)) {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  const provider = await createArteiaProvider();
  const server = createArteiaServer(provider);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(CORS_HEADERS)) headers.set(name, value);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("ARTEIA MCP error", error);
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null },
      { status: 500, headers: CORS_HEADERS }
    );
  } finally {
    await transport.close();
    await server.close();
  }
}

export const config = { path: "/mcp" };

function isAuthorized(request) {
  const expected = process.env.ARTEIA_MCP_TOKEN;
  if (!expected) return true;
  const urlToken = new URL(request.url).searchParams.get("token");
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const supplied = urlToken ?? bearerToken ?? "";
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}
