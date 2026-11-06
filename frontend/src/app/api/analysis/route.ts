import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 8 * 1024 * 1024;

function allowed(request: NextRequest) {
  // Deliberately local development only. This endpoint never reads/writes project records.
  const host = request.headers.get("host") || "";
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
  const origin = request.headers.get("origin");
  if (origin && origin !== `http://${host}` && origin !== `https://${host}`) return false;
  return process.env.BLUECRED_ML_ENABLED === "true" && (process.env.BLUECRED_ML_TOKEN?.length || 0) >= 24;
}

async function proxy(request: NextRequest, analyze: boolean) {
  if (!allowed(request)) return NextResponse.json({ error: "Local image analysis is disabled or this origin is unsupported." }, { status: 503 });
  let body: Uint8Array | undefined;
  if (analyze) {
    if (!['image/png', 'image/jpeg', 'image/tiff'].includes(request.headers.get('content-type') || '')) {
      return NextResponse.json({ error: 'Use PNG, JPEG or GeoTIFF.' }, { status: 415 });
    }
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'Empty image.' }, { status: 400 });
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: 'Maximum input is 8 MiB.' }, { status: 413 });
      }
      chunks.push(value);
    }
    body = new Uint8Array(length); let offset = 0;
    chunks.forEach(chunk => { body!.set(chunk, offset); offset += chunk.length; });
  }
  try {
    const response = await fetch(`http://127.0.0.1:8765/${analyze ? 'analyze' : 'health'}`, {
      method: analyze ? 'POST' : 'GET',
      headers: { 'x-bluecred-token': process.env.BLUECRED_ML_TOKEN!, 'content-type': request.headers.get('content-type') || 'application/json' },
      body: body?.buffer as ArrayBuffer | undefined, cache: 'no-store', signal: AbortSignal.timeout(analyze ? 60000 : 5000), redirect: 'error',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Local analysis service is unavailable.' }, { status: 503 });
  }
}

export const GET = (request: NextRequest) => proxy(request, false);
export const POST = (request: NextRequest) => proxy(request, true);
