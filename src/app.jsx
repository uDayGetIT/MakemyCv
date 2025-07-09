import React, { useState } from 'react';
import UploadCV from './UploadCV';
import ResumeTemplate from './ResumeTemplate';
import ResumeEditor from './ResumeEditor';
import './styles/app.css';

export default function App() {
  const [resumeData, setResumeData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="app-container">
      <h1>🎯 Resume Tailor</h1>
      {!resumeData ? (
        <UploadCV onDataReady={(data) => setResumeData(data)} />
      ) : editMode ? (
        <ResumeEditor data={resumeData} onUpdate={setResumeData} onDone={() => setEditMode(false)} />
      ) : (
        <>
          <ResumeTemplate data={resumeData} />
          <div className="controls">
            <button onClick={() => setEditMode(true)}>✏️ Edit</button>
            <button onClick={() => window.print()}>⬇️ Download</button>
            <button onClick={() => setResumeData(null)}>🔁 Start Over</button>
          </div>
        </>
      )}
    </div>
  );
}
