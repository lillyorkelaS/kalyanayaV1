#!/usr/bin/env bash
# Seeds demo weddings for every template (idempotent: skips if slug exists)
set -e
API="http://localhost:8001/api"
TOKEN=$(curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@kalyanaya.com","password":"KalyanayaAdmin@2026"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
echo "Got token (len=${#TOKEN})"

create_or_update() {
  local slug="$1"; local body="$2"
  # Check if exists
  local existing_id=$(curl -s -H "Authorization: Bearer $TOKEN" $API/weddings | python3 -c "
import sys, json
try:
    ws = json.load(sys.stdin).get('weddings', [])
    print(next((w['id'] for w in ws if w['slug']=='$slug'), ''))
except Exception:
    print('')
")
  if [ -n "$existing_id" ]; then
    echo "  ↻ updating $slug ($existing_id)"
    curl -s -X PUT "$API/weddings/$existing_id" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$body" > /dev/null
  else
    echo "  + creating $slug"
    curl -s -X POST "$API/weddings" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$body" > /dev/null
  fi
}

# --- Moonveil — Minimal Modern ---
create_or_update "preview-moonveil" '{
  "brideName":"Anaya","groomName":"Vihaan","tagline":"Built side by side, sketch by sketch",
  "weddingDate":"2026-12-12T17:00:00.000+05:30","slug":"preview-moonveil","template":"Moonveil","status":"published","isDemo":true,
  "story":"We met arguing about a building. Anaya thought the museum needed more glass; Vihaan thought it needed more silence. Three years and one shared studio later, we are still arguing — and still building — together.",
  "heroImage":{"url":"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80","publicId":"demo-mv"},
  "gallery":[
    {"url":"https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80","publicId":"g1"},
    {"url":"https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80","publicId":"g2"},
    {"url":"https://images.pexels.com/photos/1488315/pexels-photo-1488315.jpeg?auto=compress&w=900","publicId":"g3"},
    {"url":"https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&w=900","publicId":"g4"},
    {"url":"https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80","publicId":"g5"}
  ],
  "events":[
    {"name":"Cocktail Hour","date":"2026-12-11","startTime":"7:00 PM","endTime":"10:00 PM","venue":"The Leela Sky Bar","address":"Bengaluru","description":"An intimate evening with cocktails and conversation."},
    {"name":"The Ceremony","date":"2026-12-12","startTime":"5:00 PM","endTime":"7:00 PM","venue":"The Leela Palace Lawns","address":"Bengaluru","description":"A modern, minimal ceremony amongst close family."},
    {"name":"Reception","date":"2026-12-12","startTime":"8:00 PM","endTime":"12:00 AM","venue":"The Leela Ballroom","address":"Bengaluru","description":"Dinner, dancing and the after-party."}
  ]
}'

# --- Royal Heritage — Mughal Ornate ---
create_or_update "preview-royal-heritage" '{
  "brideName":"Aditi","groomName":"Aarav","tagline":"A union of two royal houses",
  "weddingDate":"2026-11-28T19:00:00.000+05:30","slug":"preview-royal-heritage","template":"Royal Heritage","status":"published","isDemo":true,
  "story":"In the marble halls of Rambagh, where our grandfathers once played as boys, we now begin our own story. A union not just of two souls, but of two histories, two kingdoms of memory, and a future yet to be written.",
  "heroImage":{"url":"https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=80","publicId":"demo-rh"},
  "gallery":[
    {"url":"https://images.unsplash.com/photo-1604608672516-f1b9b1d1ce4f?w=900&q=80","publicId":"r1"},
    {"url":"https://images.unsplash.com/photo-1610022093030-1c4915354b22?w=900&q=80","publicId":"r2"},
    {"url":"https://images.unsplash.com/photo-1584242353192-7a1df2e855d8?w=900&q=80","publicId":"r3"},
    {"url":"https://images.unsplash.com/photo-1769500804089-b91e952710a4?w=900&q=80","publicId":"r4"},
    {"url":"https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80","publicId":"r5"},
    {"url":"https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80","publicId":"r6"}
  ],
  "events":[
    {"name":"Mehendi","date":"2026-11-26","startTime":"4:00 PM","endTime":"9:00 PM","venue":"Rambagh Gardens","address":"Jaipur, Rajasthan","description":"Henna, music and sweets in the palace gardens."},
    {"name":"Sangeet","date":"2026-11-27","startTime":"7:00 PM","endTime":"12:00 AM","venue":"Rambagh Durbar Hall","address":"Jaipur","description":"An evening of dance, song and laughter."},
    {"name":"Vivah","date":"2026-11-28","startTime":"7:00 PM","endTime":"11:00 PM","venue":"Rambagh Palace","address":"Jaipur","description":"The sacred Vedic wedding ceremony."},
    {"name":"Reception","date":"2026-11-29","startTime":"7:30 PM","endTime":"12:00 AM","venue":"Suvarna Mahal","address":"Rambagh Palace, Jaipur","description":"A royal feast befitting the occasion."}
  ]
}'

