"""
FastAPI reverse-proxy for Next.js API routes.

This container's ingress sends /api/* to port 8001 (this FastAPI), and everything
else to port 3000 (Next.js). The Kalyanaya app is Next.js full-stack, so we proxy
/api/* back to the Next.js server on localhost:3000 where the catch-all
`/api/[[...path]]/route.js` handler lives.
"""
import os
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse

NEXT_INTERNAL_URL = os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000")

app = FastAPI()

# A single shared client (HTTP/1.1 keepalive, generous timeouts for image uploads)
client = httpx.AsyncClient(
    base_url=NEXT_INTERNAL_URL,
    timeout=httpx.Timeout(120.0, connect=10.0),
    follow_redirects=False,
)


@app.on_event("shutdown")
async def _shutdown():
    await client.aclose()


@app.get("/health")
async def health():
    return {"ok": True, "proxy": "next", "target": NEXT_INTERNAL_URL}


HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade", "content-encoding",
    "content-length", "host",
}


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_api(path: str, request: Request):
    url = f"/api/{path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"

    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}
    body = await request.body()

    try:
        upstream = await client.request(
            request.method, url, content=body, headers=headers,
        )
    except httpx.ConnectError:
        return Response("Upstream Next.js not reachable", status_code=502)

    resp_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in HOP_BY_HOP}
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
        media_type=upstream.headers.get("content-type"),
    )
