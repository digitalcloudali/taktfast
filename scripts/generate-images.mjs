/* Taktfast batch image generation — run with: bun run scripts/generate-images.mjs */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT = path.resolve(process.cwd(), 'public/images');
fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  'Photorealistic, bright Scandinavian dance studio, natural Nordic daylight through large windows, warm and inviting atmosphere, diverse dancers of different ages and body types, modest clothing, joyful and inclusive mood, high quality, detailed photography. No logos, no brands, no text, no watermarks.';

const H = '1344x768';
const C = '1152x864'; // 4:3-ish cards
const S = '1024x1024'; // square tiles

const IMAGES = [
  // --- Hero + key feature images ---
  { name: 'hero-salsa-couple', size: H, prompt: `A joyful adult couple dancing salsa together in a light dance studio with floor-to-ceiling windows, wooden floor, soft morning Nordic daylight, ${STYLE}` },
  { name: 'bryllupsdans-hero', size: H, prompt: `A bride in simple white dress and groom in shirt practicing their wedding waltz together in a bright dance studio with mirrors, tender romantic moment, soft Nordic daylight, ${STYLE}` },
  { name: 'for-skoler-instructor', size: C, prompt: `A friendly professional dance instructor smiling and teaching a small adult class, arms open welcoming gesture, bright studio with mirror wall, ${STYLE}` },
  { name: 'dansekveld-hero', size: H, prompt: `A cozy social dance night in a wooden community hall decorated with warm string lights, many adults of all ages social dancing salsa and swing, festive but relaxed, evening, ${STYLE}` },
  { name: 'gavekort', size: H, prompt: `Elegant dance gift card concept: ballet shoes and music notes beside a navy blue envelope on a light wooden table, soft studio light, clean minimal composition, ${STYLE}` },
  { name: 'og-image', size: H, prompt: `A happy diverse group of adult dancers mid-step in a bright Norwegian dance studio with big windows, wide cinematic composition with space on the left for text, ${STYLE}` },

  // --- Dance families / styles ---
  { name: 'stil-salsa', size: C, prompt: `Adult salsa couple in closed hold mid-turn, woman in red dress, man in dark shirt, bright studio with mirror wall, ${STYLE}` },
  { name: 'stil-bachata', size: C, prompt: `Young adult couple dancing bachata close and smooth, relaxed hip movement, modern studio with large mirrors, ${STYLE}` },
  { name: 'stil-kizomba', size: C, prompt: `A couple dancing kizomba very close and slow, gentle embrace, warm evening studio light, ${STYLE}` },
  { name: 'stil-lindyhop', size: C, prompt: `Lindy hop swing dancers mid-swing-out with joyful smiles, vintage-inspired casual clothes, old wooden dance hall, ${STYLE}` },
  { name: 'stil-wcs', size: C, prompt: `West coast swing couple dancing in elegant slotted pattern, modern spacious studio, smooth motion, ${STYLE}` },
  { name: 'stil-tango', size: C, prompt: `Argentine tango couple in elegant dramatic pose, close embrace, moody warm light in a classic dance hall, ${STYLE}` },
  { name: 'stil-foxtrot', size: C, prompt: `Mature elegant couple dancing foxtrot across a parquet dance floor, classic ballroom posture, soft daylight, ${STYLE}` },
  { name: 'stil-brudevals', size: C, prompt: `Bride and groom practicing their first wedding waltz, groom leading gently, bright studio with mirrors, ${STYLE}` },
  { name: 'stil-barnedans', size: C, prompt: `Happy children aged 5 to 9 in a childrens dance class, colorful leotards and t-shirts, skipping and dancing, bright studio, ${STYLE}` },
  { name: 'stil-hiphop', size: C, prompt: `Teenagers in a streetdance hiphop class in casual streetwear, energetic freestyle pose in a modern studio, ${STYLE}` },
  { name: 'stil-kpop', size: C, prompt: `Teen group practicing K-pop choreography in perfect sync, colorful casual outfits, mirrored studio, ${STYLE}` },
  { name: 'stil-ballett', size: C, prompt: `Children in a classical ballet class at the barre, pink tights and ballet shoes, disciplined and graceful, bright studio, ${STYLE}` },
  { name: 'stil-jazz', size: C, prompt: `Adults in a jazz dance class mid-leap with expressive arms, modern studio with warm light, ${STYLE}` },
  { name: 'stil-moderne', size: C, prompt: `Contemporary modern dance class, dancers flowing in bare feet on a wooden floor, expressive floor work, ${STYLE}` },
  { name: 'stil-linedance', size: C, prompt: `Line dance group in cowboy boots and jeans dancing in synchronized rows, barn-style hall, fun energy, ${STYLE}` },
  { name: 'stil-zumba', size: C, prompt: `Zumba fitness dance class, energetic adults in sportswear mid-move, big smiles, bright gym studio, ${STYLE}` },
  { name: 'stil-heels', size: C, prompt: `Adults in a heels dance class, confident strut choreography, studio with soft pink lighting, tasteful and empowering, ${STYLE}` },
  { name: 'stil-seniordans', size: C, prompt: `Seniors over 65 dancing a gentle foxtrot together, smiling elderly couples, bright community hall, ${STYLE}` },

  // --- Class / scene photos for schools and courses ---
  { name: 'klasse-bachata', size: C, prompt: `A bachata group class where the instructor demonstrates in front of a row of adult students rotating partners, mirror wall, ${STYLE}` },
  { name: 'klasse-salsa', size: C, prompt: `Salsa beginners group class, several couples practicing basic step, instructor observing, bright studio, ${STYLE}` },
  { name: 'klasse-lindyhop', size: C, prompt: `Swing lindy hop class in an old wooden hall with tall windows, couples swinging out, teacher with microphone, ${STYLE}` },
  { name: 'klasse-tango', size: C, prompt: `Argentine tango class, couples practicing walking in close embrace, wooden parquet floor, elegant calm, ${STYLE}` },
  { name: 'klasse-barn', size: C, prompt: `Childrens dance class sitting in a circle with the young female instructor, laughing together, colorful studio, ${STYLE}` },
  { name: 'klasse-hiphop', size: C, prompt: `Kids hiphop class, children around 10 years old practicing a streetdance routine, clean modern urban studio, ${STYLE}` },
  { name: 'klasse-senior', size: C, prompt: `Senior dance class with gentle choreography, elderly participants holding hands in a circle, warm community hall, ${STYLE}` },
  { name: 'klasse-zumba', size: C, prompt: `Evening zumba class in full swing, instructor on a small stage, participants following, bright sports hall, ${STYLE}` },
  { name: 'dansesko', size: S, prompt: `Still life of elegant latin dance shoes and a pair of sneakers on a worn wooden dance floor, soft window light, shallow depth of field, ${STYLE}` },
  { name: 'studio-interior', size: C, prompt: `Empty beautiful dance studio with mirror wall, barre, wooden floor and large windows showing Norwegian greenery, ${STYLE}` },
  { name: 'studio-interior-2', size: C, prompt: `Cozy smaller dance studio with warm pendant lights, parquet floor, chairs along the wall, evening mood, ${STYLE}` },
  { name: 'privaattime', size: C, prompt: `Instructor giving a private lesson to a wedding couple, holding their posture, studio with mirrors, attentive teaching moment, ${STYLE}` },
  { name: 'provetime', size: C, prompt: `First-time dance students nervously smiling at the start of a trial class, instructor welcoming them, bright studio, ${STYLE}` },
  { name: 'socialdans', size: C, prompt: `Social dancing during a dance night, mixed ages dancing bachata and swing, warm string lights, community hall, ${STYLE}` },
  { name: 'oppvisning', size: C, prompt: `Dance instructors performing a demonstration for an applauding audience of students, studio event, warm light, ${STYLE}` },

  // --- City tiles ---
  { name: 'by-oslo', size: S, prompt: `Oslo Norway cityscape with the Opera House and modern harbor buildings in soft daylight, people walking, ${STYLE}` },
  { name: 'by-bergen', size: S, prompt: `Bergen Norway Bryggen wooden wharf colorful houses and harbor, typical Nordic grey-blue sky, ${STYLE}` },
  { name: 'by-trondheim', size: S, prompt: `Trondheim Norway with Nidaros Cathedral and colorful old storehouses along the river Nidelva, ${STYLE}` },
  { name: 'by-stavanger', size: S, prompt: `Stavanger Norway old town Gamle Stavanger white wooden houses with cobblestone street, ${STYLE}` },
  { name: 'by-kristiansand', size: S, prompt: `Kristiansand Norway Posebyen white wooden houses and sunny marina, southern Norway summer light, ${STYLE}` },
  { name: 'by-tromso', size: S, prompt: `Tromso Norway arctic city with the arctic cathedral bridge and snowy mountains, dramatic nordic light, ${STYLE}` },
  { name: 'by-drammen', size: S, prompt: `Drammen Norway riverside with Ypsilon bridge and colorful buildings along the Drammenselva river, ${STYLE}` },
  { name: 'by-fredrikstad', size: S, prompt: `Fredrikstad Norway old town fortress wooden buildings by the river, charming Nordic light, ${STYLE}` },
  { name: 'by-alesund', size: S, prompt: `Alesund Norway art nouveau town seen from Aksla viewpoint with islands and sea, ${STYLE}` },
  { name: 'by-bodo', size: S, prompt: `Bodo Norway harbor town with mountains across the fjord, nordic summer evening light, ${STYLE}` },
  { name: 'by-hamar', size: S, prompt: `Hamar Norway with the glass cathedral ruins on Lake Mjosa shore, peaceful inland light, ${STYLE}` },
  { name: 'by-lillehammer', size: S, prompt: `Lillehammer Norway charming main street with wooden houses and green hills, Nordic inland light, ${STYLE}` },
  { name: 'by-tonsvberg', size: S, prompt: `Tonsberg Norway with the old tower Slottsfjellet above wooden town and harbor, ${STYLE}` },
  { name: 'by-sandefjord', size: S, prompt: `Sandefjord Norway harbor promenade with boats and white wooden architecture, soft coastal light, ${STYLE}` },
  { name: 'by-lillestrom', size: S, prompt: `Lillestrom Norway small town street with old wooden houses and station area, autumn light, ${STYLE}` },
  { name: 'by-sandnes', size: S, prompt: `Sandnes Norway modern town center by the Gandsfjord with Rogaland mountains, ${STYLE}` },
  { name: 'by-berum', size: S, prompt: `Barum Norway leafy suburb street with red wooden houses and green trees, Oslo-area daylight, ${STYLE}` },
  { name: 'by-asker', size: S, prompt: `Asker Norway suburban street with trees, wooden houses and gentle hills, west of Oslo, ${STYLE}` },

  // --- Guide covers (tips og råd) ---
  { name: 'guide-priser', size: C, prompt: `Concept photo for a guide about dance course prices: notebook with pen and dance shoes on a studio bench, minimal clean, ${STYLE}` },
  { name: 'guide-salsa-eller-bachata', size: C, prompt: `Two couples side by side, one dancing salsa with energy and one dancing bachata smooth, split composition in one studio, ${STYLE}` },
  { name: 'guide-alene', size: C, prompt: `A single woman arriving alone and confident at a dance class, instructor greeting her, bright studio door, ${STYLE}` },
  { name: 'guide-brudevals-3t', size: C, prompt: `Wedding couple practicing waltz turns, instructor with stopwatch smiling, checklist vibe, bright studio, ${STYLE}` },
  { name: 'guide-barnedans-alder', size: C, prompt: `Toddler with parent dancing playfully together in a childrens dance studio, very young child around 4, ${STYLE}` },
  { name: 'guide-pakking', size: C, prompt: `Flat lay of what to wear to dance class: comfortable clothes, dance shoes, water bottle, small towel on a wooden bench, ${STYLE}` },
];

