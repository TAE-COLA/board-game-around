# ARTEIA ChatGPT app

ARTEIA is exposed to ChatGPT as a stateless Streamable HTTP MCP server at `/mcp`. The server keeps code in this public repository while reading private member, concept, outfit, script, and reference-image data from Netlify Blobs in production.

## Local development

The server reads ARTEIA from the first available location:

1. `ARTEIA_DATA_DIR`
2. the sibling directory `../ARTEIA`
3. `./ARTEIA`

The currently selected member is saved to `.arteia-local/state.json`, which is ignored by Git.

```powershell
npm.cmd install --cache .npm-cache
npx.cmd netlify dev
```

The MCP endpoint is normally available at `http://localhost:8888/mcp`.

Run the prompt-engine tests with:

```powershell
npm.cmd run test:arteia
```

## Sync private data to Netlify Blobs

Create a Netlify personal access token and locate the site's Project ID. Set them only in the current terminal or a local ignored environment file.

```powershell
$env:ARTEIA_DATA_DIR = 'C:\Users\woo47\Documents\Development\ARTEIA'
$env:NETLIFY_SITE_ID = '<project-id>'
$env:NETLIFY_AUTH_TOKEN = '<personal-access-token>'
npm.cmd run arteia:sync
```

Reference images are intentionally opt-in because the current set is large:

```powershell
npm.cmd run arteia:sync -- --include-images
```

The sync command uploads data to the site-wide `arteia` Blob store. No ARTEIA JSON or image is copied into this Git repository.

## Protect the personal endpoint

Set a random `ARTEIA_MCP_TOKEN` in the Netlify site's Functions environment. When this variable is set, requests without the matching query token or Bearer token receive `401 Unauthorized`.

For a personal developer-mode app, register this exact URL in ChatGPT:

```text
https://<your-netlify-domain>/mcp?token=<ARTEIA_MCP_TOKEN>
```

This shared-token mode is intended for a single personal app. Replace it with the Apps SDK OAuth flow before sharing the app with other users.

## Connect from ChatGPT

1. Deploy the repository to its existing Netlify site.
2. Enable Developer mode in ChatGPT.
3. Open Settings > Plugins and create a developer-mode app.
4. Use `https://<your-netlify-domain>/mcp?token=<ARTEIA_MCP_TOKEN>` as the MCP server URL.
5. Start a new chat, add ARTEIA from the More tools menu, and set a current member.

Example requests:

- `현재 멤버를 도하나로 설정해줘.`
- `겨울이 들어간 컨셉을 찾아줘.`
- `도하나로 12월의 신부 화보를 생성해줘.`
- `몽환적인 눈빛, 자연광, 중거리 구도로 새 컨셉을 구성해서 생성해줘.`

## Exposed tools

- `list_members`, `set_active_member`, `get_active_member`
- `search_concepts`, `get_concept`, `list_options`, `list_scripts`
- `compose_saved_concept`, `compose_custom_concept`
- `list_reference_images`, `get_reference_image`

The compose tools return the final prompt and, by default, the member's `기본` reference image. ChatGPT should continue with its built-in image generation unless the user requested prompt preview only.
