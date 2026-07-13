const PERCENT_TOKEN = /%%([^%\n]+)%%|%([^%\n]+)%/g;
const OPTION_TOKEN = /\$\$([^$\n]+)\$\$|\$([^$\n]+)\$/g;

export function formatValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== "").join(", ");
  }
  if (typeof value === "object") return formatMapping(value);
  return String(value);
}

export function formatMapping(mapping, keyOrder = Object.keys(mapping ?? {})) {
  if (!mapping || typeof mapping !== "object") return "";
  return keyOrder
    .filter((key) => Object.prototype.hasOwnProperty.call(mapping, key))
    .map((key) => [key, formatValue(mapping[key])])
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

export function formatOutfit(outfitName, outfit) {
  if (!outfit) return "";
  const lines = [`${outfitName}: ${outfit.overview ?? outfit.name ?? ""}`.trim()];
  const parts = outfit.parts ?? {};

  for (const [partName, part] of Object.entries(parts)) {
    if (Array.isArray(part)) {
      if (part.length > 0) lines.push(`- ${partName}: ${part.join(", ")}`);
      continue;
    }
    if (!part || typeof part !== "object") {
      if (part) lines.push(`- ${partName}: ${part}`);
      continue;
    }
    const overview = part.overview ?? "";
    const details = Array.isArray(part.details) ? part.details.filter(Boolean) : [];
    if (overview || details.length > 0) {
      lines.push(`- ${partName}: ${[overview, details.join(", ")].filter(Boolean).join("; ")}`);
    }
  }

  if (Array.isArray(outfit.accessories) && outfit.accessories.length > 0) {
    lines.push(`- accessories: ${outfit.accessories.join(", ")}`);
  }
  return lines.join("\n");
}

export function resolveOptionToken(token, options) {
  if (!token.includes(".")) {
    return Object.prototype.hasOwnProperty.call(options, token)
      ? formatValue(options[token])
      : null;
  }
  const [category, ...rest] = token.split(".");
  const optionName = rest.join(".");
  const categoryValues = options[category];
  if (!categoryValues || typeof categoryValues !== "object") return null;
  return Object.prototype.hasOwnProperty.call(categoryValues, optionName)
    ? formatValue(categoryValues[optionName])
    : null;
}

export function renderText(text, context, options) {
  let rendered = String(text ?? "");
  for (let pass = 0; pass < 10; pass += 1) {
    const before = rendered;
    rendered = rendered.replace(OPTION_TOKEN, (match, doubled, single) => {
      const value = resolveOptionToken(String(doubled ?? single).trim(), options);
      return value === null ? match : value;
    });
    rendered = rendered.replace(PERCENT_TOKEN, (match, doubled, single) => {
      const token = String(doubled ?? single).trim();
      return context[token] === undefined || context[token] === null
        ? match
        : String(context[token]);
    });
    if (rendered === before) break;
  }
  return rendered;
}

export function findUnresolvedTokens(text) {
  const matches = String(text).match(/%%[^%\n]+%%|%[^%\n]+%|\$\$[^$\n]+\$\$|\$[^$\n]+\$/g);
  return [...new Set(matches ?? [])].sort();
}

export function buildPrompt({
  library,
  script,
  memberName,
  conceptName = "0기본0",
  customConcept,
  outfitName,
  scriptName = "gen_default.script.txt",
}) {
  const { concepts, enums, members, options, outfits } = library;
  const member = members[memberName];
  if (!member) throw new Error(`알 수 없는 멤버: ${memberName}`);

  const baseConcept = concepts["0기본0"] ?? {};
  const savedConcept = concepts[conceptName];
  if (!customConcept && !savedConcept) throw new Error(`알 수 없는 컨셉: ${conceptName}`);
  const concept = {
    ...baseConcept,
    ...(savedConcept ?? {}),
    ...(customConcept ?? {}),
  };

  const selectedOutfitName = outfitName ?? Object.keys(outfits)[0];
  const selectedOutfit = outfits[selectedOutfitName];
  if (!selectedOutfit) throw new Error(`알 수 없는 의상: ${selectedOutfitName}`);

  const modelKeyOrder = enums["모델 상세 키 목록"] ?? Object.keys(member);
  const conceptKeyOrder = enums["컨셉 상세 키 목록"] ?? Object.keys(concept);
  const context = {
    모델명: memberName,
    모델상세: formatMapping(member, modelKeyOrder),
    메이크업: member["메이크업"] ?? "",
    "기본 의상": formatOutfit(selectedOutfitName, selectedOutfit),
    주제: customConcept ? "직접 구성" : conceptName,
    ...member,
  };

  for (const key of conceptKeyOrder) {
    if (concept[key] !== undefined) {
      context[key] = renderText(formatValue(concept[key]), context, options);
    }
  }
  const rawConcept = formatMapping(concept, conceptKeyOrder);
  context["컨셉상세"] = renderText(rawConcept, context, options);

  const prompt = renderText(script, context, options);
  return {
    memberName,
    conceptName: customConcept ? "직접 구성" : conceptName,
    outfitName: selectedOutfitName,
    scriptName,
    concept: Object.fromEntries(
      Object.entries(concept).map(([key, value]) => [key, renderText(formatValue(value), context, options)])
    ),
    prompt,
    unresolvedTokens: findUnresolvedTokens(prompt),
  };
}
