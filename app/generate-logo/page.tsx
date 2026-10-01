"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import styles from "./LogoGenerator.module.css";

type LogoVariant = "full" | "icon";
type LogoBackground = "transparent" | "colored";

export default function LogoGenerator() {
  const [foregroundColor, setForegroundColor] = useState("#ff2020");
  const [backgroundColor, setBackgroundColor] = useState("#09090b");
  const [foregroundHex, setForegroundHex] = useState("#ff2020");
  const [backgroundHex, setBackgroundHex] = useState("#09090b");
  const [logoVariant, setLogoVariant] = useState<LogoVariant>("full");
  const [logoBackground, setLogoBackground] =
    useState<LogoBackground>("transparent");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Update hex input when color picker changes
  useEffect(() => {
    setForegroundHex(foregroundColor);
  }, [foregroundColor]);

  useEffect(() => {
    setBackgroundHex(backgroundColor);
  }, [backgroundColor]);

  // Update color picker when hex input changes
  const handleForegroundHexChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setForegroundHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setForegroundColor(value);
    }
  };

  const handleBackgroundHexChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setBackgroundHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setBackgroundColor(value);
    }
  };

  // Generate logo on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (logoBackground === "colored") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Load and draw the actual AICE logo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/logos/aice_logo.png";
    
    img.onload = () => {
      // Create a temporary canvas to manipulate the logo
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Recolor the logo
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      
      // Parse the foreground color
      const r = parseInt(foregroundColor.slice(1, 3), 16);
      const g = parseInt(foregroundColor.slice(3, 5), 16);
      const b = parseInt(foregroundColor.slice(5, 7), 16);

      // Replace all non-transparent pixels with the chosen color
      // Preserve luminosity for shadow effects
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // If pixel is not transparent
          // Calculate luminosity of original pixel (0-1)
          const originalLuminosity = (data[i] + data[i + 1] + data[i + 2]) / (255 * 3);
          
          // Apply color with luminosity preserved for shadows
          data[i] = r * originalLuminosity;     // Red
          data[i + 1] = g * originalLuminosity; // Green
          data[i + 2] = b * originalLuminosity; // Blue
          // Keep original alpha (data[i + 3])
        }
      }

      tempCtx.putImageData(imageData, 0, 0);

      if (logoVariant === "full") {
        // Full logo: icon (representing "A") + "ICE" text side by side
        const targetHeight = canvas.height * 0.28; 
        const logoWidth = (tempCanvas.width / tempCanvas.height) * targetHeight;
        
        // Iteratively find the correct font size to match target height
        let testSize = targetHeight;
        ctx.font = `bold ${testSize}px Arial, sans-serif`;
        let testMetrics = ctx.measureText("ICE");
        
        // Get actual rendered height of the text
        let textHeight = testMetrics.actualBoundingBoxAscent + testMetrics.actualBoundingBoxDescent;
        
        // Calculate the correct font size to match targetHeight
        const finalFontSize = (targetHeight / textHeight) * testSize;
        ctx.font = `bold ${finalFontSize}px Arial, sans-serif`;
        
        ctx.fillStyle = foregroundColor;
        ctx.textAlign = "left";
        
        // Get final measurements
        const finalMetrics = ctx.measureText("ICE");
        const textWidth = finalMetrics.width;
        const finalTextHeight = finalMetrics.actualBoundingBoxAscent + finalMetrics.actualBoundingBoxDescent;
        
        // Spacing
        const spacing = targetHeight * 0.15;
        
        // Calculate total width and center everything
        const totalWidth = logoWidth + spacing + textWidth;
        const startX = (canvas.width - totalWidth) / 2;
        
        // Center both logo and text vertically
        const logoY = (canvas.height - targetHeight) / 2;
        
        // Draw the colored logo icon
        ctx.drawImage(tempCanvas, startX, logoY, logoWidth, targetHeight);
        
        // Draw "ICE" text aligned with logo
        // Calculate Y position so text is vertically centered like logo
        ctx.textBaseline = "alphabetic";
        const textY = canvas.height / 2 + (finalMetrics.actualBoundingBoxAscent - finalTextHeight / 2);
        ctx.fillText("ICE", startX + logoWidth + spacing, textY);
      } else {
        // Icon only - just the logo mark centered
        const scale = Math.min(canvas.width / tempCanvas.width, canvas.height / tempCanvas.height) * 0.5;
        const scaledWidth = tempCanvas.width * scale;
        const scaledHeight = tempCanvas.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);
      }
    };
  }, [foregroundColor, backgroundColor, logoVariant, logoBackground]);

  const downloadLogo = (format: "png" | "svg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === "png") {
      const link = downloadLinkRef.current;
      if (!link) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `aice-logo-${logoVariant}-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } else {
      // SVG generation
      const svg = generateSVG();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = downloadLinkRef.current;
      if (!link) return;
      link.href = url;
      link.download = `aice-logo-${logoVariant}-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const generateSVG = (): string => {
    const width = 800;
    const height = 800;
    const bg =
      logoBackground === "colored"
        ? `<rect width="${width}" height="${height}" fill="${backgroundColor}"/>`
        : "";

    // Note: SVG export uses a simplified version. Use PNG for the actual logo with color changes.
    if (logoVariant === "full") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${bg}
  <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" 
        font-family="Kanit, sans-serif" font-size="180" font-weight="bold" 
        fill="${foregroundColor}">AICE</text>
  <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" 
        font-family="system-ui, sans-serif" font-size="32" 
        fill="${foregroundColor}">AI Innovation Community for Excellence</text>
  <text x="50%" y="95%" text-anchor="middle" 
        font-family="system-ui, sans-serif" font-size="16" 
        fill="${foregroundColor}" opacity="0.5">Note: Download PNG for actual logo with colors</text>
</svg>`;
    } else {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${bg}
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
        font-family="Kanit, sans-serif" font-size="280" font-weight="bold" 
        fill="${foregroundColor}">AICE</text>
  <text x="50%" y="95%" text-anchor="middle" 
        font-family="system-ui, sans-serif" font-size="16" 
        fill="${foregroundColor}" opacity="0.5">Note: Download PNG for actual logo with colors</text>
</svg>`;
    }
  };

  const presetColors = [
    { name: "AICE Red", color: "#ff2020" },
    { name: "Electric Blue", color: "#3b82f6" },
    { name: "Purple", color: "#a855f7" },
    { name: "Pink", color: "#ec4899" },
    { name: "White", color: "#ffffff" },
    { name: "Black", color: "#000000" },
  ];

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Logo Generator</h1>
          <p className={styles.subtitle}>
            Create custom AICE logos in any color combination
          </p>
        </div>

        <div className={styles.content}>
          {/* Controls Panel */}
          <div className={styles.controlsPanel}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Logo Type</h2>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.variantButton} ${
                    logoVariant === "full" ? styles.active : ""
                  }`}
                  onClick={() => setLogoVariant("full")}
                >
                  Full Logo
                </button>
                <button
                  className={`${styles.variantButton} ${
                    logoVariant === "icon" ? styles.active : ""
                  }`}
                  onClick={() => setLogoVariant("icon")}
                >
                  Icon Only
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Background</h2>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.variantButton} ${
                    logoBackground === "transparent" ? styles.active : ""
                  }`}
                  onClick={() => setLogoBackground("transparent")}
                >
                  Transparent
                </button>
                <button
                  className={`${styles.variantButton} ${
                    logoBackground === "colored" ? styles.active : ""
                  }`}
                  onClick={() => setLogoBackground("colored")}
                >
                  Colored
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Foreground Color</h2>
              <div className={styles.colorControl}>
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className={styles.colorPicker}
                />
                <input
                  type="text"
                  value={foregroundHex}
                  onChange={handleForegroundHexChange}
                  placeholder="#FFFFFF"
                  className={styles.hexInput}
                  maxLength={7}
                />
              </div>
              <div className={styles.presetColors}>
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    className={styles.presetColor}
                    style={{ backgroundColor: preset.color }}
                    onClick={() => setForegroundColor(preset.color)}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {logoBackground === "colored" && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Background Color</h2>
                <div className={styles.colorControl}>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={backgroundHex}
                    onChange={handleBackgroundHexChange}
                    placeholder="#000000"
                    className={styles.hexInput}
                    maxLength={7}
                  />
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Download</h2>
              <div className={styles.downloadButtons}>
                <button
                  className={styles.downloadButton}
                  onClick={() => downloadLogo("png")}
                >
                  <svg
                    className={styles.downloadIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PNG
                </button>
                <button
                  className={styles.downloadButton}
                  onClick={() => downloadLogo("svg")}
                >
                  <svg
                    className={styles.downloadIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download SVG
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={styles.previewPanel}>
            <div className={styles.previewContainer}>
              <div
                className={styles.preview}
                style={{
                  backgroundColor:
                    logoBackground === "transparent"
                      ? "#18181b"
                      : backgroundColor,
                }}
              >
                <canvas ref={canvasRef} className={styles.canvas} />
              </div>
              <p className={styles.previewLabel}>Preview</p>
            </div>
          </div>
        </div>

        {/* Hidden download link */}
        <a ref={downloadLinkRef} style={{ display: "none" }} />
      </div>

      <Footer />
    </main>
  );
}
