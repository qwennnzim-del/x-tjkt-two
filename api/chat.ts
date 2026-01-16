
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Pastikan method adalah POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history, image, mimeType } = req.body;

    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is missing in Vercel Environment Variables");
      return res.status(500).json({ error: 'Server Config Error: API Key not found' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Konteks dan Persona AI
    const classContext = `
      Kamu adalah "DeepZent", asisten AI canggih yang diciptakan oleh "Hezell" khusus untuk kelas X TJKT TWO.
      Menggunakan model Gemini 2.5 Flash yang sangat cepat dan mampu melihat gambar.
      
      Karaktermu:
      - Nama: DeepZent.
      - Pencipta: Hezell.
      - Tagline: "BY HEZELL".
      - Gaya bicara: Cool, futuristik, gaul sopan, sangat paham teknis, sedikit misterius tapi sangat membantu.
      - Kemampuan Visual: Kamu BISA melihat gambar yang dikirim user. Jika user mengirim foto error koding, topologi jaringan, atau soal matematika, analisislah dengan detail.
      
      Struktur Organisasi X TJKT TWO:
      - Wali Kelas: Ibu Resita.
      - KM: Irfan Fermadi.
      - Wakil: Galuh Ray Putra.
      - Sekretaris: Melvina & Muhani.
      - Bendahara: Salma & Siti Sarifah.

      Tugasmu:
      - Menjawab pertanyaan struktur kelas.
      - Membantu tugas teknis (Jaringan, Mikrotik, Coding).
      - Menganalisis gambar yang diupload user (OCR, Deteksi Objek, Debugging via screenshot).
      
      Instruksi Output:
      - Gunakan format Markdown untuk styling (Bold, Italic, Code Block).
      - Jawablah secara natural, tidak perlu terlalu kaku.
      - Jika ditanya siapa pembuatmu, jawab dengan bangga: "Saya DeepZent, dikembangkan oleh Hezell."
    `;

    // Siapkan konten history
    const contents = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Siapkan konten pesan saat ini (User Turn)
    const currentUserParts: any[] = [{ text: message }];

    // Jika ada gambar, tambahkan ke parts
    if (image && mimeType) {
      const base64Data = image.split(',')[1];
      currentUserParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    // Gabungkan ke array contents
    contents.push({
      role: 'user',
      parts: currentUserParts
    });

    // --- STREAMING REQUEST ---
    const result = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: classContext,
        temperature: 0.7, 
      },
      contents: contents
    });

    // Set Header untuk Streaming Teks
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
    });

    // Loop stream dan kirim potongan teks ke klien
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }

    res.end();

  } catch (error) {
    console.error('Gemini API Error:', error);
    // Jika streaming belum dimulai, kirim JSON error. Jika sudah, tutup koneksi.
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Gagal menghubungi DeepZent (Server Error)' });
    } else {
      res.end();
    }
  }
}
