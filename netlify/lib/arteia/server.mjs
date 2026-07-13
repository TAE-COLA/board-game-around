import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildPrompt } from "./render.mjs";

const conceptFields = {
  배경: z.string().optional(),
  자세: z.string().optional(),
  표정: z.string().optional(),
  구도: z.string().optional(),
  조명: z.string().optional(),
  의상: z.string().optional(),
  헤어: z.string().optional(),
  악세서리: z.string().optional(),
  메이크업: z.string().optional(),
  기타: z.string().optional(),
  종횡비: z.string().optional(),
};

function textResult(message, structuredContent = {}) {
  return { content: [{ type: "text", text: message }], structuredContent };
}

async function resolveMember(provider, library, requestedMember) {
  const memberName = requestedMember ?? (await provider.getActiveMember());
  if (!memberName) throw new Error("현재 멤버가 없습니다. 먼저 set_active_member를 호출하세요.");
  if (!library.members[memberName]) throw new Error(`알 수 없는 멤버: ${memberName}`);
  return memberName;
}

function defaultReference(references) {
  return references.find((item) => item.name.includes("기본")) ?? references[0] ?? null;
}

async function promptToolResult(provider, rendered, includeReference, referenceName) {
  const content = [
    {
      type: "text",
      text:
        `아래 프롬프트로 ${rendered.memberName}의 '${rendered.conceptName}' 화보 이미지를 생성하세요. ` +
        "사용자가 미리보기만 요청한 경우에는 생성하지 말고 프롬프트만 보여주세요.\n\n" +
        rendered.prompt,
    },
  ];

  let selectedReference = null;
  if (includeReference) {
    const references = await provider.listReferences(rendered.memberName);
    selectedReference = referenceName
      ? references.find((item) => item.name === referenceName)
      : defaultReference(references);
    if (selectedReference) {
      const image = await provider.loadReference(rendered.memberName, selectedReference.name);
      content.push({ type: "image", data: Buffer.from(image.data).toString("base64"), mimeType: image.mimeType });
    }
  }

  return {
    content,
    structuredContent: {
      ...rendered,
      referenceName: selectedReference?.name ?? null,
      nextAction: "Generate an image using the returned prompt and reference image unless the user requested preview only.",
    },
  };
}

