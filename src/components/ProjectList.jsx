import React from 'react';

export default function ProjectList({ projects, selectedId, onSelect }) {
  return (
    <div className="project-list">
      <h3>📱 Проекты</h3>
      <div className="project-items">
        {projects.map(project => (
          <button
            key={project.id}
            className={`project-item ${selectedId === project.id ? 'active' : ''}`}
            onClick={() => onSelect(project.id)}
          >
            <div className="project-icon">
              {project.niche === 'health' && '💪'}
              {project.niche === 'family' && '👨‍👩‍👧'}
              {project.niche === 'money' && '💰'}
              {project.niche === 'repair' && '🔧'}
              {project.niche === 'kids' && '👶'}
              {!project.niche && '📹'}
            </div>
            <div className="project-info">
              <span className="project-name">{project.name}</span>
              <span className="project-niche">{project.niche || 'Общее'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
