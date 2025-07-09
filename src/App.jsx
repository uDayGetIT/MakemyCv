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
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handlePreview = async () => {
    setError('');
    if (!pdfFile || !jd.trim()) {
      setError('Please provide both the resume (PDF) and the job description.');
      return;
    }

    setLoading(true);
    try {
      const text = await extractTextFromPDF(pdfFile);
      const prompt = buildPrompt(text, jd);

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
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while tailoring your resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
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
          <button onClick={handlePreview} disabled={loading}>
            {loading ? 'Generating...' : 'Preview Resume'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      )}

      {resumeData && showPreview && !editing && (
        <>
          <ResumeTemplate data={resumeData} />
          <div className="controls">
            <button onClick={() => setEditing(true)}>✏️ Edit</button>
            <button onClick={handleDownload}>📄 Download PDF</button>
            <button
              onClick={() => {
                setResumeData(null);
                setShowPreview(false);
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
