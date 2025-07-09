export const buildPrompt = (resumeText, jd) => {
  return `
Your task is to tailor the following resume text to strongly match the given job description.

Respond ONLY in valid JSON (no natural text or preambles), matching this format:
{
  "name": "Full Name",
  "email": "example@email.com",
  "phone": "+91-XXXXX",
  "location": "City, Country",
  "linkedin": "https://linkedin.com/in/...",
  "github": "https://github.com/...",
  "skills": ["Skill1", "Skill2", ...],
  "education": [
    {
      "degree": "B.Tech in XYZ",
      "institution": "University Name",
      "duration": "2019 – 2023"
    }
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 – Present",
      "bullets": ["Accomplishment 1", "Accomplishment 2"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "tech": "React, Node.js",
      "bullets": ["Description point 1", "point 2"]
    }
  ]
}

Resume text:
${resumeText}

Job Description:
${jd}
  `;
};
