import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createArteiaServer } from "./server.mjs";

class MemoryProvider {
  constructor() {
    this.activeMember = null;
    this.library = {
      members: { 도하나: { 모델명: "도하나", 메이크업: "로즈 메이크업" } },
      concepts: { "0기본0": { 배경: "흰 배경", 표정: "$감정.정체성$", 의상: "%기본 의상%" } },
      options: { 감정: { 정체성: "%모델명%다운 눈빛" } },
      outfits: { OUTFIT_1: { overview: "화이트 드레스", parts: {} } },
      enums: { "모델명 목록": ["도하나"], "모델 상세 키 목록": ["모델명"], "컨셉 상세 키 목록": ["배경", "표정", "의상"] },
    };
  }

  async loadLibrary() { return this.library; }
  async listScripts() { return ["gen_default.script.txt"]; }
  async loadScript() { return "MAIN: %모델명%\n%컨셉상세%"; }
  async getActiveMember() { return this.activeMember; }
  async setActiveMember(memberName) { this.activeMember = memberName; }
  async listReferences() { return []; }
}

test("exposes member state and prompt composition through MCP", async () => {
  const provider = new MemoryProvider();
  const server = createArteiaServer(provider);
  const client = new Client({ name: "arteia-test", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const tools = await client.listTools();
    assert.ok(tools.tools.some((tool) => tool.name === "compose_saved_concept"));

    await client.callTool({ name: "set_active_member", arguments: { memberName: "도하나" } });
    const active = await client.callTool({ name: "get_active_member", arguments: {} });
    assert.equal(active.structuredContent.activeMember, "도하나");

    const composed = await client.callTool({
      name: "compose_saved_concept",
      arguments: { conceptName: "0기본0", includeReference: false },
    });
    assert.match(composed.structuredContent.prompt, /MAIN: 도하나/);
    assert.deepEqual(composed.structuredContent.unresolvedTokens, []);
  } finally {
    await client.close();
    await server.close();
  }
});
