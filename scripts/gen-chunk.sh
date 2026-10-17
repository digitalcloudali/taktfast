#!/bin/bash
# Generer bilder til tidsbudsjettet (sekunder) er brukt opp
BUDGET=${1:-480}
cd /home/z/my-project
START=$(date +%s)
declare -A IMG=(
  [stil-kizomba]="A couple dancing kizomba very close and slow, gentle embrace, warm evening studio light, photorealistic, no text"
  [stil-lindyhop]="Lindy hop swing dancers mid swing-out with joyful smiles, vintage casual clothes, old wooden dance hall, photorealistic, no text"
  [stil-wcs]="West coast swing couple dancing elegant slotted pattern, modern spacious studio, photorealistic, no text"
  [stil-tango]="Argentine tango couple in elegant dramatic pose, close embrace, warm light in classic dance hall, photorealistic, no text"
  [stil-foxtrot]="Mature elegant couple dancing foxtrot across parquet dance floor, classic ballroom posture, photorealistic, no text"
  [stil-brudevals]="Bride and groom practicing first wedding waltz, groom leading gently, bright studio with mirrors, photorealistic, no text"
  [stil-barnedans]="Happy children aged 5 to 9 in a childrens dance class, colorful t-shirts, skipping and dancing, bright studio, photorealistic, no text"
  [stil-hiphop]="Teenagers in streetdance hiphop class wearing casual streetwear, energetic freestyle pose, modern studio, photorealistic, no text"
  [stil-kpop]="Teen group practicing K-pop choreography in perfect sync, colorful casual outfits, mirrored studio, photorealistic, no text"
  [stil-ballett]="Children in classical ballet class at the barre, pink tights and ballet shoes, bright studio, photorealistic, no text"
  [stil-jazz]="Adults in jazz dance class mid-leap with expressive arms, modern studio with warm light, photorealistic, no text"
  [stil-moderne]="Contemporary modern dance class, dancers flowing in bare feet on wooden floor, expressive floor work, photorealistic, no text"
  [stil-linedance]="Line dance group in cowboy boots and jeans dancing in synchronized rows, barn-style hall, fun energy, photorealistic, no text"
  [stil-zumba]="Zumba fitness dance class, energetic adults in sportswear mid-move, big smiles, bright gym studio, photorealistic, no text"
  [stil-heels]="Adults in a heels dance class, confident strut choreography, studio with soft pink lighting, tasteful, photorealistic, no text"
  [stil-seniordans]="Seniors over 65 dancing gentle foxtrot together, smiling elderly couples, bright community hall, photorealistic, no text"
  [klasse-bachata]="Bachata group class, instructor demonstrating in front of row of adult students rotating partners, mirror wall, photorealistic, no text"
  [klasse-salsa]="Salsa beginners group class, several couples practicing basic step, instructor observing, bright studio, photorealistic, no text"
  [klasse-tango]="Argentine tango class, couples practicing walking in close embrace, wooden parquet floor, photorealistic, no text"
  [klasse-barn]="Childrens dance class sitting in circle with young female instructor, laughing together, colorful studio, photorealistic, no text"
  [klasse-hiphop]="Kids hiphop class, children around 10 years old practicing streetdance routine, clean modern studio, photorealistic, no text"
  [klasse-senior]="Senior dance class with gentle choreography, elderly participants holding hands in a circle, warm community hall, photorealistic, no text"
  [klasse-zumba]="Evening zumba class in full swing, instructor on small stage, participants following, bright sports hall, photorealistic, no text"
  [dansesko]="Still life of elegant latin dance shoes and sneakers on worn wooden dance floor, soft window light, photorealistic"
  [studio-interior-2]="Cozy smaller dance studio with warm pendant lights, parquet floor, chairs along the wall, evening mood, photorealistic, no text"
  [provetime]="First-time dance students nervously smiling at start of a trial class, instructor welcoming them, bright studio, photorealistic, no text"
  [oppvisning]="Dance instructors performing demonstration for applauding audience of students, studio event, warm light, photorealistic, no text"
  [by-oslo]="Oslo Norway cityscape with the Opera House and modern harbor buildings in soft daylight, people walking, photorealistic"
  [by-bergen]="Bergen Norway Bryggen wooden wharf colorful houses and harbor, Nordic grey-blue sky, photorealistic"
  [by-trondheim]="Trondheim Norway with Nidaros Cathedral and colorful old storehouses along river Nidelva, photorealistic"
  [by-stavanger]="Stavanger Norway old town Gamle Stavanger white wooden houses with cobblestone street, photorealistic"
  [by-kristiansand]="Kristiansand Norway Posebyen white wooden houses and sunny marina, southern Norway summer light, photorealistic"
  [by-tromso]="Tromso Norway arctic city with arctic cathedral bridge and snowy mountains, dramatic nordic light, photorealistic"
  [by-drammen]="Drammen Norway riverside with Ypsilon bridge and colorful buildings along Drammenselva river, photorealistic"
  [by-fredrikstad]="Fredrikstad Norway old town fortress wooden buildings by the river, charming Nordic light, photorealistic"
  [by-alesund]="Alesund Norway art nouveau town seen from Aksla viewpoint with islands and sea, photorealistic"
  [by-bodo]="Bodo Norway harbor town with mountains across the fjord, nordic summer evening light, photorealistic"
  [by-hamar]="Hamar Norway with glass cathedral ruins on Lake Mjosa shore, peaceful inland light, photorealistic"
  [by-lillehammer]="Lillehammer Norway charming main street with wooden houses and green hills, Nordic inland light, photorealistic"
  [by-tonsvberg]="Tonsberg Norway with old tower Slottsfjellet above wooden town and harbor, photorealistic"
  [by-sandefjord]="Sandefjord Norway harbor promenade with boats and white wooden architecture, soft coastal light, photorealistic"
  [by-lillestrom]="Lillestrom Norway small town street with old wooden houses and station area, autumn light, photorealistic"
  [by-sandnes]="Sandnes Norway modern town center by the Gandsfjord with Rogaland mountains, photorealistic"
  [by-berum]="Barum Norway leafy suburb street with red wooden houses and green trees, Oslo-area daylight, photorealistic"
  [by-asker]="Asker Norway suburban street with trees, wooden houses and gentle hills, west of Oslo, photorealistic"
  [og-image]="A happy diverse group of adult dancers mid-step in a bright Norwegian dance studio with big windows, wide cinematic composition, photorealistic, no text"
)
ORDER=(stil-kizomba stil-lindyhop stil-wcs stil-tango stil-foxtrot stil-brudevals stil-barnedans stil-hiphop stil-kpop stil-ballett stil-jazz stil-moderne stil-linedance stil-zumba stil-heels stil-seniordans klasse-bachata klasse-salsa klasse-tango klasse-barn klasse-hiphop klasse-senior klasse-zumba dansesko studio-interior-2 provetime oppvisning by-oslo by-bergen by-trondheim by-stavanger by-kristiansand by-tromso by-drammen by-fredrikstad by-alesund by-bodo by-hamar by-lillehammer by-tonsvberg by-sandefjord by-lillestrom by-sandnes by-berum by-asker og-image)
for name in "${ORDER[@]}"; do
  NOW=$(date +%s); ELAPSED=$((NOW-START))
  if [ $ELAPSED -gt $BUDGET ]; then echo "BUDGET_UP after ${ELAPSED}s"; break; fi
  f="public/images/$name.png"
  if [ -f "$f" ] && [ "$(stat -c%s "$f" 2>/dev/null || echo 0)" -gt 10000 ]; then continue; fi
  ok=0
  for attempt in 1 2; do
    timeout 90 z-ai image -p "${IMG[$name]}" -o "$f" -s 1152x864 > /dev/null 2>&1
    if [ -f "$f" ] && [ "$(stat -c%s "$f" 2>/dev/null || echo 0)" -gt 10000 ]; then echo "OK $name"; ok=1; break; fi
    sleep 8
  done
  [ $ok -eq 0 ] && echo "FAIL $name"
done
echo "COUNT $(ls public/images/*.png 2>/dev/null | wc -l)"
