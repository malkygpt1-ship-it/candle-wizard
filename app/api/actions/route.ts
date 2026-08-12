import { loadSnapshot, requestActor, runAction } from "../../../lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; payload?: Record<string, unknown> };
    if (!body.action || !body.payload) return Response.json({ error: "Action and payload are required." }, { status: 400 });
    const result = await runAction(body.action, body.payload, requestActor(request));
    const snapshot = await loadSnapshot();
    return Response.json({ result, snapshot }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The operation could not be completed.";
    const status = /not found|unavailable/i.test(message) ? 404 : /duplicate|already|only|exceeds|insufficient|must|required|cannot|below/i.test(message) ? 409 : 400;
    return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