# --- Eternal Edit — Cinematic Bold ---
create_or_update "preview-eternal-edit" '{
  "brideName":"Maya","groomName":"Rohan","tagline":"The directors edition",
  "weddingDate":"2026-09-19T19:30:00.000+05:30","slug":"preview-eternal-edit","template":"Eternal Edit","status":"published","isDemo":true,
  "story":"Maya was the cinematographer. Rohan was the writer. They argued over every frame for three years, and somewhere between the cuts, fell quietly in love. This wedding, like every great film, has been worth every take.",
  "heroImage":{"url":"https://images.pexels.com/photos/29497172/pexels-photo-29497172.jpeg?auto=compress&w=1600","publicId":"demo-ee"},
  "gallery":[
    {"url":"https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&w=900","publicId":"e1"},
    {"url":"https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&w=900","publicId":"e2"},
    {"url":"https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80","publicId":"e3"},
    {"url":"https://images.pexels.com/photos/1444444/pexels-photo-1444444.jpeg?auto=compress&w=900","publicId":"e4"},
    {"url":"https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80","publicId":"e5"},
    {"url":"https://images.pexels.com/photos/2253842/pexels-photo-2253842.jpeg?auto=compress&w=900","publicId":"e6"}
  ],
  "events":[
    {"name":"Film Screening","date":"2026-09-18","startTime":"8:00 PM","endTime":"11:00 PM","venue":"Soho House Mumbai","address":"Juhu, Mumbai","description":"A private screening of our story, made by us, with all the people we love."},
    {"name":"The Ceremony","date":"2026-09-19","startTime":"7:30 PM","endTime":"9:00 PM","venue":"The Asiatic Society Steps","address":"Mumbai","description":"A short, sharp, deeply personal ceremony — letterboxed and lit just so."},
    {"name":"Afterparty","date":"2026-09-19","startTime":"10:00 PM","endTime":"3:00 AM","venue":"Bombay Canteen","address":"Lower Parel, Mumbai","description":"Cocktails, vinyl, and a long, lazy roll of credits."}
  ]
}'

# --- Crimson Lotus — Floral Romantic ---
create_or_update "preview-crimson-lotus" '{
  "brideName":"Aanya","groomName":"Vivaan","tagline":"Two flowers, one garden",
  "weddingDate":"2026-08-22T18:00:00.000+05:30","slug":"preview-crimson-lotus","template":"Crimson Lotus","status":"published","isDemo":true,
  "story":"It started in a flower market in Bandra — Aanya was buying peonies for her mother, Vivaan was utterly lost. He asked for directions. She gave him a peony instead. Three monsoons later, here we are.",
  "heroImage":{"url":"https://images.unsplash.com/photo-1708077809012-4740dd43bd53?w=1600&q=80","publicId":"demo-cl"},
  "gallery":[
    {"url":"https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&w=900","publicId":"c1"},
    {"url":"https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80","publicId":"c2"},
    {"url":"https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&w=900","publicId":"c3"},
    {"url":"https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&w=900","publicId":"c4"},
    {"url":"https://images.unsplash.com/photo-1769500804089-b91e952710a4?w=900&q=80","publicId":"c5"},
    {"url":"https://images.unsplash.com/photo-1610022093030-1c4915354b22?w=900&q=80","publicId":"c6"}
  ],
  "events":[
    {"name":"Haldi","date":"2026-08-20","startTime":"11:00 AM","endTime":"3:00 PM","venue":"The Aanya Residence","address":"Bandra, Mumbai","description":"Turmeric, marigolds and laughter under the morning sun."},
    {"name":"Sangeet","date":"2026-08-21","startTime":"7:00 PM","endTime":"12:00 AM","venue":"Taj Lands End","address":"Mumbai","description":"An evening of dance, song and a few unscripted speeches."},
    {"name":"Wedding Pheras","date":"2026-08-22","startTime":"6:00 PM","endTime":"9:00 PM","venue":"W Goa Lawns","address":"Vagator, Goa","description":"Seven steps around the sacred fire, the sea, and the setting sun."},
    {"name":"Reception","date":"2026-08-22","startTime":"9:30 PM","endTime":"1:00 AM","venue":"W Goa Ballroom","address":"Goa","description":"Dinner, drinks and dancing till the sea calls us back."}
  ]
}'

