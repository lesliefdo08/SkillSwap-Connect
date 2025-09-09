// Netlify Function wrapping the SkillSwap Connect API using Express
// This keeps hosting 100% free on Netlify
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Accept both "/api/*" and "/*" inside the function (defensive against varying base paths)
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api\//, '/');
  }
  next();
});

// In-memory data stores
const users = []; // { id, username, skillsOffered: [], skillsWanted: [] }
const sessions = []; // { id, fromId, toId, skill, time, status }
const messages = []; // { id, fromId, toId, text, time }
const thanksWall = []; // { id, from, to, message, time }
const badgesByUsername = {}; // username -> [badge]

function findMatches(user) {
  return users.filter(
    (u) =>
      u.id !== user.id &&
      u.skillsOffered?.some((skill) => user.skillsWanted?.includes(skill)) &&
      u.skillsWanted?.some((skill) => user.skillsOffered?.includes(skill))
  );
}

// Auth (simple username-based)
app.post('/auth', (req, res) => {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username required' });
  }
  let user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    user = { id: uuidv4(), username, skillsOffered: [], skillsWanted: [] };
    users.push(user);
  }
  res.json(user);
});

// Update profile
app.post('/profile', (req, res) => {
  const { id, skillsOffered = [], skillsWanted = [] } = req.body || {};
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.skillsOffered = Array.isArray(skillsOffered) ? skillsOffered : [];
  user.skillsWanted = Array.isArray(skillsWanted) ? skillsWanted : [];
  res.json(user);
});

// Get matches
app.get('/matches/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(findMatches(user));
});

// Create session request
app.post('/session', (req, res) => {
  const { fromId, toId, skill, time } = req.body || {};
  if (!fromId || !toId || !skill) return res.status(400).json({ error: 'fromId, toId and skill are required' });
  const session = { id: uuidv4(), fromId, toId, skill, time: time || Date.now(), status: 'pending' };
  sessions.push(session);
  res.json(session);
});

// Accept session
app.post('/session/accept', (req, res) => {
  const { sessionId } = req.body || {};
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.status = 'accepted';
  res.json(session);
});

// Messaging
app.post('/message', (req, res) => {
  const { fromId, toId, text } = req.body || {};
  if (!fromId || !toId || !text) return res.status(400).json({ error: 'fromId, toId and text are required' });
  const message = { id: uuidv4(), fromId, toId, text, time: Date.now() };
  messages.push(message);
  res.json(message);
});

app.get('/messages/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  const convo = messages.filter(
    (m) => (m.fromId === user1 && m.toId === user2) || (m.fromId === user2 && m.toId === user1)
  );
  res.json(convo);
});

// Sessions list for a user
app.get('/sessions/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const mine = sessions
    .filter((s) => s.fromId === id || s.toId === id)
    .map((s) => ({
      ...s,
      fromName: users.find((u) => u.id === s.fromId)?.username || 'Unknown',
      toName: users.find((u) => u.id === s.toId)?.username || 'Unknown',
    }));
  res.json(mine);
});

// Wall of Thanks
app.post('/thanks', (req, res) => {
  const { from, to, message } = req.body || {};
  if (!from || !to || !message) return res.status(400).json({ error: 'from, to and message are required' });
  thanksWall.push({ id: uuidv4(), from, to, message, time: Date.now() });
  res.json({ success: true });
});

app.get('/thanks', (_req, res) => {
  res.json(thanksWall);
});

// Badges & Leaderboard (keyed by username for simplicity)
app.post('/badge', (req, res) => {
  const { username, userId, badge } = req.body || {};
  const key = username || users.find((u) => u.id === userId)?.username;
  if (!key || !badge) return res.status(400).json({ error: 'username (or userId) and badge are required' });
  if (!badgesByUsername[key]) badgesByUsername[key] = [];
  // prevent duplicates (case-insensitive)
  if (!badgesByUsername[key].some((b) => b.toLowerCase() === String(badge).toLowerCase())) {
    badgesByUsername[key].push(badge);
  }
  res.json({ success: true });
});

// Remove a badge from a user
app.delete('/badge', (req, res) => {
  const { username, userId, badge } = req.body || {};
  const key = username || users.find((u) => u.id === userId)?.username;
  if (!key || !badge) return res.status(400).json({ error: 'username (or userId) and badge are required' });
  const list = badgesByUsername[key];
  if (!list) return res.json({ success: true });
  const before = list.length;
  badgesByUsername[key] = list.filter((b) => b.toLowerCase() !== String(badge).toLowerCase());
  return res.json({ success: true, removed: before !== badgesByUsername[key].length });
});

