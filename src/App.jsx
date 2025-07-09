import React, { useState } from 'react';
import ResumeTemplate from './ResumeTemplate';
import ResumeEditor from './ResumeEditor';
import { extractTextFromPDF } from './utils/pdfParser';
import { buildPrompt } from './utils/promptBuilder';
import './styles/app.css';

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [jd, setJd] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleGenerateResume = async () => {
    setError('');
    if (!pdfFile || !jd.trim()) {
      setError('Please provide both PDF and Job Description.');
      return;
    }

    setLoading(true);
    try {
      const text = await extractTextFromPDF(pdfFile);
      const prompt = buildPrompt(text, jd);
      console.log('API KEY:', API_KEY); // TEMPORARY DEBUG - Remove before deploy

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const json = JSON.parse(content);
      setResumeData(json);
      setPreviewReady(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while tailoring your resume.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <h1>🎯 Resume Tailor (Free & ATS-Optimized)</h1>

      {!resumeData && (
        <div className="upload-section">
          <textarea
            rows="6"
            placeholder="Paste Job Description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button onClick={handleGenerateResume}>Preview Resume</button>
          {error && <div className="error">{error}</div>}
          {loading && <p>Generating tailored resume…</p>}
        </div>
      )}

      {previewReady && resumeData && !editing && (
        <>
          <ResumeTemplate data={resumeData} />
          <div className="controls">
            <button onClick={() => setEditing(true)}>✏️ Edit</button>
            <button onClick={downloadAsPDF}>📄 Download PDF</button>
            <button
              onClick={() => {
                setResumeData(null);
                setPreviewReady(false);
              }}
            >
              🔁 Start Over
            </button>
          </div>
        </>
      )}

      {editing && (
        <ResumeEditor
          data={resumeData}
          onUpdate={(updated) => setResumeData(updated)}
          onDone={() => setEditing(false)}
        />
      )}
    </div>
  );
}

export default App;
