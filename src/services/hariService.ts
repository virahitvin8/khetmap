/**
 * HARI — Holistic Agricultural Response Intelligence
 * Voice + text AI crop advisor for Indian farmers
 */

export interface FarmContext {
  cropType?: string;
  ndvi?: number;
  areaHa?: number;
  state?: string;
  lat?: number;
  lng?: number;
  weather?: {
    temperature: number;
    rainfall: number;
    humidity: number;
    et0: number;
  };
}

export interface HARIMessage {
  id: string;
  role: 'user' | 'hari';
  text: string;
  timestamp: Date;
}

// ─── Quick suggestion chips ───────────────────────────────────────
export const HARI_QUICK_QUESTIONS = [
  { icon: '🌿', text: 'NDVI kam kyun hai?', label: 'Crop stress reason' },
  { icon: '💧', text: 'Aaj irrigation karna chahiye?', label: 'Irrigation advice' },
  { icon: '🌾', text: 'Harvest kab karu?', label: 'Harvest timing' },
  { icon: '🐛', text: 'Pest ka khatara hai?', label: 'Pest risk check' },
  { icon: '🌧️', text: 'Barish ki jankari do', label: 'Rain forecast' },
  { icon: '💊', text: 'Kya fertilizer dalun?', label: 'Fertilizer advice' },
];

// ─── Smart rule-based response engine ────────────────────────────
export async function getHARIResponse(
  userMessage: string,
  context: FarmContext
): Promise<string> {
  const msg = userMessage.toLowerCase();

  // Try Gemini API first (if key available)
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await callGemini(userMessage, context, geminiKey);
    } catch {
      // Fall through to rule-based
    }
  }

  // Rule-based responses
  return getRuleBasedResponse(msg, context);
}

async function callGemini(
  message: string,
  ctx: FarmContext,
  apiKey: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\nFarmer: ' + message }] },
        ],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || getRuleBasedResponse(message.toLowerCase(), ctx);
}

function buildSystemPrompt(ctx: FarmContext): string {
  return `You are HARI (Holistic Agricultural Response Intelligence), a wise and friendly Indian agricultural advisor who speaks Hinglish (mix of Hindi and English). You help farmers with satellite data insights.

Current farm context:
- Crop: ${ctx.cropType || 'Unknown'}
- NDVI score: ${ctx.ndvi !== undefined ? (ctx.ndvi * 100).toFixed(0) + '/100' : 'Not measured'}
- Area: ${ctx.areaHa ? ctx.areaHa + ' hectares' : 'Unknown'}
- State: ${ctx.state || 'India'}
- Temperature: ${ctx.weather?.temperature ?? 'N/A'}°C
- Today's rainfall: ${ctx.weather?.rainfall ?? 0}mm
- ET₀ (water need): ${ctx.weather?.et0 ?? 'N/A'}mm/day

Rules:
1. Respond in friendly Hinglish (mix Hindi + English)
2. Keep answers under 4 sentences
3. Always give one concrete action step
4. Use emojis naturally
5. Address the farmer as "bhai" or "dost"`;
}

