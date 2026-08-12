import { loadSnapshot } from "../../../lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await loadSnapshot();
    return Response.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the workspace.";
    return Response.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
