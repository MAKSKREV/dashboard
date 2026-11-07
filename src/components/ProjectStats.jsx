import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import MetricCard from './MetricCard';

export default function ProjectStats({ projectId }) {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topVideos, setTopVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [projectId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, timelineRes, topRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}/stats`),
        axios.get(`/api/projects/${projectId}/timeline`),
        axios.get(`/api/projects/${projectId}/top-videos`)
      ]);

      setStats(statsRes.data);
      setTimeline(timelineRes.data);
      setTopVideos(topRes.data);
    } catch (e) {
      console.error('Error fetching stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="stats loading">⏳ Загрузка статистики...</div>;
  }

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="stats">
      <div className="stats-header">
        <h2>{stats.name}</h2>
        <button onClick={fetchStats} className="btn-refresh">🔄 Обновить</button>
      </div>

      {/* Метрики */}
      <div className="metrics-grid">
        <MetricCard
          label="📹 Видео"
          value={stats.totalVideos}
          trend="+2 на этой неделе"
        />
        <MetricCard
          label="👁 Просмотры"
          value={stats.totalViews.toLocaleString()}
          trend={`+${Math.round(stats.totalViews * 0.12)} за неделю`}
        />
        <MetricCard
          label="👍 Лайки"
          value={stats.totalLikes.toLocaleString()}
          trend={`${stats.avgEngagement.toFixed(2)}% engagement`}
        />
        <MetricCard
          label="👥 Подписчики"
          value={stats.totalFollowers.toLocaleString()}
          trend="+45 на этой неделе"
        />
      </div>

      {/* Графики */}
      <div className="charts-grid">
        {/* График просмотров и лайков */}
        <div className="chart-container">
          <h3>📈 Просмотры и лайки</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ background: '#1f1f1f', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Просмотры"
              />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Лайки"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Топ видео */}
        <div className="chart-container">
          <h3>🏆 Топ 5 видео</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topVideos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="rank" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ background: '#1f1f1f', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="views" fill="#3b82f6" name="Просмотры" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица топ видео */}
      <div className="top-videos">
        <h3>🎬 Лучшие видео</h3>
        <table className="videos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Название</th>
              <th>Просмотры</th>
              <th>Лайки</th>
              <th>Комментарии</th>
              <th>Engagement</th>
            </tr>
          </thead>
          <tbody>
            {topVideos.map(video => (
              <tr key={video.rank}>
                <td>#{video.rank}</td>
                <td>{video.title.substring(0, 30)}...</td>
                <td>{video.views.toLocaleString()}</td>
                <td>{video.likes.toLocaleString()}</td>
                <td>{video.comments.toLocaleString()}</td>
                <td className="engagement">{video.engagement}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
