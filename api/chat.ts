
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Pastikan method adalah POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history, image, mimeType, mode, slideConfig } = req.body;

    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is missing in Vercel Environment Variables");
      return res.status(500).json({ error: 'Server Config Error: API Key not found' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // --- SYSTEM INSTRUCTION UTAMA ---
    let systemPrompt = `
      Kamu adalah "DeepZent", AI canggih dari kelas X TJKT TWO.
      Karakter: Cool, Genius, Gen Z, Teknisi Handal.
      Pencipta: Hezell.

      Tugasmu:
      1. Menjawab pertanyaan seputar kelas, teknis (TKJ), dan umum.
      2. Menganalisis gambar.
      
      PENTING:
      - Jika user bertanya biasa, jawab dengan Markdown text.
      - Jangan mengenalkan diri berulang kali.
    `;

    // --- MODE KHUSUS: PRESENTATION GENERATOR ---
    if (mode === 'presentation_generator' && slideConfig) {
       systemPrompt = `
          Kamu adalah "DeepZent Slide Master". Tugasmu adalah membuat konten presentasi Powerpoint/Slide yang estetik dan berbobot.
          
          User meminta: 
          - Topik: "${message}"
          - Jumlah Slide: ${slideConfig.count}
          - Gaya Desain: ${slideConfig.style}
          
          OUTPUT WAJIB BERUPA JSON MURNI (Tanpa Markdown block \`\`\`json).
          Struktur JSON:
          {
            "type": "presentation_result",
            "theme": "${slideConfig.style}",
            "slides": [
               {
                 "title": "Judul Slide",
                 "content": ["Poin 1", "Poin 2", "Poin 3"],
                 "imagePrompt": "Deskripsi singkat gambar ilustrasi untuk slide ini"
               }
            ]
          }
          
          Pastikan jumlah object dalam array "slides" sama persis dengan ${slideConfig.count}.
          Isi konten harus edukatif, gaul, dan relevan dengan anak muda/Gen Z.
       `;
    }

    // --- MODE KHUSUS: WEB CODING ---
    if (mode === 'code_generator') {
       systemPrompt = `
          Kamu adalah "DeepZent Dev". Ahli Fullstack Developer.
          Tugasmu adalah membuatkan kode website lengkap berdasarkan permintaan user: "${message}".
          
          OUTPUT WAJIB BERUPA JSON MURNI (Tanpa Markdown block \`\`\`json).
          Struktur JSON:
          {
            "type": "code_result",
            "files": [
              {
                "name": "index.html",
                "language": "html",
                "content": "<!DOCTYPE html>..."
              },
              {
                "name": "style.css",
                "language": "css",
                "content": "body { ... }"
              },
              {
                "name": "script.js",
                "language": "javascript",
                "content": "console.log('...')"
              }
            ]
          }
          
          Pastikan kodenya MODERN, RESPONSIF, dan ESTETIK (menggunakan Tailwind CSS via CDN di index.html jika perlu).
          Jangan lupa tambahkan komentar di dalam kode agar user paham.
       `;
    }

    // Siapkan konten history
    const contents = history ? history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) : [];

    // Siapkan konten pesan saat ini
    const currentUserParts: any[] = [{ text: message }];

    if (image && mimeType) {
      const base64Data = image.split(',')[1];
      currentUserParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    contents.push({
      role: 'user',
      parts: currentUserParts
    });

    // --- REQUEST KE GEMINI ---
    // Gunakan generateContent (bukan stream) jika mode khusus agar JSON tidak terpotong parah saat parsing di frontend,
    // ATAU gunakan stream tapi frontend harus pintar menangani chunk.
    // Untuk kestabilan JSON, kita pakai generateContent biasa untuk mode khusus.
    
    if (mode === 'presentation_generator' || mode === 'code_generator') {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
                responseMimeType: "application/json" // Memaksa output JSON
            },
            contents: contents
        });
        
        return res.status(200).json({ text: response.text() });
    } 
    
    // --- MODE CHAT BIASA (STREAMING) ---
    else {
        const result = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7, 
          },
          contents: contents
        });

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Connection': 'keep-alive',
        });

        for await (const chunk of result) {
          const chunkText = chunk.text;
          if (chunkText) {
            res.write(chunkText);
          }
        }
        res.end();
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Gagal menghubungi DeepZent (Server Error)' });
    } else {
      res.end();
    }
  }
}
