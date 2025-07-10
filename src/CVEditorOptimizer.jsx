import React, { useState, useRef } from "react";
import {
  Upload, FileText, Sparkles, Download, Eye, Edit3, Brain, Target, Zap, CheckCircle, ArrowRight
} from "lucide-react";

// Extract basic info from CV text
function extractBasicInfo(cvText) {
  const lines = cvText.split('\n').map(l => l.trim()).filter(Boolean);
  return {
    name: lines[0] || 'Your Name',
    contact: lines.slice(1, 4).join(' • ') || 'Contact Info'
  };
}

// Parse ATS-style sections from AI output
function parseSections(content) {
  const sections = {};
  const lines = content.split("\n");
  let currentSection = "";
  let currentContent = [];
  for (let line of lines) {
    if (line.startsWith("**") && line.endsWith("**")) {
      if (currentSection) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      currentSection = line.replace(/\*\*/g, "").toLowerCase();
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections[currentSection] = currentContent.join("\n").trim();
  }
  return sections;
}

// Download as text
const downloadCV = (optimizedCV) => {
  const element = document.createElement("a");
  const file = new Blob([optimizedCV], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = "optimized_cv.txt";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Download as HTML (Jake Resume style)
const downloadHTML = (optimizedCV, cvText) => {
  const { name, contact } = extractBasicInfo(cvText);
  const sections = parseSections(optimizedCV);

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${name} - Resume</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: 'Inter', 'Arial', sans-serif; background: #f8fafc; }
      .section-title { color: #2563eb; font-size: 1.2em; border-bottom: 2px solid #2563eb; margin-bottom: 10px; padding-bottom: 3px; }
      .resume-content ul { list-style: disc; margin-left: 1.5em; }
      .resume-content li { margin-bottom: 0.2em; }
    </style>
  </head>
  <body>
    <div class="max-w-2xl mx-auto bg-white shadow-xl rounded-xl mt-10 mb-10 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
        <h1 class="text-3xl font-bold mb-2">${name}</h1>
        <div class="text-md opacity-90">${contact}</div>
      </div>
      <div class="p-8 resume-content">
        ${Object.entries(sections).map(([key, content]) => `
          <div class="mb-6">
            <div class="section-title">${key.replace(/^\w/, c => c.toUpperCase())}</div>
            ${formatSectionHTML(key, content)}
          </div>
        `).join("")}
      </div>
    </div>
  </body>
  </html>
  `;

  const element = document.createElement("a");
  element.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  element.download = "resume_jake.html";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

function formatSectionHTML(section, content) {
  if (section.includes("experience") || section === "projects") {
    const items = content.split('\n').filter(l => l.trim());
    return `<ul>${items.map(item => `<li>${item.replace(/^•\s?/, "")}</li>`).join("")}</ul>`;
  }
  return `<div>${content.replace(/\n/g, "<br>")}</div>`;
}

function formatSectionPreview(section, content) {
  if (section.includes("experience") || section === "projects") {
    const items = content.split('\n').filter(l => l.trim());
    return (
      <ul className="list-disc ml-6">
        {items.map((item, i) => <li key={i}>{item.replace(/^•\s?/, "")}</li>)}
      </ul>
    );
  }
  return <div className="whitespace-pre-line">{content}</div>;
}

const CVEditorOptimizer = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [optimizedCV, setOptimizedCV] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedSections, setEditedSections] = useState({});
  const fileInputRef = useRef(null);

  // PDF/TXT Upload Handler (waits for PDF.js to be available)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => setCvText(e.target.result);
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const waitForPDFJS = () =>
          new Promise((resolve, reject) => {
            let tries = 0;
            function check() {
              if (window.pdfjsLib) return resolve(window.pdfjsLib);
              if (++tries > 30) return reject(new Error("PDF.js not loaded"));
              setTimeout(check, 100);
            }
            check();
          });
        try {
          const pdfjsLib = await waitForPDFJS();
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";
          const loadingTask = pdfjsLib.getDocument({  new Uint8Array(e.target.result) });
          const pdf = await loadingTask.promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";
          }
          setCvText(text);
        } catch (err) {
          setCvText("Failed to extract text from PDF. Please try another file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setCvText(
        "Currently, only .txt and .pdf files are supported for text extraction in this version. Please convert your CV to .txt or .pdf format and upload again."
      );
    }
  };

  // Optimize CV using API (or fallback)
  const optimizeCV = async () => {
    if (!cvText || !jobDescription) {
      alert("Please provide both CV content and job description");
      return;
    }
    setIsOptimizing(true);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are a professional CV optimizer. Given a raw CV and a job description, rewrite the CV in the style of Jake Gutierrez's LaTeX resume (sections: Profile, Experience, Education, Projects, Skills, etc). Format each section as: **SECTION**\\ncontent. For Experience, list each job as a subheading with bullets. For Skills, use a comma-separated list. Ensure at least 60% of the content matches the job description for a good ATS score, but do not fabricate experience. Output only the formatted sections, no extra commentary.",
            },
            {
              role: "user",
              content: `CV Content:\n${cvText}\n\nJob Description:\n${jobDescription}\n\nPlease optimize this CV for the job role, restructuring and rewording to highlight relevant skills and experiences.`
            },
          ],
          temperature: 0.6,
          max_tokens: 2000,
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setOptimizedCV(data.choices[0].message.content);
        setActiveTab("optimize");
      } else {
        setOptimizedCV(cvText);
        setActiveTab("optimize");
      }
    } catch (error) {
      setOptimizedCV(cvText);
      setActiveTab("optimize");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Section editing
  const updateSection = (sectionKey, newContent) => {
    setEditedSections((prev) => ({
      ...prev,
      [sectionKey]: newContent,
    }));
  };

  const saveEdits = () => {
    const sections = parseSections(optimizedCV);
    const updatedSections = { ...sections, ...editedSections };
    const newOptimizedCV = Object.entries(updatedSections)
      .map(([key, content]) => `**${key.toUpperCase()}**\n${content}`)
      .join("\n\n");
    setOptimizedCV(newOptimizedCV);
    setEditedSections({});
    setEditMode(false);
  };

  const cancelEdits = () => {
    setEditedSections({});
    setEditMode(false);
  };

  const renderEditableSection = (sectionKey, sectionContent) => {
    const currentContent = editedSections[sectionKey] || sectionContent;
    if (editMode) {
      return (
        <div className="space-y-3">
          <textarea
            value={currentContent}
            onChange={(e) => updateSection(sectionKey, e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder={`Edit ${sectionKey} content...`}
          />
          <div className="text-xs text-gray-500">
            💡 Tip: Use bullet points (•) for experience items, separate companies with double line breaks
          </div>
        </div>
      );
    }
    return formatSectionPreview(sectionKey, currentContent);
  };

  const renderJakeTemplate = () => {
    const { name, contact } = extractBasicInfo(cvText);
    const sections = parseSections(optimizedCV);

    return (
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <div className="text-md opacity-90">{contact}</div>
        </div>
        <div className="p-8">
          {Object.entries(sections).map(([sectionKey, sectionContent]) => {
            if (!sectionContent.trim()) return null;
            return (
              <div key={sectionKey} className="mb-8">
                <div className="text-xl font-bold text-blue-700 mb-2 border-b border-blue-200 pb-1">
                  {sectionKey.replace(/^\w/, c => c.toUpperCase())}
                </div>
                {renderEditableSection(sectionKey, sectionContent)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CV Optimizer Pro
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>AI-Powered CV Enhancement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: "upload", label: "Upload CV", icon: Upload },
            { id: "optimize", label: "Optimize", icon: Sparkles }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "upload" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your CV & Job Description
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your current CV (.txt or .pdf) and paste the job description to get AI-powered optimization suggestions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* CV Upload */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Your CV</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Upload CV File
                      </p>
                      <p className="text-sm text-gray-600">
                        Support for .txt and .pdf files
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.pdf"
                      className="hidden"
                    />
                    {cvText && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">CV Uploaded Successfully!</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Ready for optimization
                        </p>
                        <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                          <strong>Extracted CV Preview:</strong>
                          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>{cvText}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Job Description */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Job Description</h3>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-80 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
            {/* Optimize Button */}
            <div className="text-center">
              <button
                onClick={optimizeCV}
                disabled={isOptimizing || !cvText || !jobDescription}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Optimize My CV</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "optimize" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Optimized CV Content
              </h2>
              <p className="text-lg text-gray-600">
                Review and edit your AI-optimized CV content
              </p>
            </div>
            {optimizedCV && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Jake Resume Preview
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {editMode ? (
                      <>
                        <button
                          onClick={saveEdits}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={cancelEdits}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit Content</span>
                        </button>
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
                        </button>
                        <button
                          onClick={() => downloadCV(optimizedCV)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Text</span>
                        </button>
                        <button
                          onClick={() => downloadHTML(optimizedCV, cvText)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download HTML</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {showPreview && renderJakeTemplate()}
                  {!showPreview && (
                    <textarea
                      value={optimizedCV}
                      onChange={(e) => setOptimizedCV(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                      readOnly={editMode}
                    />
                  )}
                </div>
              </div>
            )}
            {!optimizedCV && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  No optimized CV yet. Go to the Upload tab to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CVEditorOptimizer;
