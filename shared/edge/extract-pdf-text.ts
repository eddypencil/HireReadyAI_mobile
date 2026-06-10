import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore - pdfjs-dist works in Deno via npm compat
import * as pdfjsLib from "npm:pdfjs-dist@4.8.69";

try {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
} catch (e) {
  console.warn("Could not disable pdfjs worker:", e);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

function extractTextFromRawPdf(bytes: Uint8Array): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(bytes);

  const TJ_REGEX = /\[([^\]]*)\]\s*TJ/g;
  const Tj_REGEX = /\(([^)]*)\)\s*Tj/g;
  const textObjects: string[] = [];
  let match;

  while ((match = TJ_REGEX.exec(raw)) !== null) {
    const inner = match[1];
    const strMatches = inner.match(/\(([^)]*)\)/g);
    if (strMatches) {
      for (const s of strMatches) {
        textObjects.push(s.slice(1, -1));
      }
    }
  }

  if (textObjects.length === 0) {
    while ((match = Tj_REGEX.exec(raw)) !== null) {
      const t = match[1];
      if (t.trim().length > 2) {
        textObjects.push(t);
      }
    }
  }

  return textObjects.join(" ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { cvFileUrl } = await req.json();
    if (!cvFileUrl) {
      return new Response(
        JSON.stringify({ error: "cvFileUrl is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Downloading PDF from:", cvFileUrl);
    const fileResponse = await fetch(cvFileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download PDF: ${fileResponse.statusText}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    console.log("PDF size:", bytes.length, "bytes");

    let text = "";
    let pages = 0;

    try {
      const doc = await pdfjsLib.getDocument({ data: bytes, useSystemFonts: true }).promise;
      pages = doc.numPages;
      const pageTexts: string[] = [];
      for (let i = 1; i <= pages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        pageTexts.push(content.items.map((item: { str: string }) => item.str).join(" "));
      }
      text = pageTexts.join("\n");
      console.log("pdfjs-dist succeeded:", pages, "pages,", text.length, "chars");
    } catch (pdfErr) {
      const pdfMsg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
      console.error("pdfjs-dist failed:", pdfMsg, "- falling back to raw parser");
      text = extractTextFromRawPdf(bytes);
    }

    console.log("Extracted text length:", text.trim().length);
    console.log("Preview:", text.trim().slice(0, 400));

    return new Response(
      JSON.stringify({ text: text.trim(), numPages: pages }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PDF extraction failed:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
