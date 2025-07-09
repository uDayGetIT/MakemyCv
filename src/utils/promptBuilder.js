export function buildPrompt(originalText, jobDescription) {
  return `
You are a professional resume assistant.

Given the user's original resume content (below) and a job description, tailor the resume to match the job description closely. Format the response as structured JSON with the following format:

{
  "name": "Full Name",
  "contact": {
    "email": "email@example.com",
    "phone": "123-456-7890",
    "linkedin": "linkedin.com/in/...",
    "github": "github.com/..."
  },
  "education": [
    {
      "degree": "B.Tech in Computer Science",
      "institution": "ABC University",
      "location": "City, Country",
      "date": "2019 – 2023"
    }
  ],
  "experience": [
    {
      "title": "Software Engineer Intern",
      "company": "XYZ Ltd.",
      "location": "City",
      "date": "May 2022 – July 2022",
      "details": [
        "Did something that matches the job",
        "Used relevant technologies",
        "Improved something with measurable results"
      ]
    }
  ],
  "projects": [
    {
      "name": "Awesome Project",
      "description": [
        "Built using React and Node.js",
        "Solved a real-world problem",
        "Had measurable results"
      ]
    }
  ],
  "skills": ["React", "Node.js", "Python", "SQL"]
}

Respond only with JSON. Do not include any other explanation.

Original Resume:
"""${originalText}"""

Job Description:
"""${jobDescription}"""
`;
}
