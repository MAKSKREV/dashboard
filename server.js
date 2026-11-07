import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Читаем данные из reels-studio
const getStudioData = () => {
  try {
    const dbPath = path.join(__dirname, '../reels-studio/data/db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      return data;
    }
  } catch (e) {
    console.error('Error reading studio data:', e.message);
  }
  return null;
};

// API: Все проекты
app.get('/api/projects', (req, res) => {
  const data = getStudioData();
  if (data && data.projects) {
    res.json(data.projects);
  } else {
    res.json([]);
  }
});

// API: Статистика проекта
app.get('/api/projects/:id/stats', (req, res) => {
  const data = getStudioData();
  const project = data?.projects?.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Формируем статистику из постов
  const stats = {
    id: project.id,
    name: project.name,
    totalVideos: project.posts?.length || 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: project.followers || 0,
    avgEngagement: 0,
    posts: (project.posts || []).map(post => ({
      id: post.id,
      title: post.title,
      theme: post.theme,
      createdAt: post.createdAt,
      status: post.status,
      metrics: {
        views: post.metrics?.views || 0,
        likes: post.metrics?.likes || 0,
        comments: post.metrics?.comments || 0,
        shares: post.metrics?.shares || 0,
      }
    }))
  };

  // Суммируем метрики
  stats.posts.forEach(p => {
    stats.totalViews += p.metrics.views;
    stats.totalLikes += p.metrics.likes;
    stats.totalComments += p.metrics.comments;
  });

  stats.avgEngagement = stats.totalViews > 0
    ? Math.round(((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100 * 100) / 100
    : 0;

  res.json(stats);
});

// API: История публикаций (для графиков)
app.get('/api/projects/:id/timeline', (req, res) => {
  const data = getStudioData();
  const project = data?.projects?.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const timeline = (project.posts || [])
    .filter(p => p.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(p => ({
      date: new Date(p.createdAt).toLocaleDateString('ru-RU'),
      views: p.metrics?.views || 0,
      likes: p.metrics?.likes || 0,
      engagement: ((p.metrics?.likes + p.metrics?.comments || 0) / (p.metrics?.views || 1) * 100).toFixed(2),
      title: p.title
    }));

  res.json(timeline);
});

// API: Топ видео по просмотрам
app.get('/api/projects/:id/top-videos', (req, res) => {
  const data = getStudioData();
  const project = data?.projects?.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const topVideos = (project.posts || [])
    .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      title: p.title,
      views: p.metrics?.views || 0,
      likes: p.metrics?.likes || 0,
      comments: p.metrics?.comments || 0,
      engagement: (((p.metrics?.likes || 0) + (p.metrics?.comments || 0)) / (p.metrics?.views || 1) * 100).toFixed(2)
    }));

  res.json(topVideos);
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard server running at http://localhost:${PORT}`);
  console.log(`   Checking for studio data at ../reels-studio/data/db.json`);
});
