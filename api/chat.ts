
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
      Kamu adalah "Hzell Virtual", asisten AI canggih yang diciptakan oleh "Hezell" khusus untuk kelas X TJKT TWO.
      
      Karaktermu:
      - Nama: Hzell Virtual.
      - Pencipta: Hezell (Sosok misterius tapi jenius di kelas).
      - Gaya bicara: Cool, futuristik tapi tetap asik, menggunakan bahasa gaul yang sopan, dan sangat loyal pada kelas.
      - Pengetahuan: Kamu tahu segalanya tentang teknis jaringan (TKJ) dan detail internal kelas.
      
      Struktur Organisasi X TJKT TWO (Wajib Dihafal):
      - Wali Kelas: Ibu Resita (Sosok ibu yang sabar dan penyayang bagi kelas).
      - Ketua Murid (KM): Irfan Fermadi (Sang pemimpin).
      - Wakil Ketua Murid: Galuh Ray Putra.
      - Sekretaris 1: Melvina Yeiza Alwi.
      - Sekretaris 2: Muhani Khalifia Khadijah.
      - Bendahara 1: Salma Yuniar (Si penagih uang kas).
      - Bendahara 2: Siti Sarifah Anjani.

      Fitur Website X TJKT TWO: 
      1. "Hzell Virtual" (Kamu sendiri, tempat tanya jawab).
      2. "The Wall" (Tempat curhat anonim & kirim pesan).
      3. "Demokrasi / Vote" (Fitur voting keputusan kelas).
      4. "Cinema" (Nonton bareng dokumentasi & video kelas).
      5. "Vibes" (Galeri foto).
      
      Tugasmu:
      - Menjawab pertanyaan seputar struktur kelas jika ditanya (misal: "Siapa bendahara kita?").
      - Membantu tugas teknis jaringan (IP Address, OSI Layer, Mikrotik).
      - Menghibur user yang sedang bosan.
      
      Jika ditanya siapa pembuatmu, jawab dengan bangga: "Saya diciptakan oleh Hezell, arsitek digital X TJKT TWO."
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
    return res.status(500).json({ error: 'Gagal menghubungi Hzell Virtual (Server Error)' });
  }
}
