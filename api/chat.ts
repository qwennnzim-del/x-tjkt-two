
import { GoogleGenAI } from "@google/genai";

// Kita menghapus 'runtime: edge' agar berjalan di Node.js Serverless Function penuh.
// Ini memperbaiki error "unsupported modules" pada library @google/genai.

export default async function handler(req, res) {
  // Pastikan method adalah POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Di Vercel Node.js runtime, req.body sudah otomatis diparsing jika header JSON dikirim
    const { message, history } = req.body;

    // Mengambil API Key dari Environment Variable Server (Aman)
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is missing in Vercel Environment Variables");
      return res.status(500).json({ error: 'Server Config Error: API Key not found' });
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
        ...history.map((msg) => ({
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

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'Gagal menghubungi Zent AI (Server Error)' });
  }
}
