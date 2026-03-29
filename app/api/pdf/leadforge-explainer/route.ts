import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { createElement } from "react";

import { LeadForgeExplainerDocument } from "@/components/pdf/leadforge-explainer-document";

export const runtime = "nodejs";

/**
 * Generates the LeadForge marketing PDF (dark-themed explainer).
 */
export async function GET() {
  const buffer = await renderToBuffer(createElement(LeadForgeExplainerDocument));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="LeadForge-Explainer.pdf"',
      "Cache-Control": "private, max-age=3600",
    },
  });
}
