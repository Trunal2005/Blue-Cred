"use client";

import { useEffect, useRef, useState } from "react";

interface Result {
  model_version: string;
  label: string;
  coverage_percent: number;
  area_hectares: number | null;
  overlay_png: string;
  mask_png: string;
  inference_ms: number;
  limitations: string;
}

export default function VegetationAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function analyze() {
    if (!file || controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setResult(null); setMessage("Checking local model readiness…");
    try {
      const health = await fetch('/api/analysis', { signal: abort.signal });
      const state = await health.json();
      if (!health.ok || !state.ready) throw new Error(state.error || "No trained model is ready. Start the local service with a validated checkpoint.");
      setMessage("Analyzing image locally…");
      const type = /\.tiff?$/i.test(file.name) ? 'image/tiff' : file.type;
      const response = await fetch('/api/analysis', { method: 'POST', body: file, headers: { 'content-type': type }, signal: abort.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Analysis failed.");
      setResult(data); setMessage("Analysis complete. Review the limitations below.");
    } catch (error) {
      if (!abort.signal.aborted) setMessage(error instanceof Error ? error.message : "Analysis unavailable.");
    } finally {
      controller.current = null; setBusy(false);
    }
  }

  return <section className="mt-8 p-6 rounded-2xl border border-mint bg-mint/10 space-y-4" aria-labelledby="analysis-title">
    <h3 id="analysis-title" className="text-xl font-bold text-dark">Coastal vegetation analysis</h3>
    <p className="text-sm text-gray-600">Optional local CNN estimate. Use imagery matching the trained model: Sentinel-2 GeoTIFF for the default configuration. Analysis stays in memory and does not change your project, certification or credits.</p>
    <label className="block text-sm font-bold" htmlFor="analysis-image">Image for local analysis (maximum 8 MiB)</label>
    <input id="analysis-image" type="file" accept=".tif,.tiff,image/png,image/jpeg" disabled={busy} onChange={event => {
      setResult(null); setMessage(""); const selected = event.target.files?.[0] || null;
      if (selected && selected.size > 8 * 1024 * 1024) { setFile(null); setMessage("Maximum input is 8 MiB."); }
      else setFile(selected);
    }} className="block w-full text-sm" />
    <button type="button" onClick={analyze} disabled={!file || busy} className="px-6 py-3 rounded-full bg-forest text-white font-bold disabled:opacity-50">{busy ? "Processing…" : "Analyze locally"}</button>
    <p role="status" aria-live="polite" className="text-sm text-gray-600">{message}</p>
    {result && <div className="space-y-4">
      <p className="font-bold">Predicted {result.label} coverage: {result.coverage_percent.toFixed(2)}%</p>
      <p className="text-sm">{result.area_hectares === null ? "Area unavailable: no supported metre-based georeferencing. Coverage percentage only." : `Estimated projected grid area: ${result.area_hectares.toFixed(3)} hectares.`}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <img src={`data:image/png;base64,${result.overlay_png}`} alt="Predicted vegetation overlay" className="w-full rounded-xl" />
        <img src={`data:image/png;base64,${result.mask_png}`} alt="Binary predicted vegetation mask" className="w-full rounded-xl" />
      </div>
      <p className="text-xs text-gray-600">Model: {result.model_version}. Local inference: {result.inference_ms.toFixed(0)} ms.</p>
      <p className="text-sm text-gray-600">{result.limitations}</p>
    </div>}
  </section>;
}
