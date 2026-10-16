// Task 8-a: genererer bilder til bryllupsdans-, dansekvelder-, tips-, gavekort- og skolesider
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT = '/home/z/my-project/public/images';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  'Warm editorial photograph, Norwegian dance studio with wooden floor and soft daylight, pastel colour palette (navy, sky blue, butter yellow, pink), joyful people, realistic, high quality, no text, no watermark';

const IMAGES = [
  ['bryllupsdans-hero', 'Bride and groom in wedding attire practicing their first dance in a dance studio, instructor guiding them, champagne warm light, celebratory mood', '1344x768'],
  ['dansekveld-hero', 'Lively social dance evening, diverse adults dancing partner dance in a decorated hall, string lights, people laughing and dancing in couples, festive atmosphere', '1344x768'],
  ['guide-priser', 'Friendly dance school reception desk with a clear price list on the wall, people signing up for a dance class, transparent pricing board', '1344x768'],
  ['guide-salsa-eller-bachata', 'Two couples dancing salsa and bachata side by side in a bright studio, latin dance energy, women in flowy dresses, men in casual shirts', '1344x768'],
  ['guide-alene', 'Young woman arriving alone and smiling at a partner dance class, instructor welcoming her, group of friendly students pairing up in background', '1344x768'],
  ['guide-brudevals-3t', 'Bride in white dress and groom in dark suit practicing waltz turn in a dance studio, wall clock showing evening time, focused and happy', '1344x768'],
  ['guide-barnedans-alder', 'Happy children age four to eight dancing in a circle in a dance studio, playful movement class, parents watching from the side', '1344x768'],
  ['guide-pakking', 'Open gym bag with dance shoes, water bottle and comfortable clothes laid out neatly on a wooden floor, packing for first dance class', '1344x768'],
  ['gavekort', 'Elegant gift card on a dance-themed greeting envelope lying on wooden dance floor, ribbon, celebration gift concept, navy blue and gold', '1344x768'],
  ['privaattime', 'Dance instructor giving a private lesson to a couple in an elegant empty studio with mirror wall, close personal coaching moment', '1344x768'],
  ['klasse-lindyhop', 'Swing dance class with many couples learning lindy hop, retro style clothing, dynamic swing-out moves, joyful energy', '1344x768'],
  ['socialdans', 'Social dance floor seen from above, many couples of all ages dancing foxtrot and gammeldans in a Norwegian community hall, warm light', '1344x768'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const zai = await ZAI.create();
  const manifestPath = path.join(OUT, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8') || '{}');

  for (const [name, subject, size] of IMAGES) {
    const outPath = path.join(OUT, `${name}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`SKIP ${name} (finnes)`);
      continue;
    }
    let ok = false;
    for (let attempt = 1; attempt <= 6 && !ok; attempt++) {
      try {
        const res = await zai.images.generations.create({
          prompt: `${subject}, ${STYLE}`,
          size,
        });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error('tomt svar');
        fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
        manifest[name] = `/images/${name}.png`;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`OK ${name} (forsøk ${attempt})`);
        ok = true;
      } catch (e) {
        const msg = String(e?.message || e);
        console.error(`ERR ${name} attempt ${attempt}: ${msg.slice(0, 160)}`);
        if (/429|Too many/i.test(msg)) {
          console.log('RATELIMIT pause 30s ...');
          await sleep(30_000);
        } else {
          await sleep(5_000);
        }
      }
    }
    await sleep(4_000);
  }
  console.log('FERDIG');
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
