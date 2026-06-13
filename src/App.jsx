import React, { useState, useEffect } from "react";

import { compressImageToTarget } from "./utils/compressor.js";
import { PORTAL_PRESETS } from "./utils/portalPresets";

export default function App() {
  const PAYMENT_CONFIG = {
    upiId: import.meta.env.VITE_UPI_ID || "",
    payeeName: import.meta.env.VITE_PAYEE_NAME || "Developer",
  };
  // 1. Core File & Processing State
  const [selectedPortal, setSelectedPortal] = useState("ssc_photo");
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [compressedResult, setCompressedResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. Control Configuration State
  const [preset, setPreset] = useState("photo"); // 'photo' | 'signature' | 'custom'
  const [targetSize, setTargetSize] = useState(50); // Default 50KB for photo
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(230);

  // Sync settings when preset tabs change
  useEffect(() => {
    if (preset === "portal" && PORTAL_PRESETS[selectedPortal]) {
      const config = PORTAL_PRESETS[selectedPortal];
      setTargetSize(config.targetSizeKb);
      setWidth(config.width);
      setHeight(config.height);
    } else if (preset === "photo") {
      setTargetSize(50);
      setWidth(200);
      setHeight(230);
    } else if (preset === "signature") {
      setTargetSize(20);
      setWidth(140);
      setHeight(60);
    }
  }, [preset, selectedPortal]);

  // Trigger compression loop whenever constraints or file input changes
  useEffect(() => {
    if (!file) return;

    setLoading(true);
    compressImageToTarget(file, targetSize, width, height)
      .then((result) => {
        setCompressedResult(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Compression engine error:", err);
        setLoading(false);
      });
  }, [file, targetSize, width, height]);

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevents the browser from opening the image file in a new tab
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const validateAndSetFile = (selectedFile) => {
    setError(null); // Clear any previous errors

    if (!selectedFile) return;

    // Verify file format against allowed array
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError(
        "Unsupported format. Please upload a photo or signature in JPG, JPEG, PNG, or WebP format.",
      );
      setFile(null);
      setCompressedResult(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Indian Government Portal Image & Signature Resizer
        </h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
          Instantly compress and resize your passport photos and signatures to
          match the exact KB limits of SSC, UPSC, IBPS, and state portals.
        </p>
      </header>

      {/* Main Application Grid */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Control Configuration (4 Cols) */}
        <section className="md:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 h-fit">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              1. Select Optimization Target
            </h2>
            <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-lg mb-4">
              {["photo", "signature", "portal", "custom"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPreset(t)}
                  className={`py-1.5 text-[11px] capitalize font-medium rounded-md transition ${preset === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {t === "photo"
                    ? "Std Photo"
                    : t === "signature"
                      ? "Std Sign"
                      : t}
                </button>
              ))}
            </div>

            {/* Dynamic Exam Portal Selector Dropdown */}
            {preset === "portal" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-medium text-gray-600 block">
                  Target Exam / Portal
                </label>
                <select
                  value={selectedPortal}
                  onChange={(e) => setSelectedPortal(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                >
                  {Object.entries(PORTAL_PRESETS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-1">
                  💡 {PORTAL_PRESETS[selectedPortal]?.description}
                </p>
              </div>
            )}
          </div>
          {/* Size Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Max File Size Limit
              </label>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {targetSize} KB
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              aria-label="Target file size limit in Kilobytes"
              value={targetSize}
              onChange={(e) => {
                if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
              }}
              disabled={preset !== "custom"}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-60"
            />
            {preset !== "custom" && (
              <p className="text-[11px] text-gray-400 mt-1">
                Locked to standard portal configuration.
              </p>
            )}
          </div>

          {/* Dimension Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Max Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                disabled={preset !== "custom"}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                aria-label="Maximum output width in pixels"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Max Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                disabled={preset !== "custom"}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                aria-label="Maximum output height in pixels"
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Dropzone & Output Preview (8 Cols) */}
        <section className="md:col-span-8 space-y-6">
          {/* Dynamic Error Feedback Node */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-3 shadow-sm animate-fade-in mb-4">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>{error}</p>
            </div>
          )}
          {/* Dropzone Wrapper */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50/50 bg-white rounded-xl p-12 text-center transition flex flex-col items-center justify-center min-h-75 cursor-pointer"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-4 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm inline-block">
                Upload Original Image
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      validateAndSetFile(e.target.files[0]);
                  }}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2 pointer-events-none">
                or drag and drop your file directly here
              </p>
              <p className="text-xs text-gray-500 mt-2 pointer-events-none">
                Supports JPEG, JPG, PNG, or WebP formats
              </p>
            </div>
          ) : (
            /* Active Preview Workspace */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Input Meta info */}
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Original File
                  </span>
                  <p className="text-sm font-medium truncate max-w-50 mx-auto text-gray-700">
                    {file.name}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* Compressed Output Meta info */}
                <div className="bg-blue-50/50 p-4 rounded-lg text-center border border-blue-100">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                    Optimized Output
                  </span>
                  {loading ? (
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">
                        {compressedResult
                          ? `${compressedResult.dimensions.width} × ${compressedResult.dimensions.height} px`
                          : "--"}
                      </p>
                      <p className="text-xl font-black text-emerald-600 mt-1">
                        {compressedResult
                          ? `${compressedResult.sizeKb} KB`
                          : "--"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Visual Image Preview Panel */}
              <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg max-h-87.5 overflow-hidden border border-gray-200">
                {compressedResult?.url ? (
                  <img
                    src={compressedResult.url}
                    alt="Optimized preview"
                    className="max-h-75 object-contain shadow-sm border border-white"
                  />
                ) : (
                  <span className="text-sm text-gray-400">
                    Processing image...
                  </span>
                )}
              </div>

              {/* Action CTAs */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setFile(null);
                    setCompressedResult(null);
                  }}
                  className="w-1/3 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Clear File
                </button>
                <a
                  href={compressedResult?.url || "#"}
                  download={`optimized_${file.name.split(".")[0]}.jpg`}
                  onClick={(e) => {
                    if (!compressedResult) e.preventDefault();
                  }}
                  className={`w-2/3 py-2.5 text-center text-sm font-semibold rounded-lg text-white shadow-md block transition ${
                    !compressedResult
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  }`}
                >
                  Download Compressed Image
                </a>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Utility Footer info */}
      {/* Micro-Donation & Value Proposition Banner */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl p-6 md:p-8 text-white shadow-lg text-center md:text-left md:flex md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              Saved a trip to the internet cafe? ☕
            </h3>
            <p className="text-sm text-blue-100 max-w-2xl">
              This tool is completely free, private, and contains no intrusive
              pop-up ads. If it helped you finish your form submission on time,
              consider supporting the developer with a small contribution!
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0">
            {/* UPI Intent Gateway Option */}
            <a
              href={`upi://pay?pa=${PAYMENT_CONFIG.upiId}&pn=${encodeURIComponent(PAYMENT_CONFIG.payeeName)}&cu=INR`}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-6 py-3 rounded-lg shadow transition block w-full sm:w-auto text-center"
            >
              ⚡ Pay via UPI (₹20 / ₹50)
            </a>
          </div>
        </div>
      </section>

      {/* SEO Keyword & Structural Information Grid */}
      <section className="max-w-4xl mx-auto px-4 mt-16 border-t border-gray-200 pt-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Image Guidelines for Indian Government Portals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              How to compress a passport photo to under 50KB?
            </h3>
            <p>
              Select the "Passport Photo" preset tab above, upload your picture,
              and our tool automatically scales down the resolution to 200x230
              pixels and runs a local mathematical compression loop to bring the
              file size strictly under the 50KB limit required by SSC, UPSC, and
              state PSC portals.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              What are the standard signature dimensions for IBPS & SSC?
            </h3>
            <p>
              Most centralized recruitment systems enforce a signature dimension
              of 140x60 pixels with a strict binary size ceiling between 10KB
              and 20KB. Selecting our "Signature" preset dynamically locks these
              constraints for instant compliance.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              Is uploading my official documents to this site safe?
            </h3>
            <p>
              Absolutely. Security and data privacy are fully guaranteed. Your
              photos and signatures are processed entirely inside your local web
              browser canvas memory stream. No data is ever transmitted to
              external cloud servers or stored online.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              Why does my compressed photo look pixelated?
            </h3>
            <p>
              If the original photo resolution is extremely low or blurry,
              compression will emphasize artifacts. For crisp results, take a
              clear photo of your physical passport picture under good lighting
              before running the compressor.
            </p>
          </div>
        </div>
      </section>

      {/* Production System Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-gray-400 mt-12 border-t border-gray-100">
        <p>
          © 2026 resizer.yeshwanth.online • Built securely for automated
          document preparation.
        </p>
      </footer>
    </div>
  );
}
