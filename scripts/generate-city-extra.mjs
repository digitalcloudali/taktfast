/* Genererer de to bybildene som mangler i hovedskriptet (mo-i-rana, arendal) */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT = path.resolve(process.cwd(), "public/images");
const STYLE =
  "Photorealistic, bright Scandinavian dance studio, natural Nordic daylight through large windows, warm and inviting atmosphere, diverse dancers of different ages and body types, modest clothing, joyful and inclusive mood, high quality, detailed photography. No logos, no brands, no text, no watermarks.";

const IMAGES = [
  { name: "by-mo-i-rana", size: "1024x1024", prompt: `Mo i Rana Norway town with fjord and mountains behind, clean nordic town center in summer daylight, ${STYLE}` },
  { name: "by-arendal", size: "1024x1024", prompt: `Arendal Norway southern Norway coastal town with white wooden houses and harbor in summer light, ${STYLE}` },
];

async function generateOne(zai: import("z-ai-web-dev-sdk").default, img: (typeof IMAGES)[number], attempt = 1): Promise<boolean> {
  const outPath = path.join(OUT, `${img.name}.png`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`SKIP ${img.name}`);
    return true;
  }
  try {
    const response = await zai.images.generations.create({ prompt: img.prompt, size: img.size });
    const b64 = response?.data?.[0]?.base64;
    if (!b64) throw new Error("empty response");
    const buf = Buffer.from(b64, "base64");
    if (buf.length < 10000) throw new Error("too small");
    fs.writeFileSync(outPath, buf);
    console.log(`OK ${img.name} (${buf.length} bytes)`);
    return true;
  } catch (e) {
    const msg = String(e?.message || e);
    console.error(`ERR ${img.name} attempt ${attempt}: ${msg}`);
    if (attempt < 8) {
      await new Promise((r) => setTimeout(r, msg.includes("429") ? 30000 : 5000));
      return generateOne(zai, img, attempt + 1);
    }
    return false;
  }
}

async function main() {
  const zai = await ZAI.create();
  for (const img of IMAGES) {
    await generateOne(zai, img);
  }
  console.log("DONE city-extra");
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
