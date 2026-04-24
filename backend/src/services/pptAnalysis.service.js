import AdmZip from "adm-zip";
import { parseStringPromise } from "xml2js";
import fs from "fs/promises";

/**
 * Extracts style and content from a .pptx file
 * @param {string} filePath - Path to the uploaded .pptx
 * @returns {Promise<Object>} - Extracted styles and slide content
 */
export const analyzePPTX = async (filePath) => {
    try {
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();

        let style = {
            colors: {},
            fonts: {},
            themeName: "Unknown"
        };
        let slides = [];

        // 1. Extract Theme Styles
        const themeEntry = zipEntries.find(e => e.entryName === "ppt/theme/theme1.xml");
        if (themeEntry) {
            const themeXml = themeEntry.getData().toString("utf8");
            const themeJson = await parseStringPromise(themeXml);
            
            style.themeName = themeJson["a:theme"]?.$?.name || "Corporate";
            
            // Extract Colors
            const clrScheme = themeJson["a:theme"]?.["a:themeElements"]?.[0]?.["a:clrScheme"]?.[0];
            if (clrScheme) {
                const mapColor = (node) => {
                    if (!node) return null;
                    if (node[0]?.["a:srgbClr"]) return node[0]["a:srgbClr"][0].$.val;
                    if (node[0]?.["a:sysClr"]) return node[0]["a:sysClr"][0].$.lastClr;
                    return null;
                };

                style.colors = {
                    dk1: mapColor(clrScheme["a:dk1"]),
                    lt1: mapColor(clrScheme["a:lt1"]),
                    accent1: mapColor(clrScheme["a:accent1"]),
                    accent2: mapColor(clrScheme["a:accent2"]),
                };
            }

            // Extract Fonts
            const fontScheme = themeJson["a:theme"]?.["a:themeElements"]?.[0]?.["a:fontScheme"]?.[0];
            if (fontScheme) {
                style.fonts = {
                    major: fontScheme["a:majorFont"]?.[0]?.["a:latin"]?.[0]?.$.typeface,
                    minor: fontScheme["a:minorFont"]?.[0]?.["a:latin"]?.[0]?.$.typeface,
                };
            }
        }

        // 2. Extract content (for Import feature)
        // Find all slide files: ppt/slides/slideN.xml
        const slideEntries = zipEntries
            .filter(e => e.entryName.startsWith("ppt/slides/slide") && e.entryName.endsWith(".xml"))
            .sort((a, b) => {
                const numA = parseInt(a.entryName.match(/\d+/)[0]);
                const numB = parseInt(b.entryName.match(/\d+/)[0]);
                return numA - numB;
            });

        for (const entry of slideEntries) {
            const slideXml = entry.getData().toString("utf8");
            const slideJson = await parseStringPromise(slideXml);
            
            const slideContent = {
                title: "",
                bullets: [],
                type: "content"
            };

            const spTree = slideJson["p:sld"]?.["p:cSld"]?.[0]?.["p:spTree"]?.[0];
            
            const extractFromNodes = (nodes) => {
                if (!nodes) return;
                const sps = nodes["p:sp"] || [];
                const grps = nodes["p:grpSp"] || [];
                const graphics = nodes["p:graphicFrame"] || [];

                sps.forEach(sp => {
                    const ph = sp["p:nvSpPr"]?.[0]?.["p:nvPr"]?.[0]?.["p:ph"]?.[0];
                    const phType = ph?.$.type;
                    if (phType === "sldNum" || phType === "ftr" || phType === "dt") return;

                    const txBody = sp["p:txBody"];
                    if (txBody) {
                        const paragraphs = txBody[0]["a:p"] || [];
                        const texts = paragraphs.map(p => {
                            const runs = p["a:r"] || [];
                            let pText = runs.map(r => r["a:t"]?.[0] || "").join("");
                            const flds = p["a:fld"] || [];
                            const fldText = flds.map(f => f["a:t"]?.[0] || "").join("");
                            return pText + fldText;
                        }).filter(t => {
                            const trimmed = t.trim();
                            // Filter out branding watermarks
                            if (trimmed.toLowerCase().includes("visiontext ai")) return false;
                            // Ignore purely numeric strings (likely slide numbers not caught by phType)
                            if (/^\d+$/.test(trimmed) && trimmed.length < 4) return false;
                            return trimmed.length > 0;
                        });

                        if (texts.length > 0) {
                            const isTitle = phType === "title" || phType === "ctrTitle" || phType === "subTitle";
                            if (isTitle && !slideContent.title) {
                                slideContent.title = texts.join(" ");
                            } else {
                                slideContent.bullets.push(...texts);
                            }
                        }
                    }
                });

                // Recursively handle group shapes
                grps.forEach(grp => extractFromNodes(grp));
                
                // Handle graphic frames (tables, charts) - basic text extraction
                graphics.forEach(gf => {
                    // This is complex for tables, but we can try to find 'a:t' nodes
                    const rawXml = JSON.stringify(gf);
                    const matches = rawXml.match(/"a:t":\["([^"]+)"\]/g);
                    if (matches) {
                        matches.forEach(m => {
                            const val = m.match(/"a:t":\["([^"]+)"\]/)[1];
                            if (val && val.trim().length > 1) slideContent.bullets.push(val.trim());
                        });
                    }
                });
            };

            extractFromNodes(spTree);

            // Fallback: If no title found but bullets exist, promote first bullet to title
            if (!slideContent.title && slideContent.bullets.length > 0) {
                slideContent.title = slideContent.bullets.shift();
            }

            if (slideContent.title || slideContent.bullets.length > 0) {
                if (!slideContent.title) slideContent.title = "Slide Content";
                slides.push(slideContent);
            }
        }

        return { style, slides };
    } catch (error) {
        console.error("PPTX Analysis error:", error);
        throw new Error("Failed to analyze PPTX structure: " + error.message);
    }
};
