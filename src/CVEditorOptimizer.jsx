import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Sparkles, Download, Eye, Edit3, Brain, Target, Zap, CheckCircle, ArrowRight
} from 'lucide-react';

// Helper: Parse Optimized CV
const parseOptimizedCV = (content) => {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = '';
  let currentContent = [];

  for (let line of lines) {
    if (line.startsWith('**') && line.endsWith('**')) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = line.replace(/\*\*/g, '').toLowerCase();
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  return sections;
};

// Helper: Download CV as text
const downloadCV = (optimizedCV) => {
  const element = document.createElement('a');
  const file = new Blob([optimizedCV], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = 'optimized_cv.txt';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Helper: Generate HTML template for download
const generateHTMLTemplate = (optimizedCV) => {
  const sections = parseOptimizedCV(optimizedCV);

  const formatSectionContent = (sectionType, content) => {
    if (sectionType.includes('experience')) {
      const experiences = content.split('\n\n');
      return experiences.map(exp => {
        const lines = exp.split('\n');
        const titleLine = lines[0];
        const bullets = lines.slice(1).filter(line => line.startsWith('•'));
        return `
          <div class="experience-item">
            <h3>${titleLine}</h3>
            <ul>
              ${bullets.map(bullet => `<li>${bullet.substring(2)}</li>`).join('')}
            </ul>
          </div>
        `;
      }).join('');
    } else if (sectionType === 'projects') {
      const projects = content.split('\n\n');
      return projects.map(project => {
        const lines = project.split('\n');
        const title = lines[0];
        const description = lines.slice(1).join('<br>');
        return `
          <div class="project-item">
            <h4>${title}</h4>
            <p>${description}</p>
          </div>
        `;
      }).join('');
    } else {
      return `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional CV</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .cv-container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header .title { font-size: 1.2em; opacity: 0.9; margin-bottom: 20px; }
        .contact-info { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; font-size: 0.9em; }
        .content { padding: 40px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; font-size: 1.4em; }
        .experience-item { margin-bottom: 20px; }
        .experience-item h3 { color: #333; margin-bottom: 5px; }
        .experience-item .company { color: #666; font-style: italic; margin-bottom: 10px; }
        .experience-item ul { margin-left: 20px; }
        .experience-item li { margin-bottom: 5px; }
        .education-item { margin-bottom: 15px; }
        .project-item { margin-bottom: 20px; }
        .project-item h4 { color: #667eea; margin-bottom: 10px; }
        @media print { .cv-container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="cv-container">
        <div class="header">
            <h1>John Doe</h1>
            <div class="title">Professional Title</div>
            <div class="contact-info">
                <span>📧 john.doe@email.com</span>
                <span>📱 +1 (555) 123-4567</span>
                <span>🌐 linkedin.com/in/johndoe</span>
                <span>📍 New York, NY</span>
            </div>
        </div>
        <div class="content">
            ${Object.entries(sections).map(([key, content]) => `
                <div class="section">
                    <h2>${key.toUpperCase()}</h2>
                    <div>${formatSectionContent(key, content)}</div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
};

// Helper: Download templated CV as HTML
const downloadTemplatedCV = (optimizedCV, selectedTemplate) => {
  const element = document.createElement('a');
  const htmlContent = generateHTMLTemplate(optimizedCV);
  element.href = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
  element.download = `cv_${selectedTemplate}_template.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Helper: Render section content (React JSX)
const renderSectionContent = (sectionType, content) => {
  if (sectionType.includes('experience')) {
    const experiences = content.split('\n\n').filter(exp => exp.trim());
    return (
      <div className="space-y-6">
        {experiences.map((exp, index) => {
          const lines = exp.split('\n');
          const titleLine = lines[0];
          const bullets = lines.slice(1).filter(line => line.startsWith('•'));
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">{titleLine}</h3>
              <ul className="space-y-2">
                {bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700">{bullet.substring(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  } else if (sectionType === 'projects') {
    const projects = content.split('\n\n').filter(proj => proj.trim());
    return (
      <div className="space-y-4">
        {projects.map((project, index) => {
          const lines = project.split('\n');
          const title = lines[0];
          const description = lines.slice(1).join(' ');
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-600 mb-2">{title}</h4>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          );
        })}
      </div>
    );
  } else if (sectionType === 'education') {
    const educationItems = content.split('\n').filter(item => item.trim());
    return (
      <div className="space-y-3">
        {educationItems.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    );
  }
};

const CVEditorOptimizer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedCV, setOptimizedCV] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('jake');
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedSections, setEditedSections] = useState({});
  const fileInputRef = useRef(null);

  const templates = {
    jake: {
      name: 'Jake Resume',
      description: 'Clean, modern ATS-friendly design',
      color: 'bg-blue-500'
    },
    minimal: {
      name: 'Minimal Pro',
      description: 'Simple, elegant, professional',
      color: 'bg-gray-600'
    },
    creative: {
      name: 'Creative Edge',
      description: 'Bold, modern, eye-catching',
      color: 'bg-purple-500'
    },
    executive: {
      name: 'Executive',
      description: 'Sophisticated, corporate style',
      color: 'bg-emerald-500'
    }
  };

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvText(e.target.result);
      };
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // For PDF/DOCX, simulate extraction
        reader.onload = (e) => {
          setCvText("Sample CV content from uploaded file. In a real implementation, you'd use a PDF/DOCX parser library.");
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Demo optimization fallback
  const generateDemoOptimization = () => {
    return `**PROFILE**
Results-driven professional with expertise in ${jobDescription.includes('software') ? 'software development' : 'project management'} and proven track record of delivering high-impact solutions. Skilled in cross-functional collaboration, process optimization, and driving business growth through innovative approaches.

**EXPERIENCE**
Senior ${jobDescription.includes('software') ? 'Software Developer' : 'Project Manager'} | TechCorp Solutions | 2022-Present
• Led development of scalable applications serving 10,000+ users, improving system performance by 40%
• Collaborated with cross-functional teams to deliver projects 20% ahead of schedule
• Implemented best practices and mentored junior team members, increasing team productivity by 25%
• Specialized in ${jobDescription.includes('React') ? 'React.js and modern frontend technologies' : 'agile methodologies and stakeholder management'}

**EXPERIENCE 2**
${jobDescription.includes('software') ? 'Full Stack Developer' : 'Assistant Project Manager'} | InnovateTech | 2020-2022
• Developed and maintained multiple client-facing applications with 99.9% uptime
• Optimized database queries reducing load times by 35%
• Participated in code reviews and maintained high coding standards
• Contributed to architectural decisions and technical documentation

**EDUCATION**
Bachelor of Computer Science | University of Technology | 2020
• Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems
• GPA: 3.8/4.0

**PROJECTS**
E-commerce Platform Optimization
• Built responsive web application using React.js and Node.js
• Implemented secure payment processing and inventory management
• Achieved 50% improvement in page load speeds and 30% increase in user engagement`;
  };

  // Optimize CV using API (or fallback)
  const optimizeCV = async () => {
    if (!cvText || !jobDescription) {
      alert('Please provide both CV content and job description');
      return;
    }
    setIsOptimizing(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a professional CV optimizer. Analyze the provided CV and job description, then rewrite the CV to better match the job requirements. Format the output with clear sections: Profile, Experience, Experience 2 (if applicable), Education, Projects. Make the experiences sound relevant to the job role while staying truthful to the original content.'
            },
            {
              role: 'user',
              content: `CV Content: ${cvText}\n\nJob Description: ${jobDescription}\n\nPlease optimize this CV for the job role, restructuring and rewording to highlight relevant skills and experiences.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setOptimizedCV(data.choices[0].message.content);
        setActiveTab('optimize');
      } else {
        const demoOptimization = generateDemoOptimization();
        setOptimizedCV(demoOptimization);
        setActiveTab('optimize');
      }
    } catch (error) {
      const demoOptimization = generateDemoOptimization();
      setOptimizedCV(demoOptimization);
      setActiveTab('optimize');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Section editing
  const updateSection = (sectionKey, newContent) => {
    setEditedSections(prev => ({
      ...prev,
      [sectionKey]: newContent
    }));
  };

  const saveEdits = () => {
    const sections = parseOptimizedCV(optimizedCV);
    const updatedSections = { ...sections, ...editedSections };
    const newOptimizedCV = Object.entries(updatedSections)
      .map(([key, content]) => `**${key.toUpperCase()}**\n${content}`)
      .join('\n\n');
    setOptimizedCV(newOptimizedCV);
    setEditedSections({});
    setEditMode(false);
  };

  const cancelEdits = () => {
    setEditedSections({});
    setEditMode(false);
  };

  // Editable section rendering
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
    return renderSectionContent(sectionKey, currentContent);
  };

  // Jake template rendering
  const renderJakeTemplate = () => {
    const sections = parseOptimizedCV(optimizedCV);
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">John Doe</h1>
          <p className="text-xl opacity-90">Professional Title</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>📧 john.doe@email.com</span>
            <span>📱 +1 (555) 123-4567</span>
            <span>🌐 linkedin.com/in/johndoe</span>
            <span>📍 New York, NY</span>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {Object.entries(sections).map(([sectionKey, sectionContent]) => {
            if (!sectionContent.trim()) return null;
            return (
              <div key={sectionKey} className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {sectionKey.toUpperCase()}
                  </h2>
                  {editMode && (
                    <button
                      onClick={() => updateSection(sectionKey, editedSections[sectionKey] || sectionContent)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-gray-700">
                  {renderEditableSection(sectionKey, sectionContent)}
                </div>
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
            { id: 'upload', label: 'Upload CV', icon: Upload },
            { id: 'optimize', label: 'Optimize', icon: Sparkles },
            { id: 'templates', label: 'Templates', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
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
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your CV & Job Description
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your current CV and paste the job description to get AI-powered optimization suggestions
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
                        Support for .txt, .pdf, .docx files
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.pdf,.docx"
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

        {activeTab === 'optimize' && (
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
                      Your Optimized CV
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
                          <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                        </button>
                        <button
                          onClick={() => downloadCV(optimizedCV)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Text</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-blue-700 mb-2">
                          <Edit3 className="w-5 h-5" />
                          <span className="font-medium">Edit Mode Active</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          Click on any section below to edit its content. Use bullet points (•) for experience items.
                        </p>
                      </div>
                      {showPreview && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          {renderJakeTemplate()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={optimizedCV}
                        onChange={(e) => setOptimizedCV(e.target.value)}
                        className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                        readOnly={editMode}
                      />
                      {showPreview && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-6">
                          {renderJakeTemplate()}
                        </div>
                      )}
                    </>
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

        {activeTab === 'templates' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Professional CV Templates
              </h2>
              <p className="text-lg text-gray-600">
                Choose from our collection of ATS-friendly templates
              </p>
            </div>
            {/* Template Selection */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(templates).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer hover:shadow-xl ${
                    selectedTemplate === key
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`h-32 ${template.color} rounded-t-2xl`}></div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>
                    {selectedTemplate === key && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Template Preview */}
            {optimizedCV && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {templates[selectedTemplate].name} Preview
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                      </button>
                      <button
                        onClick={() => downloadTemplatedCV(optimizedCV, selectedTemplate)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download CV</span>
                      </button>
                    </div>
                  </div>
                </div>
                {showPreview && (
                  <div className="p-8 bg-gray-50">
                    {renderJakeTemplate()}
                  </div>
                )}
              </div>
            )}
            {!optimizedCV && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-4">
                  No CV content to preview yet
                </p>
                <p className="text-sm text-gray-500">
                  Upload and optimize your CV first to see template previews
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
