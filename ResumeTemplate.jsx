import React from 'react';
import './styles/resume.css';

export default function ResumeTemplate({ data }) {
  if (!data) return null;

  const { name, contact, summary, skills, experience, education, projects } = data;

  return (
    <div className="resume">
      <h1>{name}</h1>
      <p className="contact">{contact}</p>

      {summary && (
        <>
          <h2>Summary</h2>
          <p>{summary}</p>
        </>
      )}

      {skills?.length > 0 && (
        <>
          <h2>Skills</h2>
          <ul className="skills">
            {skills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </>
      )}

      {experience?.length > 0 && (
        <>
          <h2>Experience</h2>
          {experience.map((job, idx) => (
            <div className="section" key={idx}>
              <strong>{job.title || 'Role'}</strong> — {job.company || 'Company'}
              <br />
              <em>{job.duration}</em>
              <ul>
                {(job.description || []).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {projects?.length > 0 && (
        <>
          <h2>Projects</h2>
          {projects.map((proj, idx) => (
            <div className="section" key={idx}>
              <strong>{proj.name}</strong> — <em>{proj.tech || ''}</em>
              <p>{proj.description}</p>
            </div>
          ))}
        </>
      )}

      {education?.length > 0 && (
        <>
          <h2>Education</h2>
          {education.map((edu, idx) => (
            <div className="section" key={idx}>
              <strong>{edu.degree}</strong> — {edu.institution}
              <br />
              <em>{edu.year}</em>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
