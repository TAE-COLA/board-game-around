import assert from "node:assert/strict";
import test from "node:test";
import { buildPrompt, findUnresolvedTokens, renderText } from "./render.mjs";

test("recursively resolves option and context tokens", () => {
  const options = { 감정: { 정체성: "%모델명%다운 눈빛" }, 조명: { 자연광: "부드러운 자연광" } };
  assert.equal(renderText("$감정.정체성$ / $조명.자연광$", { 모델명: "도하나" }, options), "도하나다운 눈빛 / 부드러운 자연광");
});

test("builds a saved-concept prompt with the existing token grammar", () => {
  const library = {
    members: { 도하나: { 모델명: "도하나", 메이크업: "로즈 메이크업", "헤어 컬러": "블랙과 레드" } },
    concepts: {
      "0기본0": { 배경: "흰 배경", 표정: "$감정.정체성$", 의상: "%기본 의상%", 메이크업: "%메이크업%" },
      "겨울 정원": { 배경: "눈 내리는 정원", 조명: "$조명.자연광$" },
    },
    options: { 감정: { 정체성: "%모델명%다운 눈빛" }, 조명: { 자연광: "부드러운 자연광" } },
    outfits: { OUTFIT_1: { overview: "화이트 드레스", parts: {} } },
    enums: { "모델 상세 키 목록": ["모델명", "헤어 컬러"], "컨셉 상세 키 목록": ["배경", "표정", "조명", "의상", "메이크업"] },
  };
  const result = buildPrompt({
    library,
    script: "MAIN: %모델명%\n%컨셉상세%",
    memberName: "도하나",
    conceptName: "겨울 정원",
  });
  assert.match(result.prompt, /MAIN: 도하나/);
  assert.match(result.prompt, /눈 내리는 정원/);
  assert.match(result.prompt, /도하나다운 눈빛/);
  assert.match(result.prompt, /부드러운 자연광/);
  assert.deepEqual(result.unresolvedTokens, []);
});

test("reports unresolved tokens", () => {
  assert.deepEqual(findUnresolvedTokens("%missing% and $unknown.value$"), ["$unknown.value$", "%missing%"]);
});
