import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import ProjectList from './ProjectList';
import ProjectStats from './ProjectStats';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      if (res.data.length > 0) {
        setProjects(res.data);
        setSelectedProjectId(res.data[0].id);
      }
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard loading">⏳ Загрузка...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Reels Dashboard</h1>
        <p>Мониторинг динамики видео и подписчиков</p>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <ProjectList
            projects={projects}
            selectedId={selectedProjectId}
            onSelect={setSelectedProjectId}
          />
        </aside>

        <main className="main-content">
          {selectedProjectId && (
            <ProjectStats projectId={selectedProjectId} />
          )}
        </main>
      </div>
    </div>
  );
}