export function createArteiaServer(provider) {
  const server = new McpServer(
    { name: "arteia", version: "0.1.0" },
    {
      instructions:
        "ARTEIA는 가상 성인 아이돌 캐릭터의 화보 프롬프트를 구성합니다. " +
        "이미지 생성을 요청받으면 현재 멤버를 확인하고, 저장 또는 직접 구성 컨셉을 렌더링한 뒤, " +
        "반환된 프롬프트와 레퍼런스 이미지를 사용해 ChatGPT 이미지 생성을 계속하세요. " +
        "사용자가 프롬프트 미리보기만 요청했다면 이미지를 생성하지 마세요.",
    }
  );

  server.tool("list_members", "ARTEIA 멤버 목록과 현재 멤버를 조회합니다.", {}, async () => {
    const library = await provider.loadLibrary();
    const members = library.enums["모델명 목록"] ?? Object.keys(library.members);
    return textResult(`멤버: ${members.join(", ")}`, { members, activeMember: await provider.getActiveMember() });
  });

  server.tool(
    "set_active_member",
    "이후 화보 생성에 사용할 현재 ARTEIA 멤버를 저장합니다.",
    { memberName: z.string().min(1).describe("설정할 멤버의 한국어 이름") },
    async ({ memberName }) => {
      const library = await provider.loadLibrary();
      if (!library.members[memberName]) throw new Error(`알 수 없는 멤버: ${memberName}`);
      await provider.setActiveMember(memberName);
      return textResult(`현재 멤버를 ${memberName}(으)로 설정했습니다.`, { activeMember: memberName });
    }
  );

  server.tool("get_active_member", "현재 저장된 ARTEIA 멤버를 조회합니다.", {}, async () => {
    const activeMember = await provider.getActiveMember();
    return textResult(activeMember ? `현재 멤버는 ${activeMember}입니다.` : "현재 멤버가 설정되지 않았습니다.", {
      activeMember,
    });
  });

  server.tool(
    "search_concepts",
    "이름과 상세 내용에서 저장된 화보 컨셉을 검색합니다.",
    {
      query: z.string().default("").describe("컨셉 이름 또는 상세 내용 검색어. 빈 문자열이면 전체에서 앞부분을 반환"),
      limit: z.number().int().min(1).max(50).default(20),
    },
    async ({ query, limit }) => {
      const { concepts } = await provider.loadLibrary();
      const needle = query.trim().toLocaleLowerCase("ko");
      const matches = Object.entries(concepts)
        .filter(([name, concept]) =>
          `${name}\n${Object.values(concept).join("\n")}`.toLocaleLowerCase("ko").includes(needle)
        )
        .slice(0, limit)
        .map(([name, concept]) => ({ name, concept }));
      return textResult(matches.length ? matches.map((item) => item.name).join("\n") : "일치하는 컨셉이 없습니다.", {
        query,
        matches,
      });
    }
  );

  server.tool(
    "get_concept",
    "저장된 화보 컨셉 하나의 전체 요소를 조회합니다.",
    { conceptName: z.string().min(1) },
    async ({ conceptName }) => {
      const { concepts } = await provider.loadLibrary();
      if (!concepts[conceptName]) throw new Error(`알 수 없는 컨셉: ${conceptName}`);
      return textResult(JSON.stringify(concepts[conceptName], null, 2), { conceptName, concept: concepts[conceptName] });
    }
  );

  server.tool(
    "list_options",
    "직접 컨셉을 구성할 때 사용할 감정, 거리감, 구도, 배경, 조명, 표정, 종횡비, 헤어 등의 옵션을 조회합니다.",
    { category: z.string().optional().describe("옵션 카테고리. 생략하면 카테고리 목록만 반환") },
    async ({ category }) => {
      const { options } = await provider.loadLibrary();
      if (!category) {
        const categories = Object.keys(options);
        return textResult(categories.join(", "), { categories });
      }
      if (options[category] === undefined) throw new Error(`알 수 없는 옵션 카테고리: ${category}`);
      return textResult(JSON.stringify(options[category], null, 2), { category, options: options[category] });
    }
  );

  server.tool("list_scripts", "사용할 수 있는 ARTEIA 프롬프트 스크립트 목록을 조회합니다.", {}, async () => {
    const scripts = await provider.listScripts();
    return textResult(scripts.join("\n"), { scripts });
  });

  server.tool(
    "compose_saved_concept",
    "현재 또는 지정 멤버와 저장된 컨셉을 조합해 최종 이미지 생성 프롬프트를 만듭니다. 이미지 요청이면 반환 결과로 바로 생성까지 이어가세요.",
    {
      conceptName: z.string().min(1),
      memberName: z.string().optional(),
      scriptName: z.string().default("gen_default.script.txt"),
      outfitName: z.string().optional(),
      includeReference: z.boolean().default(true),
      referenceName: z.string().optional(),
    },
    async ({ conceptName, memberName: requestedMember, scriptName, outfitName, includeReference, referenceName }) => {
      const library = await provider.loadLibrary();
      const memberName = await resolveMember(provider, library, requestedMember);
      const script = await provider.loadScript(scriptName);
      const rendered = buildPrompt({ library, script, memberName, conceptName, outfitName, scriptName });
      return promptToolResult(provider, rendered, includeReference, referenceName);
    }
  );

  server.tool(
    "compose_custom_concept",
    "선택하거나 직접 입력한 컨셉 요소로 최종 이미지 생성 프롬프트를 만듭니다. 값에 $조명.자연광$ 같은 옵션 토큰을 사용할 수 있습니다.",
    {
      memberName: z.string().optional(),
      scriptName: z.string().default("gen_default.script.txt"),
      outfitName: z.string().optional(),
      includeReference: z.boolean().default(true),
      referenceName: z.string().optional(),
      ...conceptFields,
    },
    async (args) => {
      const {
        memberName: requestedMember,
        scriptName,
        outfitName,
        includeReference,
        referenceName,
        ...customConcept
      } = args;
      const library = await provider.loadLibrary();
      const memberName = await resolveMember(provider, library, requestedMember);
      const script = await provider.loadScript(scriptName);
      const rendered = buildPrompt({
        library,
        script,
        memberName,
        customConcept: Object.fromEntries(Object.entries(customConcept).filter(([, value]) => value !== undefined)),
        outfitName,
        scriptName,
      });
      return promptToolResult(provider, rendered, includeReference, referenceName);
    }
  );

  server.tool(
    "list_reference_images",
    "현재 또는 지정 멤버의 캐릭터 동일성 유지용 레퍼런스 이미지 목록을 조회합니다.",
    { memberName: z.string().optional() },
    async ({ memberName: requestedMember }) => {
      const library = await provider.loadLibrary();
      const memberName = await resolveMember(provider, library, requestedMember);
      const references = await provider.listReferences(memberName);
      return textResult(references.map((item) => item.name).join("\n") || "레퍼런스 이미지가 없습니다.", {
        memberName,
        references,
      });
    }
  );

  server.tool(
    "get_reference_image",
    "현재 또는 지정 멤버의 레퍼런스 이미지 하나를 불러옵니다.",
    { memberName: z.string().optional(), referenceName: z.string().min(1) },
    async ({ memberName: requestedMember, referenceName }) => {
      const library = await provider.loadLibrary();
      const memberName = await resolveMember(provider, library, requestedMember);
      const image = await provider.loadReference(memberName, referenceName);
      return {
        content: [
          { type: "text", text: `${memberName}의 레퍼런스 이미지 '${image.name}'입니다.` },
          { type: "image", data: Buffer.from(image.data).toString("base64"), mimeType: image.mimeType },
        ],
        structuredContent: { memberName, referenceName: image.name },
      };
    }
  );

  return server;
}
