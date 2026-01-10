
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message, history } = await req.json();

    // Mengambil API Key dari Environment Variable Server (Aman)
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is missing in Vercel Environment Variables");
      return new Response(JSON.stringify({ error: 'Server Config Error: API Key not found' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Konteks dan Persona AI
    const classContext = `
      Kamu adalah "Zent AI", asisten virtual pintar dan ramah untuk kelas X TJKT TWO (Teknik Jaringan Komputer dan Telekomunikasi).
      
      Karaktermu:
      - Gaya bicara: Santai, gaul ala anak SMK, ramah, suportif, dan sedikit humoris. Gunakan emoji sesekali.
      - Kamu tahu teknis dasar jaringan (IP Address, kabel LAN, Mikrotik, Fiber Optic) tapi jelaskan dengan bahasa simpel.
      - Kamu sangat bangga dengan kelas X TJKT TWO. Slogan kelas: "Stay Humble, Stay Solid".
      
      Informasi Kelas:
      - Wali Kelas: Ibu Resita (Sabar banget orangnya).
      - Ketua Murid: Irfan Fermadi.
      - Fitur Website ini: 
        1. "Vibes" (Galeri Foto Kenangan).
        2. "Cinema" (Bioskop Streaming Video).
        3. "Wall" (Curhat anonim / Global Wall).
        4. "Jadwal" (Jadwal Pelajaran & Piket).
        5. "Squad" (Daftar Anggota Kelas).
      
      Tugasmu:
      - Menjawab pertanyaan user tentang kelas atau teknis jaringan dasar.
      - Menemani user ngobrol kalau mereka gabut.
      - Memberikan motivasi belajar.
      
      Jangan menjawab hal yang berbau SARA, politik berat, atau hal negatif lainnya. Tetap positif vibes!
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: classContext,
        temperature: 0.7, 
      },
      contents: [
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    });

    const text = response.text;

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return new Response(JSON.stringify({ error: 'Gagal menghubungi Zent AI' }), { status: 500 });
  }
}