const manifestPath = path.join(OUT, 'manifest.json');
let manifest = {};
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')); } catch { manifest = {}; }
}

async function generateOne(zai, img, attempt = 1) {
  const outPath = path.join(OUT, `${img.name}.png`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`SKIP ${img.name}`);
    return true;
  }
  try {
    const response = await zai.images.generations.create({ prompt: img.prompt, size: img.size });
    const b64 = response?.data?.[0]?.base64;
    if (!b64) throw new Error('empty response');
    const buf = Buffer.from(b64, 'base64');
    if (buf.length < 10000) throw new Error('too small');
    fs.writeFileSync(outPath, buf);
    manifest[img.name] = `/images/${img.name}.png`;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`OK ${img.name} (${buf.length} bytes)`);
    return true;
  } catch (e) {
    const msg = String(e?.message || e);
    console.error(`ERR ${img.name} attempt ${attempt}: ${msg}`);
    const is429 = msg.includes('429') || msg.includes('Too many');
    if (is429) {
      // global pause ved rate-limit
      console.log(`RATELIMIT pause 30s (global) ...`);
      await new Promise(r => setTimeout(r, 30000));
    }
    const maxAttempts = 8;
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, (is429 ? 15000 : 4000) * Math.min(attempt, 4)));
      return generateOne(zai, img, attempt + 1);
    }
    return false;
  }
}

async function main() {
  const zai = await ZAI.create();
  const queue = IMAGES.filter(i => !(fs.existsSync(path.join(OUT, `${i.name}.png`)) && fs.statSync(path.join(OUT, `${i.name}.png`)).size > 10000));
  console.log(`Generating ${queue.length} of ${IMAGES.length} images...`);
  let done = 0, failed = [];
  const CONC = 1;
  const workers = Array.from({ length: CONC }, async () => {
    while (queue.length) {
      const img = queue.shift();
      if (!img) break;
      const ok = await generateOne(zai, img);
      done++;
      console.log(`PROGRESS ${done}/${IMAGES.length}`);
      if (!ok) failed.push(img.name);
      await new Promise(r => setTimeout(r, 3000));
    }
  });
  await Promise.all(workers);
  console.log(`DONE ok=${done - failed.length} failed=${failed.length} ${failed.join(',')}`);
  fs.writeFileSync(path.join(OUT, 'gen-status.json'), JSON.stringify({ total: IMAGES.length, failed }, null, 2));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
