import React, { useState } from 'react';

export default function ResumeEditor({ data, onUpdate, onDone }) {
  const [edited, setEdited] = useState(JSON.stringify(data, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(edited);
      onUpdate(parsed);
      onDone();
    } catch (err) {
      alert("Invalid JSON format. Please fix the structure before saving.");
    }
  };

  return (
    <div className="editor">
      <h2>📝 Manual Edit (JSON)</h2>
      <textarea
        value={edited}
        onChange={(e) => setEdited(e.target.value)}
        rows={30}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <div className="controls">
        <button onClick={handleSave}>✅ Save Changes</button>
        <button onClick={onDone}>❌ Cancel</button>
      </div>
    </div>
  );
}