function getRuleBasedResponse(msg: string, ctx: FarmContext): string {
  const ndvi = ctx.ndvi ?? 0.5;
  const temp = ctx.weather?.temperature ?? 28;
  const rain = ctx.weather?.rainfall ?? 0;
  const et0 = ctx.weather?.et0 ?? 4;
  const crop = ctx.cropType || 'fasal';

  // ── Irrigation ──
  if (msg.includes('irrigat') || msg.includes('pani') || msg.includes('paani') || msg.includes('sinchit') || msg.includes('water')) {
    if (rain > 15) return `🌧️ Aaj bahut barish ho rahi hai bhai! Irrigation bilkul mat karo — extra pani roots ko damage kar sakta hai. Kal check karna kal.`;
    if (et0 > 6 && temp > 35) return `🌊 Aaj HARI alert! ET₀ = ${et0.toFixed(1)}mm/day hai aur temperature ${temp}°C — ${crop} ko abhi pani chahiye. Shaam ko 4 baje baad drip/flood irrigation karo.`;
    if (et0 < 3) return `✅ Abhi soil moisture theek hai dost. ET₀ sirf ${et0.toFixed(1)}mm hai — agle 2 din tak irrigation ki zaroorat nahi. NDVI bhi theek lag raha hai.`;
    return `💧 Moderate pani ki zaroorat hai. ET₀ = ${et0.toFixed(1)}mm/day. Agar mitti ऊपर se sukhi lag rahi hai to 30-40mm irrigation karo, warna skip karo.`;
  }

  // ── NDVI / Crop health ──
  if (msg.includes('ndvi') || msg.includes('health') || msg.includes('fasal') || msg.includes('crop') || msg.includes('kam') || msg.includes('kharab')) {
    if (ndvi < 0.3) return `🔴 HARI ne notice kiya — NDVI sirf ${(ndvi*100).toFixed(0)} hai, jo bahut kam hai bhai! 3 reasons ho sakte hain: (1) Nutrient deficiency — urea/DAP check karo (2) Pest attack — patta ulta dekho (3) Water stress — mitti nami check karo. Kal subah khhet mein jao.`;
    if (ndvi < 0.5) return `🟡 NDVI ${(ndvi*100).toFixed(0)} hai — moderate range mein hai. ${crop} ko thoda boost chahiye. Foliar spray (micronutrient) karo aur agla satellite image 5 din mein dekhna.`;
    return `🟢 Wah bhai! NDVI ${(ndvi*100).toFixed(0)} — ${crop} bilkul healthy hai! Satellite data bol raha hai fasal achchi grow kar rahi hai. Aise hi karo — bas pest monitoring karte raho.`;
  }

  // ── Harvest ──
  if (msg.includes('harvest') || msg.includes('katai') || msg.includes('kab karu') || msg.includes('kada')) {
    const harvestInfo: Record<string, string> = {
      rice: 'Chawal: Baalon ke 80% dane pakne ke baad (generally transplanting ke 120-150 din baad) katai karo.',
      wheat: 'Gehu: Dane hard ho jayen aur golden color aa jaaye — typically 110-120 din mein ready.',
      cotton: 'Kapas: Bolls fully open hone ke 2-3 din baad todna best rahega.',
      sugarcane: 'Ganna: 12-18 mahine mein, jab Brix value 18-22% ho jaaye.',
    };
    const cropKey = Object.keys(harvestInfo).find(k => crop.toLowerCase().includes(k));
    if (cropKey) return `🌾 ${harvestInfo[cropKey]} HARI suggest karta hai: Harvest se 7-10 din pehle irrigation band karo for better quality.`;
    return `🌾 Bhai, ${crop} ki katai ke liye NDVI monitor karo — jab NDVI plateau pe aa jaaye (band grow karna band kare), tab katai ka waqt aa gaya hai. Apne local Krishi Vigyan Kendra se bhi confirm karo.`;
  }

  // ── Pest ──
  if (msg.includes('pest') || msg.includes('kida') || msg.includes('bimari') || msg.includes('insect') || msg.includes('fungus')) {
    if (ndvi < 0.4) return `🐛 Teri NDVI ${(ndvi*100).toFixed(0)} hai — pest ya disease ka chance hai! Satellite mein red patches dikh rahe hain. Khhet mein jao: patte ke neeche check karo (aphids/thrips), stem base dekho (fungus), aur nearest agriculture officer ko batao.`;
    return `🔍 Abhi satellite mein koi major pest sign nahi dikh raha. Fir bhi weekly scouting karo — especially agar humidity ${ctx.weather?.humidity ?? 60}%+ hai toh fungal disease ka risk badh jaata hai. Preventive neem oil spray 5ml/L karo.`;
  }

  // ── Fertilizer ──
  if (msg.includes('fertilizer') || msg.includes('khad') || msg.includes('urea') || msg.includes('dap') || msg.includes('nutrient')) {
    return `💊 Satellite NDVI se fertilizer timing ka pata chalta hai bhai: NDVI 0.3 se kam → Nitrogen (Urea 46%) do. NDVI 0.3-0.5 → Balanced NPK. NDVI > 0.5 → Sirf micronutrient spray kaafi hai. Abhi tera NDVI ${(ndvi*100).toFixed(0)} hai — usi hisab se decide karo!`;
  }

  // ── Weather / Rain ──
  if (msg.includes('barish') || msg.includes('baarish') || msg.includes('mausam') || msg.includes('weather') || msg.includes('rain')) {
    if (rain > 10) return `🌧️ Aaj ${rain}mm barish ho chuki hai! Khhet mein paani bhar gaya ho to drainage check karo — Sentinel-1 SAR flood map dekho (map pe SAR button). Kal mausam clear hone ke baad NDVI update karega.`;
    return `☀️ Aaj ka mausam: ${temp}°C, barish ${rain}mm. Agle 7 din ka forecast check karo — Open-Meteo ka data map pe weather layer mein dikh raha hai. Koi bada storm aane se pehle HARI alert dega.`;
  }

  // ── Default ──
  const defaultResponses = [
    `🌾 Namaskar bhai! Main HARI hun — tumhara satellite-powered krishi sahayak. Mujhse pooch sakte ho: NDVI ke baare mein, irrigation timing, harvest, pest risk, ya mausam. Kya jaanna chahte ho?`,
    `🛰️ Tera khhet satellite ki nazar mein hai dost! NDVI, mausam, aur soil data sab track ho raha hai. Koi bhi sawaal pooch — HARI hamesha haazir hai.`,
    `🌿 Achha sawaal hai! Main tumhare farm ka satellite data analyze karke jawab doonga. Thoda aur detail batao — kaunsi fasal hai, kya problem dikh rahi hai?`,
  ];
  return defaultResponses[Math.floor(Date.now() / 1000) % defaultResponses.length];
}
