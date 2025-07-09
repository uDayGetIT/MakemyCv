import React, { useState } from 'react';
import { extractTextFromPDF, callGroqAPI } from './utils/promptBuilder';

export default function UploadCV({ onDataReady }) {
  const [jd, setJD] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !jd) {
      setError('Please upload a resume and paste a job description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resumeText = await extractTextFromPDF(file);
      const jsonData = await callGroqAPI(resumeText, jd);
      if (jsonData && jsonData.name) {
        onDataReady(jsonData);
      } else {
        throw new Error('Invalid AI response.');
      }
    } catch (err) {
      setError('Something went wrong while tailoring your resume.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="upload-section">
      <textarea
        placeholder="Paste Job Description Here..."
        value={jd}
        onChange={(e) => setJD(e.target.value)}
        rows={6}
      />
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      {loading && <p>⏳ Tailoring your resume...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
