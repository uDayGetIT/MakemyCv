import { PDFDocument } from 'pdf-lib';

export async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();
  return pages.map((page) => page.getTextContent()).join('\n');
}

export async function callGroqAPI(resumeText, jdText) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const prompt = `You are an expert resume writer. Based on the user's original resume and the following job description, tailor their resume to match the job closely. Return only a JSON object like this:
{
  "name": "Full Name",
  "contact": "email, phone, links",
  "summary": "...",
  "skills": [...],
  "experience": [...],
  "education": [...],
  "projects": [...]
}
Make sure the result has strong keyword match and is formatted cleanly.
Original Resume:\n${resumeText}
Job Description:\n${jdText}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    })
  });

  const data = await response.json();
  try {
    const text = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err, data);
    throw new Error("Invalid AI response format.");
  }
}