# --- Sapphire Saga — Celestial Mughal ---
create_or_update "preview-sapphire-saga" '{
  "brideName":"Inaaya","groomName":"Arjun","tagline":"Written in the stars, long before us",
  "weddingDate":"2026-10-05T19:00:00.000+05:30","slug":"preview-sapphire-saga","template":"Sapphire Saga","status":"published","isDemo":true,
  "story":"Astronomers will tell you the stars take billions of years to align. We are not surprised — ours took 28. From a children'\''s party in Lucknow where we wouldn'\''t share crayons, to this lake palace where we will share a name, it has been quite the journey across the night sky.",
  "heroImage":{"url":"https://images.unsplash.com/photo-1584242353192-7a1df2e855d8?w=1600&q=80","publicId":"demo-ss"},
  "gallery":[
    {"url":"https://images.unsplash.com/photo-1604608672516-f1b9b1d1ce4f?w=900&q=80","publicId":"s1"},
    {"url":"https://images.unsplash.com/photo-1610022093030-1c4915354b22?w=900&q=80","publicId":"s2"},
    {"url":"https://images.unsplash.com/photo-1769500804089-b91e952710a4?w=900&q=80","publicId":"s3"},
    {"url":"https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80","publicId":"s4"},
    {"url":"https://images.unsplash.com/photo-1545413621-d4ad33a08bf3?w=900&q=80","publicId":"s5"},
    {"url":"https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80","publicId":"s6"}
  ],
  "events":[
    {"name":"Stargazing Welcome","date":"2026-10-03","startTime":"8:30 PM","endTime":"12:00 AM","venue":"Taj Lake Palace Terrace","address":"Udaipur","description":"An astronomer-led evening with telescopes, cocktails and constellations."},
    {"name":"Mehendi","date":"2026-10-04","startTime":"4:00 PM","endTime":"9:00 PM","venue":"Jagmandir Island","address":"Udaipur","description":"Henna and high tea on the island palace."},
    {"name":"Wedding Pheras","date":"2026-10-05","startTime":"7:00 PM","endTime":"10:00 PM","venue":"Taj Lake Palace","address":"Udaipur","description":"The Vedic ceremony, with the lake mirroring the stars above."},
    {"name":"Royal Reception","date":"2026-10-06","startTime":"8:00 PM","endTime":"1:00 AM","venue":"Oberoi Udaivilas","address":"Udaipur","description":"A black-and-sapphire affair to close the saga."}
  ]
}'

# --- Sanctum Veil — Christian Cathedral ---
create_or_update "preview-sanctum-veil" '{
  "brideName":"Sarah","groomName":"Daniel","tagline":"Whither thou goest, I will go",
  "weddingDate":"2026-07-18T15:00:00.000+05:30","slug":"preview-sanctum-veil","template":"Sanctum Veil","status":"published","isDemo":true,
  "story":"We met in a church choir in Bandra — Sarah singing soprano, Daniel quite hopelessly off-key in the tenors. He kept showing up to practice. She kept letting him stay. The Lord, it seems, is quite the matchmaker.",
  "heroImage":{"url":"https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80","publicId":"demo-sv"},
  "gallery":[
    {"url":"https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&w=900","publicId":"v1"},
    {"url":"https://images.pexels.com/photos/1488315/pexels-photo-1488315.jpeg?auto=compress&w=900","publicId":"v2"},
    {"url":"https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&w=900","publicId":"v3"},
    {"url":"https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&w=900","publicId":"v4"},
    {"url":"https://images.pexels.com/photos/2253842/pexels-photo-2253842.jpeg?auto=compress&w=900","publicId":"v5"}
  ],
  "events":[
    {"name":"Rehearsal Dinner","date":"2026-07-17","startTime":"7:00 PM","endTime":"10:30 PM","venue":"The Park Hyatt","address":"Goa","description":"A quiet evening for family and the wedding party."},
    {"name":"The Holy Matrimony","date":"2026-07-18","startTime":"3:00 PM","endTime":"5:00 PM","venue":"St. Cathedral of Santa Catarina","address":"Old Goa","description":"The wedding mass, in the cathedral our families have prayed in for generations."},
    {"name":"Reception","date":"2026-07-18","startTime":"7:00 PM","endTime":"12:00 AM","venue":"Cidade de Goa Lawns","address":"Goa","description":"Dinner, dancing and a great deal of joy."}
  ]
}'

