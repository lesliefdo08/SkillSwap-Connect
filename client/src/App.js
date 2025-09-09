import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// API base:
// - Dev: CRA proxy forwards '/api' to localhost:5000
// - Netlify prod: prefer relative '/api' so requests hit the free Netlify Function
// - Other prod hosts: allow overriding via REACT_APP_API_URL
const isNetlifyHost = typeof window !== 'undefined' && /netlify\.(app|dev)$/.test(window.location.hostname);
const API = isNetlifyHost
	? '/api'
	: (process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api');

// Design tokens
const colors = {
	bg: '#FFF7F2',
	brand1: '#F97316', // orange-500
	brand2: '#FDBA74', // orange-300
	brandDark: '#C2410C',
	ink: '#1F2937',
	muted: '#6B7280',
	card: '#FFFFFF',
	accent: '#7C3AED'
};
const space = (n) => `${n * 8}px`;
const bp = {
	sm: '480px',
	md: '768px',
	lg: '1024px'
};

const GlobalStyle = createGlobalStyle`
	:root {
		--radius: 16px;
		--card-bg: ${p => p.dark ? '#0F172A' : '#FFFFFF'};
		--muted: ${p => p.dark ? '#9CA3AF' : '#6B7280'};
		--border: ${p => p.dark ? 'rgba(255,255,255,0.08)' : '#F4DFD0'};
	}
	body {
		margin: 0;
		font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
		color: 
			${p => p.dark ? '#E5E7EB' : colors.ink};
		background: ${p => p.dark
			? 'radial-gradient(1000px 600px at -10% -10%, #0F172A 0%, transparent 50%), radial-gradient(1000px 600px at 110% -10%, #0B1220 0%, transparent 50%), linear-gradient(120deg, #0B1020 0%, #0F1628 100%)'
			: 'radial-gradient(1200px 600px at -10% -10%, #FFEAD5 0%, transparent 50%), radial-gradient(1000px 600px at 110% -10%, #FEF3C7 0%, transparent 50%), linear-gradient(120deg, #FFF7F2 0%, #FFF1E8 100%)'};
	}
	* { box-sizing: border-box; }
`;

const Shell = styled.div`
	max-width: 1080px;
	margin: ${space(5)} auto;
	padding: 0 ${space(3)};
	position: relative;
	z-index: 1;
	@media (max-width: ${bp.sm}) {
		margin: ${space(2)} auto;
		padding: 0 ${space(2)};
	}
`;

const HeaderBar = styled(motion.header)`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: ${space(3)};
	@media (max-width: ${bp.sm}) {
		flex-direction: column;
		align-items: flex-start;
		gap: ${space(1)};
	}
`;
const Brand = styled.div`
	display: flex;
	align-items: baseline;
	gap: ${space(1)};
`;
const Title = styled.h1`
	margin: 0;
	font-size: 2rem;
	letter-spacing: 0.2px;
	background: linear-gradient(90deg, ${colors.brand1}, ${colors.brand2});
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	@media (max-width: ${bp.sm}) {
		font-size: 1.6rem;
	}
`;
const SubTitle = styled.span`
	color: var(--muted);
	font-size: 0.95rem;
`;

const Card = styled(motion.section)`
	background: var(--card-bg);
	border-radius: var(--radius);
	box-shadow: 0 10px 30px rgba(16, 24, 40, 0.08);
	padding: ${space(3)};
	@media (max-width: ${bp.sm}) {
		padding: ${space(2)};
	}
`;

const SectionTitle = styled.h2`
	margin: 0 0 ${space(2)};
	font-size: 1.25rem;
	color: ${colors.brandDark};
`;

const Button = styled.button`
	background: linear-gradient(90deg, ${colors.brand1}, ${colors.brand2});
	color: #fff;
	border: 0;
	border-radius: 10px;
	padding: 10px 18px;
	font-size: 0.95rem;
	cursor: pointer;
	transition: transform .06s ease, box-shadow .2s ease;
	box-shadow: 0 6px 16px rgba(253, 186, 116, 0.35);
	&:hover { transform: translateY(-1px); }
	&:active { transform: translateY(0); }
	@media (max-width: ${bp.sm}) {
		width: 100%;
	}
`;
const GhostButton = styled(Button)`
	background: transparent;
	color: ${colors.brand1};
	border: 1px solid ${colors.brand2};
	box-shadow: none;
`;

const Input = styled.input`
	padding: 10px 12px;
	border-radius: 10px;
	border: 1px solid #F4C6A5;
	outline: none;
	min-width: 220px;
	@media (max-width: ${bp.sm}) {
		min-width: 0;
		width: 100%;
	}
`;

const InputSmall = styled(Input)`
	min-width: auto;
	width: 120px;
	@media (max-width: ${bp.sm}) {
		width: 100%;
	}
`;

const SkillTag = styled.span`
	background: ${colors.brand2};
	color: #512D0E;
	border-radius: 999px;
	padding: 6px 12px;
	margin: 0 ${space(1)} ${space(1)} 0;
	display: inline-flex;
	align-items: center;
	gap: ${space(1)};
	font-size: 0.9rem;
	@media (max-width: ${bp.sm}) {
		font-size: 0.85rem;
	}
`;

const Row = styled.div`
	display: flex;
	align-items: center;
	gap: ${space(1.5)};
	flex-wrap: wrap;
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: ${space(3)};
	@media (max-width: ${bp.sm}) {
		gap: ${space(2)};
	}
`;

const List = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`;

const ListItem = styled.li`
	padding: 10px 0;
	border-bottom: 1px dashed var(--border);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${space(2)};
	@media (max-width: ${bp.sm}) {
		flex-direction: column;
		align-items: stretch;
		gap: ${space(1)};
	}
`;

const Avatar = styled.div`
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: ${p => p.$bg || colors.brand2};
	color: #fff;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 0.9rem;
	flex-shrink: 0;
	@media (max-width: ${bp.sm}) {
		width: 32px;
		height: 32px;
		font-size: 0.85rem;
	}
`;

// Toasts
const ToastWrap = styled.div`
	position: fixed;
	top: ${space(2.5)};
	right: ${space(2.5)};
	display: flex;
	flex-direction: column;
	gap: ${space(1)};
	z-index: 1000;
	@media (max-width: ${bp.sm}) {
		top: auto;
		right: 50%;
		bottom: ${space(2)};
		transform: translateX(50%);
		width: calc(100% - ${space(4)});
	}
`;
const ToastItem = styled(motion.div)`
	background: #111827;
	color: #fff;
	border-radius: 12px;
	padding: 10px 14px;
	box-shadow: 0 10px 30px rgba(0,0,0,0.3);
	font-size: 0.95rem;
	display: flex;
	align-items: center;
	gap: ${space(1)};
`;
const Dot = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: ${p => p.color || colors.brand2};
`;

// Confetti
const ConfettiLayer = styled.div`
	position: fixed;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
`;
const Particle = styled(motion.span)`
	position: absolute;
	width: 8px;
	height: 8px;
	border-radius: 2px;
`;

// Skeletons
const shimmer = keyframes`
	0% { background-position: -200px 0; }
	100% { background-position: calc(200px + 100%) 0; }
`;
const SkeletonLine = styled.div`
	height: ${p => p.$h || '12px'};
	width: ${p => p.$w || '100%'};
	border-radius: 6px;
	background: linear-gradient(90deg, #eee 0, #f5f5f5 40%, #eee 80%);
	background-size: 200px 100%;
	animation: ${shimmer} 1.2s ease-in-out infinite;
`;

const Footer = styled.footer`
  margin: ${space(3)} 0 ${space(1)};
  text-align: center;
  color: ${colors.muted};
  font-size: 0.85rem;
`;

// Hero (login) layout
const Hero = styled.div`
	position: relative;
	min-height: calc(100vh - ${space(10)});
	display: grid;
	grid-template-columns: 1.2fr 1fr;
	gap: ${space(3)};
	align-items: center;
	@media (max-width: ${bp.md}) {
		grid-template-columns: 1fr;
		min-height: auto;
	}
`;
const BigTitle = styled.h1`
	margin: 0 0 ${space(1)};
	font-size: 3rem;
	line-height: 1.1;
	background: linear-gradient(90deg, ${colors.brand1}, ${colors.brand2});
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	@media (max-width: ${bp.sm}) {
		font-size: 2.2rem;
	}
`;
const Tagline = styled.p`
	margin-top: 0;
	color: var(--muted);
	font-size: 1.1rem;
`;
const HeroActions = styled.div`
	display: flex;
	align-items: center;
	gap: ${space(1)};
	flex-wrap: wrap;
`;
const StatBar = styled.div`
	margin-top: ${space(3)};
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: ${space(2)};
	@media (max-width: ${bp.sm}) {
		grid-template-columns: 1fr;
	}
`;
const StatBox = styled.div`
	background: var(--card-bg);
	border-radius: 14px;
	padding: ${space(2)};
	box-shadow: 0 10px 30px rgba(16,24,40,0.08);
	display: flex;
	flex-direction: column;
	gap: ${space(0.5)};
`;
const BigNumber = styled.span`
	font-size: 1.8rem;
	font-weight: 800;
	color: ${colors.brandDark};
`;
const Blob = styled.div`
	position: absolute;
	width: 420px;
	height: 420px;
	border-radius: 50%;
	filter: blur(60px);
	opacity: 0.35;
	z-index: -1;
	will-change: transform;
`;

// Gentle float animation for background blobs (hero)
const float = keyframes`
	0%   { transform: translateY(0) translateX(0); }
	50%  { transform: translateY(-14px) translateX(8px); }
	100% { transform: translateY(10px) translateX(-8px); }
`;

const FloatyBlob = styled(Blob)`
	animation: ${float} 12s ease-in-out infinite alternate;
`;

// Profile dropdown (auth header)
const ProfileWrap = styled.div`
	position: relative;
`;
const ProfileButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: ${space(1)};
	background: transparent;
	border: 1px solid ${colors.brand2};
	color: ${colors.brand1};
	border-radius: 999px;
	padding: 6px 10px 6px 6px;
	cursor: pointer;
`;
const Caret = styled.span`
	font-size: 0.8rem;
	color: ${colors.muted};
`;
const Menu = styled.div`
	position: absolute;
	right: 0;
	top: calc(100% + 8px);
	background: #fff;
	box-shadow: 0 10px 30px rgba(16,24,40,0.14);
	border-radius: 12px;
	padding: 6px;
	min-width: 160px;
	z-index: 1001;
`;
const MenuItem = styled.button`
	width: 100%;
	display: block;
	text-align: left;
	background: transparent;
	border: 0;
	padding: 10px 12px;
	border-radius: 8px;
	cursor: pointer;
	color: ${colors.ink};
	&:hover { background: #FAFAFA; }
`;
const Backdrop = styled.div`
	position: fixed; inset: 0; background: transparent; z-index: 1000;
`;

// Action row for list items (wrap nicely on phones)
const ActionRow = styled.div`
	display: flex;
	gap: ${space(1)};
	flex-wrap: wrap;
	justify-content: flex-end;
	@media (max-width: ${bp.sm}) {
		width: 100%;
		justify-content: stretch;
		& > ${Button}, & > ${GhostButton} { width: 100%; }
	}
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
		const [toasts, setToasts] = useState([]);
		const [confetti, setConfetti] = useState(false);
		const [dark, setDark] = useState(false);
		const [loadingThanks, setLoadingThanks] = useState(false);
		const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
		const [sessions, setSessions] = useState([]);
		const [loadingSessions, setLoadingSessions] = useState(false);
		const [stats, setStats] = useState({ users: 0, thanks: 0, badges: 0 });
		const [menuOpen, setMenuOpen] = useState(false);

		const addToast = (text, tone = 'info') => {
			const id = Math.random().toString(36).slice(2);
			const color = tone === 'success' ? '#10B981' : tone === 'error' ? '#EF4444' : colors.brand2;
			setToasts(t => [...t, { id, text, color }]);
			setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
		};

		const burstConfetti = () => {
			setConfetti(true);
			setTimeout(() => setConfetti(false), 800);
		};

		const logout = () => {
			setUser(null);
			setUsername('');
			setSkillsOffered([]);
			setSkillsWanted([]);
			setMatches([]);
			setSessions([]);
			addToast('Logged out', 'info');
		};

		// Demo data seeding
		const demoUsers = [
			{ username: 'demo', teach: ['Coding', 'Chess'], learn: ['Guitar', 'Cooking'] },
			{ username: 'alex', teach: ['Guitar', 'Photography'], learn: ['Coding', 'Public Speaking'] },
			{ username: 'taylor', teach: ['Cooking', 'Writing'], learn: ['Photography', 'Chess'] },
			{ username: 'sam', teach: ['Yoga', 'Public Speaking'], learn: ['Writing', 'Coding'] },
			{ username: 'jordan', teach: ['Painting', 'Dancing'], learn: ['Yoga', 'Photography'] },
		];

		const loadDemoData = async () => {
			try {
				// Create users and set profiles
				const created = [];
				for (const d of demoUsers) {
					const res = await fetch(`${API}/auth`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: d.username }) });
					const u = await res.json();
					created.push(u);
					await fetch(`${API}/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, skillsOffered: d.teach, skillsWanted: d.learn }) });
				}
				// Add some badges
				await fetch(`${API}/badge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'alex', badge: 'Super Teacher' }) });
				await fetch(`${API}/badge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'alex', badge: 'Helper' }) });
				await fetch(`${API}/badge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'taylor', badge: 'Fast Learner' }) });
				// Wall of Thanks examples
				await fetch(`${API}/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'demo', to: 'alex', message: 'Thanks for the awesome guitar session!' }) });
				await fetch(`${API}/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'taylor', to: 'demo', message: 'Loved the coding tips!' }) });
				// Refresh lists
				fetchThanks();
				fetchLeaderboard();
				alert('Demo data loaded. Try usernames: demo, alex, taylor, sam, jordan');
			} catch (e) {
				console.error(e);
				alert('Failed to load demo data');
			}
		};

	// Auth
	const handleLogin = async () => {
			try {
				const res = await fetch(`${API}/auth`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })
				});
				if (!res.ok) throw new Error('Failed to sign in');
				const data = await res.json();
				setUser(data);
				setSkillsOffered(data.skillsOffered || []);
				setSkillsWanted(data.skillsWanted || []);
				addToast(`Welcome ${data.username}!`, 'success');
			} catch (e) {
				addToast(e.message || 'Login error', 'error');
			}
	};

	// Profile update
	const saveProfile = async () => {
			try {
				const res = await fetch(`${API}/profile`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: user.id, skillsOffered, skillsWanted })
				});
				if (!res.ok) throw new Error('Could not save profile');
				addToast('Profile saved', 'success');
				burstConfetti();
				fetchMatches();
			} catch (e) {
				addToast(e.message || 'Save failed', 'error');
			}
	};

	// Fetch matches
	const fetchMatches = async () => {
		const res = await fetch(`${API}/matches/${user.id}`);
		setMatches(await res.json());
	};

	// Suggest skill
	const getSuggestion = async () => {
			try {
				const res = await fetch(`${API}/suggest`);
				if (!res.ok) throw new Error('Unable to suggest');
				const data = await res.json();
				setSuggestion(data.suggestion);
				addToast(`Suggestion: ${data.suggestion}`, 'info');
			} catch (e) {
				addToast(e.message || 'Suggestion failed', 'error');
			}
	};

	// Wall of Thanks
	const fetchThanks = async () => {
			try {
				setLoadingThanks(true);
				const res = await fetch(`${API}/thanks`);
				if (!res.ok) throw new Error('Failed to load thanks');
				setThanksWall(await res.json());
			} catch (e) {
				addToast('Could not load Wall of Thanks', 'error');
			} finally {
				setLoadingThanks(false);
			}
	};

		// Sessions
		const fetchSessions = async () => {
			if (!user) return;
			try {
				setLoadingSessions(true);
				const res = await fetch(`${API}/sessions/${user.id}`);
				if (!res.ok) throw new Error('Failed to load sessions');
				setSessions(await res.json());
			} catch (e) {
				addToast('Could not load sessions', 'error');
			} finally {
				setLoadingSessions(false);
			}
		};

		const proposeSession = async (toUser) => {
			const skill = prompt(`What skill for a session with ${toUser.username}?`);
			if (!skill) return;
			const time = prompt('When? (e.g., 2025-09-08 18:00)');
			try {
				const res = await fetch(`${API}/session`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ fromId: user.id, toId: toUser.id, skill, time })
				});
				if (!res.ok) throw new Error('Could not create session');
				addToast('Session proposed', 'success');
				fetchSessions();
			} catch (e) {
				addToast(e.message || 'Failed to propose session', 'error');
			}
		};

		const acceptSession = async (sessionId) => {
			try {
				const res = await fetch(`${API}/session/accept`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sessionId })
				});
				if (!res.ok) throw new Error('Could not accept session');
				addToast('Session accepted', 'success');
				burstConfetti();
				fetchSessions();
			} catch (e) {
				addToast(e.message || 'Failed to accept session', 'error');
			}
		};

	// Leaderboard
	const fetchLeaderboard = async () => {
			try {
				setLoadingLeaderboard(true);
				const res = await fetch(`${API}/leaderboard`);
				if (!res.ok) throw new Error('Failed to load leaderboard');
				const data = await res.json();
				setLeaderboard(data);
				setStats(s => ({ ...s, badges: data.reduce((sum, r) => sum + (r.badges || 0), 0) }));
			} catch (e) {
				addToast('Could not load leaderboard', 'error');
			} finally {
				setLoadingLeaderboard(false);
			}
	};

	useEffect(() => {
		fetchThanks();
		fetchLeaderboard();
		fetchSessions();
	}, []);

	// Load matches and sessions after user logs in
	useEffect(() => {
		if (!user) return;
		fetchMatches();
		fetchSessions();
	}, [user]);

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
			try {
				const res = await fetch(`${API}/thanks`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ from: user.username, to, message })
				});
				if (!res.ok) throw new Error('Could not post thanks');
				addToast('Shared your thanks!', 'success');
				fetchThanks();
			} catch (e) {
				addToast(e.message || 'Failed to send thanks', 'error');
			}
	};

	// Award badge
	const awardBadge = async (userId) => {
		if (!badge) return;
		try {
			const res = await fetch(`${API}/badge`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// backend accepts username or userId; we pass username for simplicity
				body: JSON.stringify({ username: userId, badge })
			});
			if (!res.ok) throw new Error('Could not award badge');
			setBadge('');
			addToast('Badge awarded!', 'success');
			burstConfetti();
			fetchLeaderboard();
		} catch (e) {
			addToast(e.message || 'Failed to award badge', 'error');
		}
	};

	// Login view
	if (!user) {
		return (
			<>
				<GlobalStyle dark={dark} />
				<Shell>
					<HeaderBar initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
						<Brand>
							<Title>SkillSwap Connect</Title>
							<SubTitle>Teach what you know. Learn what you love.</SubTitle>
						</Brand>
						<Row>
							<GhostButton aria-label="Toggle dark mode" onClick={() => setDark(d => !d)}>{dark ? '☀️ Light' : '🌙 Dark'}</GhostButton>
						</Row>
					</HeaderBar>

					<Hero>
						<div>
							<BigTitle>Learn faster. Teach better. Together.</BigTitle>
							<Tagline>Match with peers who want to learn what you teach — and teach what you want to learn.</Tagline>
							<HeroActions>
								<Input aria-label="Username" placeholder="Pick a username (e.g., demo)" value={username} onChange={e => setUsername(e.target.value)} />
								<Button aria-label="Enter app" onClick={handleLogin}>Get Started</Button>
								<GhostButton aria-label="Load demo data" onClick={loadDemoData}>Load Demo Data</GhostButton>
							</HeroActions>
							<StatBar>
								<StatBox>
									<span style={{ color: colors.muted }}>Community</span>
									<BigNumber>{stats.users || 5}+</BigNumber>
								</StatBox>
								<StatBox>
									<span style={{ color: colors.muted }}>Thank-yous</span>
									<BigNumber>{thanksWall.length}</BigNumber>
								</StatBox>
								<StatBox>
									<span style={{ color: colors.muted }}>Badges earned</span>
									<BigNumber>{leaderboard.reduce((sum, r) => sum + (r.badges || 0), 0)}</BigNumber>
								</StatBox>
							</StatBar>
						</div>
						<div style={{ position: 'relative' }}>
							<FloatyBlob style={{ left: -40, top: -10, background: '#FDE68A' }} />
							<FloatyBlob style={{ right: -60, bottom: -20, background: '#FDBA74', animationDelay: '0.6s' }} />
							<Card initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
								<SectionTitle>Why SkillSwap?</SectionTitle>
								<ul style={{ margin: 0, paddingLeft: space(3) }}>
									<li>Find perfect matches based on teach/learn goals</li>
									<li>Propose and accept learning sessions</li>
									<li>Share gratitude on the Wall of Thanks</li>
									<li>Earn badges and climb the leaderboard</li>
								</ul>
							</Card>
						</div>
					</Hero>

					<Footer>Major Project — Web Development Internship (VOC) | Leslie Fernando</Footer>
				</Shell>
				{/* Toasts */}
				<ToastWrap>
					{toasts.map(t => (
						<ToastItem key={t.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
							<Dot color={t.color} /> {t.text}
						</ToastItem>
					))}
				</ToastWrap>
			</>
		);
	}

	// Authenticated view
	return (
		<>
			<GlobalStyle dark={dark} />
			<Shell>
				<HeaderBar initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
					<Brand>
						<Title>Welcome, {user.username}!</Title>
						<SubTitle>Share your skills and match with peers</SubTitle>
					</Brand>
					<Row>
						<GhostButton aria-label="Toggle dark mode" onClick={() => setDark(d => !d)}>{dark ? '☀️ Light' : '🌙 Dark'}</GhostButton>
						<GhostButton aria-label="Suggest a skill" onClick={getSuggestion}>Suggest a Skill</GhostButton>
						{suggestion && <span style={{ color: colors.brandDark }}>Try: {suggestion}</span>}
						<ProfileWrap>
							<ProfileButton aria-label="Profile menu" onClick={() => setMenuOpen(o => !o)}>
								<Avatar $bg={'#F59E0B'} aria-hidden>{user.username.slice(0,2).toUpperCase()}</Avatar>
								<span>@{user.username}</span>
								<Caret>▾</Caret>
							</ProfileButton>
							{menuOpen && (
								<>
									<Backdrop onClick={() => setMenuOpen(false)} />
									<Menu role="menu" aria-label="Profile">
										<MenuItem role="menuitem" onClick={() => { setMenuOpen(false); addToast('Profile coming soon'); }}>Profile</MenuItem>
										<MenuItem role="menuitem" onClick={() => { setMenuOpen(false); logout(); }}>Logout</MenuItem>
									</Menu>
								</>
							)}
						</ProfileWrap>
					</Row>
				</HeaderBar>

				<Grid>
					<Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<SectionTitle>Your Profile</SectionTitle>
						<div style={{ marginBottom: space(1) }}>
							<b>Skills you can teach:</b>
							<div style={{ marginTop: space(1) }}>
								{skillsOffered.length ? skillsOffered.map(skill => <SkillTag key={skill}>{skill}</SkillTag>) : <span style={{ color: colors.muted }}>None yet</span>}
							</div>
						</div>
						<div style={{ marginBottom: space(2) }}>
							<b>Skills you want to learn:</b>
							<div style={{ marginTop: space(1) }}>
								{skillsWanted.length ? skillsWanted.map(skill => <SkillTag key={skill}>{skill}</SkillTag>) : <span style={{ color: colors.muted }}>None yet</span>}
							</div>
						</div>
						<Row>
							<Input aria-label="Add a skill" placeholder="Add a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} />
							<Button aria-label="Add skill to teach" onClick={() => addSkill('offered')}>Add to Teach</Button>
							<Button aria-label="Add skill to learn" onClick={() => addSkill('wanted')}>Add to Learn</Button>
						</Row>
						<Row style={{ marginTop: space(2) }}>
							<Button aria-label="Save profile" onClick={saveProfile}>Save Profile</Button>
						</Row>
					</Card>

					<Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<SectionTitle>Skill Matches</SectionTitle>
						{matches.length === 0 ? (
							<p style={{ color: colors.muted, marginTop: 0 }}>No matches yet. Add more skills and save your profile.</p>
						) : (
							<List>
								{matches.map(m => {
									const initials = m.username.slice(0,2).toUpperCase();
									const hue = (m.username.charCodeAt(0) * 37) % 360;
									const bg = `hsl(${hue} 70% 50%)`;
									return (
										<ListItem key={m.id}>
											<div style={{ display: 'flex', alignItems: 'center', gap: space(1.25), flex: 1 }}>
												<Avatar $bg={bg} aria-hidden>{initials}</Avatar>
												<div>
													<div style={{ fontWeight: 600 }}>{m.username}</div>
													<div style={{ color: colors.muted, fontSize: '0.9rem' }}>Teaches: {m.skillsOffered.join(', ')}</div>
													<div style={{ color: colors.muted, fontSize: '0.9rem' }}>Wants: {m.skillsWanted.join(', ')}</div>
												</div>
											</div>
											<div style={{ display: 'flex', gap: space(1) }}>
												<Button aria-label={`Say thanks to ${m.username}`} onClick={() => sendThanks(m.username)}>Thanks</Button>
												<GhostButton aria-label={`Propose session with ${m.username}`} onClick={() => proposeSession(m)}>Propose</GhostButton>
											</div>
										</ListItem>
									);
								})}
							</List>
						)}
					</Card>

					<Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<SectionTitle>Sessions</SectionTitle>
						{loadingSessions ? (
							<List>
								{Array.from({ length: 4 }).map((_, i) => (
									<ListItem key={i}>
										<SkeletonLine $w="40%" />
										<SkeletonLine $w="25%" />
									</ListItem>
								))}
							</List>
						) : sessions.length === 0 ? (
							<p style={{ color: colors.muted, marginTop: 0 }}>No sessions yet. Propose one from the Matches section.</p>
						) : (
							<List>
								{sessions.map(s => (
									<ListItem key={s.id}>
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 600 }}>{s.fromName} → {s.toName}</div>
											<div style={{ color: colors.muted, fontSize: '0.9rem' }}>Skill: {s.skill} • {new Date(s.time).toLocaleString()}</div>
										</div>
										{s.status === 'pending' ? (
											<Button aria-label={`Accept session ${s.id}`} onClick={() => acceptSession(s.id)}>Accept</Button>
										) : (
											<span style={{ color: '#10B981', fontWeight: 600 }}>Accepted</span>
										)}
									</ListItem>
								))}
							</List>
						)}
					</Card>

					<Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<SectionTitle>Wall of Thanks</SectionTitle>
						<div style={{ maxHeight: 200, overflowY: 'auto', paddingRight: space(1) }}>
							{loadingThanks ? (
								<List>
									{Array.from({ length: 5 }).map((_, i) => (
										<ListItem key={i}>
											<SkeletonLine $w="30%" />
											<SkeletonLine $w="50%" />
										</ListItem>
									))}
								</List>
							) : thanksWall.length === 0 ? (
								<p style={{ color: colors.muted, marginTop: 0 }}>No shoutouts yet. Spread some kindness!</p>
							) : (
								<List>
									{thanksWall.map(t => (
										<ListItem key={t.id}>
											<div style={{ display: 'flex', alignItems: 'center', gap: space(1), flex: 1 }}>
												<Avatar $bg={'#94A3B8'} aria-hidden>{t.from.slice(0,2).toUpperCase()}</Avatar>
												<div>
													<div><b>{t.from}</b> → <b>{t.to}</b></div>
													<div style={{ color: colors.muted }}>{t.message}</div>
												</div>
											</div>
											<span style={{ color: colors.muted, fontSize: '0.85rem' }}>{new Date(t.time).toLocaleString()}</span>
										</ListItem>
									))}
								</List>
							)}
						</div>
					</Card>

					<Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<SectionTitle>Leaderboard</SectionTitle>
						{loadingLeaderboard ? (
							<List>
								{Array.from({ length: 4 }).map((_, i) => (
									<ListItem key={i}>
										<SkeletonLine $w="40%" />
										<SkeletonLine $w="20%" />
									</ListItem>
								))}
							</List>
						) : leaderboard.length === 0 ? (
							<p style={{ color: colors.muted, marginTop: 0 }}>No badges yet.</p>
						) : (
							<ol style={{ margin: 0, paddingLeft: space(3) }}>
								{leaderboard.map(l => (
									<li key={l.username} style={{ marginBottom: space(1.5), display: 'flex', alignItems: 'center' }}>
										<Avatar $bg={'#F59E0B'} aria-hidden>{l.username.slice(0,2).toUpperCase()}</Avatar>
										<span style={{ marginLeft: space(1) }}><b>{l.username}</b> – Badges: {l.badges}</span>
										{l.username !== user.username && (
											<span style={{ marginLeft: space(1) }}>
												<InputSmall aria-label={`Badge for ${l.username}`} placeholder="Badge name" value={badge} onChange={e => setBadge(e.target.value)} />
												<Button aria-label={`Award badge to ${l.username}`} style={{ marginLeft: space(1) }} onClick={() => awardBadge(l.username)}>Award</Button>
											</span>
										)}
									</li>
								))}
							</ol>
						)}
					</Card>
				</Grid>

				<Footer>Major Project — Web Development Internship (VOC) | Leslie Fernando</Footer>

				{/* Toasts */}
				<ToastWrap>
					{toasts.map(t => (
						<ToastItem key={t.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
							<Dot color={t.color} /> {t.text}
						</ToastItem>
					))}
				</ToastWrap>

				{/* Confetti burst */}
				{confetti && (
					<ConfettiLayer>
						{Array.from({ length: 36 }).map((_, i) => {
							const left = 50; // center
							const top = 20;  // near header
							const angle = (i / 36) * Math.PI * 2;
							const distance = 200 + Math.random() * 120;
							const x = Math.cos(angle) * distance;
							const y = Math.sin(angle) * distance;
							const colorPool = ['#F59E0B','#84CC16','#10B981','#3B82F6','#A855F7','#EC4899'];
							const color = colorPool[i % colorPool.length];
							const delay = Math.random() * 0.1;
							return (
								<Particle key={i} style={{ left: `${left}%`, top: `${top}px`, background: color }}
									initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
									animate={{ opacity: 1, x, y, rotate: Math.random() * 360 }}
									transition={{ duration: 0.7, ease: 'easeOut', delay }}
								/>
							);
						})}
					</ConfettiLayer>
				)}
			</Shell>
		</>
	);
}

export default App;
