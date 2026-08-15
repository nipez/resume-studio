# ResumeTrakr remote MCP

Streamable HTTP MCP endpoint on the same Next.js app so an external agent can
run the apply loop without the UI.

## Endpoint

| Environment | URL |
| --- | --- |
| Production | `https://resumetrakr.com/api/mcp` |
| Local | `http://127.0.0.1:3000/api/mcp` |

Auth is a personal agent API key only (no OAuth). Send **either**:

```http
Authorization: Bearer <AGENT_API_KEY>
```

or (useful when a proxy strips `Authorization`):

```http
x-agent-api-key: <AGENT_API_KEY>
```

Configure on the server (Railway / `.env.local`):

- `AGENT_API_KEY` — long random secret (never log or commit)
- `AGENT_USER_ID` **or** `AGENT_USER_EMAIL` — the single user this key acts as

Prefer `AGENT_USER_ID` (UUID). Email lookup uses Auth Admin `listUsers`
pagination (no `getUserByEmail`); if the account is beyond the page cap the
API returns `agent_user_not_resolved`.

Auth failures return distinguishable `error_description` values (never the key):

| `error_description` | Meaning |
| --- | --- |
| `agent_key_not_configured` | `AGENT_API_KEY` env missing on the server |
| `No authorization provided` | No Bearer / `x-agent-api-key` on the request |
| `invalid_token` | Token present but does not match `AGENT_API_KEY` |
| `agent_user_not_resolved` | Key matched but user scope (`AGENT_USER_ID` / email) failed |

## Tools

Call in order for one job:

1. **`get_default_resume`** — default/master resume id + structured content
2. **`tailor_for_job`** — `job_url` **or** `title` / `company` / `description`; clones the default resume and runs the product **deep** tailor flow; returns tailored resume id + content
3. **`draft_cover_letter`** — `resume_version_id` (+ optional job fields); uses the product cover-letter route; returns cover letter id + body
4. **`export_and_track`** — exports print-ready resume/cover HTML to the `generated-pdfs` bucket (same builders as UI Print → PDF), logs one application with snapshot, returns signed `resume_pdf_url` / `cover_pdf_url` and `application_url`

Constraints match the product: never invent credentials, employers, or dates; one job → one tailored resume + one cover + one tracked application. Job URLs use the existing import-from-url path.

## Connect from Cursor

Cursor Settings → MCP → add a remote server, or put this in your MCP config:

```json
{
  "mcpServers": {
    "resumetrakr": {
      "url": "https://resumetrakr.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_AGENT_API_KEY",
        "x-agent-api-key": "YOUR_AGENT_API_KEY"
      }
    }
  }
}
```

Local:

```json
{
  "mcpServers": {
    "resumetrakr": {
      "url": "http://127.0.0.1:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_AGENT_API_KEY",
        "x-agent-api-key": "YOUR_AGENT_API_KEY"
      }
    }
  }
}
```

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect to Streamable HTTP at `https://resumetrakr.com/api/mcp` (or local) and set
`Authorization: Bearer <AGENT_API_KEY>` and/or `x-agent-api-key: <AGENT_API_KEY>`.
Then run `initialize` / list tools.

## curl smoke test

```bash
curl -sS -X POST https://resumetrakr.com/api/mcp \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.1"}}}'

# Fallback header (if Authorization is stripped):
curl -sS -X POST https://resumetrakr.com/api/mcp \
  -H "x-agent-api-key: $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.1"}}}'
```