app.get('/leaderboard', (_req, res) => {
  // Combine users list with badges map so every user appears
  const usernames = new Set([...Object.keys(badgesByUsername), ...users.map((u) => u.username)]);
  const leaderboard = Array.from(usernames).map((username) => {
    const list = badgesByUsername[username] || [];
    const profile = users.find((u) => u.username === username);
    return {
      username,
      badges: list.length,
      badgesList: list,
      skillsOffered: profile?.skillsOffered || [],
      skillsWanted: profile?.skillsWanted || [],
    };
  });
  leaderboard.sort((a, b) => (b.badges - a.badges) || a.username.localeCompare(b.username));
  res.json(leaderboard);
});

// AI-powered suggestion (demo)
const allSkills = [
  'Guitar',
  'Cooking',
  'Coding',
  'Painting',
  'Yoga',
  'Photography',
  'Public Speaking',
  'Writing',
  'Chess',
  'Dancing',
];
app.get('/suggest', (_req, res) => {
  const suggestion = allSkills[Math.floor(Math.random() * allSkills.length)];
  res.json({ suggestion });
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
// Serve a lightweight OG card reference. For Netlify static, /og-card.png can point to /og-card.svg.
app.get('/.netlify/functions/api/og-card.png', (req, res) => {
  res.redirect(301, '/og-card.svg');
});

// Demo seed on cold start
function seedDemo() {
  const demoUsers = [
    { username: 'demo', teach: ['Coding', 'Chess'], learn: ['Guitar', 'Cooking'] },
    { username: 'alex', teach: ['Guitar', 'Photography'], learn: ['Coding', 'Public Speaking'] },
    { username: 'taylor', teach: ['Cooking', 'Writing'], learn: ['Photography', 'Chess'] },
    { username: 'sam', teach: ['Yoga', 'Public Speaking'], learn: ['Writing', 'Coding'] },
    { username: 'jordan', teach: ['Painting', 'Dancing'], learn: ['Yoga', 'Photography'] },
  ];
  demoUsers.forEach((d) => {
    let u = users.find((x) => x.username.toLowerCase() === d.username.toLowerCase());
    if (!u) {
      u = { id: uuidv4(), username: d.username, skillsOffered: [], skillsWanted: [] };
      users.push(u);
    }
    u.skillsOffered = d.teach;
    u.skillsWanted = d.learn;
  });
  // Badges
  badgesByUsername['alex'] = badgesByUsername['alex'] || [];
  ['Super Teacher','Helper','Mentor'].forEach((b) => {
    if (!badgesByUsername['alex'].some(x => x.toLowerCase() === b.toLowerCase())) badgesByUsername['alex'].push(b);
  });
  badgesByUsername['taylor'] = badgesByUsername['taylor'] || [];
  ['Fast Learner','Creative Chef'].forEach((b) => {
    if (!badgesByUsername['taylor'].some(x => x.toLowerCase() === b.toLowerCase())) badgesByUsername['taylor'].push(b);
  });
  badgesByUsername['demo'] = badgesByUsername['demo'] || [];
  ['Community Star'].forEach((b) => {
    if (!badgesByUsername['demo'].some(x => x.toLowerCase() === b.toLowerCase())) badgesByUsername['demo'].push(b);
  });
  badgesByUsername['sam'] = badgesByUsername['sam'] || [];
  ['Collaborator'].forEach((b) => {
    if (!badgesByUsername['sam'].some(x => x.toLowerCase() === b.toLowerCase())) badgesByUsername['sam'].push(b);
  });
  badgesByUsername['jordan'] = badgesByUsername['jordan'] || [];
  ['Rising Talent'].forEach((b) => {
    if (!badgesByUsername['jordan'].some(x => x.toLowerCase() === b.toLowerCase())) badgesByUsername['jordan'].push(b);
  });
  // Thanks
  if (thanksWall.length === 0) {
    thanksWall.push({ id: uuidv4(), from: 'demo', to: 'alex', message: 'Thanks for the awesome guitar session!', time: Date.now() });
    thanksWall.push({ id: uuidv4(), from: 'taylor', to: 'demo', message: 'Loved the coding tips!', time: Date.now() });
  }
  // Example sessions
  const demoUser = users.find((u) => u.username === 'demo');
  const alex = users.find((u) => u.username === 'alex');
  if (
    demoUser &&
    alex &&
    !sessions.find(
      (s) => (s.fromId === demoUser.id && s.toId === alex.id) || (s.fromId === alex.id && s.toId === demoUser.id)
    )
  ) {
    sessions.push({
      id: uuidv4(),
      fromId: demoUser.id,
      toId: alex.id,
      skill: 'Guitar',
      time: new Date(Date.now() + 3600000).toISOString(),
      status: 'accepted',
    });
  }
}

if (process.env.SEED !== 'false') {
  seedDemo();
}

module.exports.handler = serverless(app, { basePath: '/.netlify/functions/api' });