# --- Marigold Bloom — Festive Vibrant ---
create_or_update "preview-marigold-bloom" '{
  "brideName":"Tanvi","groomName":"Kabir","tagline":"Loud, bright, and utterly unstoppable",
  "weddingDate":"2026-11-15T18:30:00.000+05:30","slug":"preview-marigold-bloom","template":"Marigold Bloom","status":"published","isDemo":true,
  "story":"It started as a baraat we accidentally crashed in Chandigarh — Tanvi was the bride'\''s cousin, Kabir was the wrong cousin'\''s wrong cousin. He danced badly. She laughed loudly. We have been making each other laugh ever since.",
  "heroImage":{"url":"https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&w=1600","publicId":"demo-mb"},
  "gallery":[
    {"url":"https://images.unsplash.com/photo-1604608672516-f1b9b1d1ce4f?w=900&q=80","publicId":"m1"},
    {"url":"https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&w=900","publicId":"m2"},
    {"url":"https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80","publicId":"m3"},
    {"url":"https://images.unsplash.com/photo-1610022093030-1c4915354b22?w=900&q=80","publicId":"m4"},
    {"url":"https://images.pexels.com/photos/1488315/pexels-photo-1488315.jpeg?auto=compress&w=900","publicId":"m5"},
    {"url":"https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&w=900","publicId":"m6"}
  ],
  "events":[
    {"name":"Haldi","date":"2026-11-13","startTime":"10:30 AM","endTime":"2:00 PM","venue":"The Khanna Farmhouse","address":"Chhatarpur, Delhi","description":"Turmeric, dhol and an open-air courtyard."},
    {"name":"Mehendi","date":"2026-11-13","startTime":"4:00 PM","endTime":"9:00 PM","venue":"The Khanna Farmhouse","address":"Chhatarpur, Delhi","description":"Henna, music and a marigold-strewn lawn."},
    {"name":"Sangeet","date":"2026-11-14","startTime":"7:00 PM","endTime":"1:00 AM","venue":"The Leela Ballroom","address":"Delhi","description":"A full-blown Bollywood production. Bring stamina."},
    {"name":"Wedding","date":"2026-11-15","startTime":"6:30 PM","endTime":"11:00 PM","venue":"ITC Maurya Lawns","address":"New Delhi","description":"Pheras, baraat and a feast under the saffron sky."}
  ]
}'

# --- Pearl & Velvet — Art Deco Gatsby ---
create_or_update "preview-pearl-velvet" '{
  "brideName":"Anjali","groomName":"Karan","tagline":"To the roaring twenties, again",
  "weddingDate":"2026-12-31T20:00:00.000+05:30","slug":"preview-pearl-velvet","template":"Pearl & Velvet","status":"published","isDemo":true,
  "story":"We met at a jazz bar in Bandra on New Year'\''s Eve, 2022. Anjali was the only one not on her phone; Karan was the only one not in a hurry. Three midnights later, we decided to make every New Year ours.",
  "heroImage":{"url":"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80","publicId":"demo-pv"},
  "gallery":[
    {"url":"https://images.pexels.com/photos/2253842/pexels-photo-2253842.jpeg?auto=compress&w=900","publicId":"p1"},
    {"url":"https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&w=900","publicId":"p2"},
    {"url":"https://images.pexels.com/photos/1488315/pexels-photo-1488315.jpeg?auto=compress&w=900","publicId":"p3"},
    {"url":"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80","publicId":"p4"},
    {"url":"https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&w=900","publicId":"p5"},
    {"url":"https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&w=900","publicId":"p6"}
  ],
  "events":[
    {"name":"Cocktail Hour","date":"2026-12-30","startTime":"8:30 PM","endTime":"11:30 PM","venue":"The Sea Lounge","address":"Taj Mahal Palace, Mumbai","description":"Black tie, gimlets, and the gentle hum of a sax."},
    {"name":"The Ceremony","date":"2026-12-31","startTime":"8:00 PM","endTime":"9:30 PM","venue":"Crystal Ballroom","address":"Taj Mahal Palace, Mumbai","description":"Vows by candlelight, witnessed by those who matter most."},
    {"name":"NYE Reception","date":"2026-12-31","startTime":"10:00 PM","endTime":"3:00 AM","venue":"The Ballroom","address":"Taj Mahal Palace, Mumbai","description":"Dinner, dance and a midnight champagne toast to forever."}
  ]
}'

# --- Mark existing 4 as isDemo ---
for slug in lakshmi-karthik radhika-arjun eleanor-henry ayesha-imran; do
  existing_id=$(curl -s -H "Authorization: Bearer $TOKEN" $API/weddings | python3 -c "
import sys, json
try:
    ws = json.load(sys.stdin).get('weddings', [])
    print(next((w['id'] for w in ws if w['slug']=='$slug'), ''))
except Exception:
    print('')
")
  if [ -n "$existing_id" ]; then
    echo "  ✓ marking $slug as demo"
    curl -s -X PUT "$API/weddings/$existing_id" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"isDemo":true}' > /dev/null
  fi
done

echo ""
echo "=== ALL DEMOS ==="
curl -s -H "Authorization: Bearer $TOKEN" $API/weddings | python3 -c "
import sys, json
ws = json.load(sys.stdin).get('weddings', [])
demos = [w for w in ws if w.get('isDemo')]
for w in demos:
    print(f\"  {w['template']:22} → /wedding/{w['slug']}\")
print(f\"Total demos: {len(demos)}\")"
