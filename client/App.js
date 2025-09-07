import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const API = 'http://localhost:5000/api';

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  background: #fff8f0;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 32px 24px;
`;
const Title = styled.h1`
  font-size: 2.5rem;
  color: #f76b1c;
  margin-bottom: 0.5em;
`;
const Button = styled.button`
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  margin: 8px 0;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 8px #fda08555; }
`;
const Input = styled.input`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #fda085;
  margin: 0 8px 8px 0;
`;
const SkillTag = styled.span`
  background: #fda085;
  color: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  margin: 0 6px 6px 0;
  display: inline-block;
  font-size: 0.95em;
`;

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [matches, setMatches] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [thanksWall, setThanksWall] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badge, setBadge] = useState('');

  // Auth
  const handleLogin = async () => {
    const res = await fetch(`${API}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    setUser(data);
    setSkillsOffered(data.skillsOffered || []);
    setSkillsWanted(data.skillsWanted || []);
  };

  // Profile update
  const saveProfile = async () => {
    await fetch(`${API}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, skillsOffered, skillsWanted })
    });
    fetchMatches();
  };

  // Fetch matches
  const fetchMatches = async () => {
    const res = await fetch(`${API}/matches/${user.id}`);
    setMatches(await res.json());
  };

  // Suggest skill
  const getSuggestion = async () => {
    const res = await fetch(`${API}/suggest`);
    const data = await res.json();
    setSuggestion(data.suggestion);
  };

  // Wall of Thanks
  const fetchThanks = async () => {
    const res = await fetch(`${API}/thanks`);
    setThanksWall(await res.json());
  };

  // Leaderboard
  const fetchLeaderboard = async () => {
    const res = await fetch(`${API}/leaderboard`);
    setLeaderboard(await res.json());
  };

  useEffect(() => {
    fetchThanks();
    fetchLeaderboard();
  }, []);

  // Add skill
  const addSkill = (type) => {
    if (!skillInput.trim()) return;
    if (type === 'offered' && !skillsOffered.includes(skillInput)) setSkillsOffered([...skillsOffered, skillInput]);
    if (type === 'wanted' && !skillsWanted.includes(skillInput)) setSkillsWanted([...skillsWanted, skillInput]);
    setSkillInput('');
  };

  // Wall of Thanks submit
  const sendThanks = async (to) => {
    const message = prompt('Say thanks!');
    if (!message) return;
    await fetch(`${API}/thanks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: user.username, to, message })
    });
    fetchThanks();
  };

  // Award badge
  const awardBadge = async (userId) => {
    if (!badge) return;
    await fetch(`${API}/badge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, badge })
    });
    setBadge('');
    fetchLeaderboard();
  };

  if (!user) {
    return (
      <Container as={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <Title>SkillSwap Connect</Title>
        <p>Connect, teach, and learn new skills with others!</p>
        <Input placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />
        <Button onClick={handleLogin}>Enter</Button>
      </Container>
    );
  }

  return (
    <Container as={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
      <Title>Welcome, {user.username}!</Title>
      <h2>Your Profile</h2>
      <div>
        <b>Skills you can teach:</b>
        {skillsOffered.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
        <br />
        <b>Skills you want to learn:</b>
        {skillsWanted.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
        <br />
        <Input placeholder="Add skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} />
        <Button onClick={() => addSkill('offered')}>Add to Teach</Button>
        <Button onClick={() => addSkill('wanted')}>Add to Learn</Button>
        <br />
        <Button onClick={saveProfile}>Save Profile</Button>
        <Button onClick={getSuggestion}>Suggest a Skill</Button>
        {suggestion && <span style={{ marginLeft: 12, color: '#f76b1c' }}>Try: {suggestion}</span>}
      </div>
      <h2>Skill Matches</h2>
      {matches.length === 0 ? <p>No matches yet. Update your skills!</p> : (
        <ul>
          {matches.map(m => (
            <li key={m.id}>
              <b>{m.username}</b> | Teaches: {m.skillsOffered.join(', ')} | Wants: {m.skillsWanted.join(', ')}
              <Button onClick={() => sendThanks(m.username)}>Say Thanks</Button>
            </li>
          ))}
        </ul>
      )}
      <h2>Wall of Thanks</h2>
      <div style={{ maxHeight: 120, overflowY: 'auto', background: '#fff3e0', borderRadius: 8, padding: 8 }}>
        {thanksWall.map(t => (
          <div key={t.id} style={{ marginBottom: 6 }}>
            <b>{t.from}</b> → <b>{t.to}</b>: {t.message}
          </div>
        ))}
      </div>
      <h2>Leaderboard</h2>
      <ol>
        {leaderboard.map(l => (
          <li key={l.username}>
            {l.username} – Badges: {l.badges}
            {l.username !== user.username && (
              <span>
                <Input placeholder="Badge name" value={badge} onChange={e => setBadge(e.target.value)} style={{ width: 90 }} />
                <Button onClick={() => awardBadge(l.username)}>Award</Button>
              </span>
            )}
          </li>
        ))}
      </ol>
    </Container>
  );
}

export default App;
