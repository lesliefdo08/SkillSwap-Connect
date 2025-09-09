import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
const ProfilePage = lazy(() => import('./ProfilePage'));
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

// Utilities
const toArray = (v) => (Array.isArray(v) ? v : []);

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
	max-width: 1200px;
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
	flex-direction: column;
	align-items: flex-start;
	gap: 6px;
	& img.wordmark { height: 64px; max-width: 100%; }
	@media (max-width: ${bp.md}) { & img.wordmark { height: 56px; } }
	@media (max-width: ${bp.sm}) { & img.wordmark { height: 48px; } }
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
	width: 100%;
	min-height: 120px;
	${p => p.$highlight ? `box-shadow: 0 0 0 3px rgba(253, 186, 116, 0.75), 0 10px 30px rgba(16,24,40,0.08);` : ''}
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
	padding: 12px 18px;
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
	width: 320px;
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

const BadgeChip = styled(SkillTag)`
	background: rgba(255, 159, 64, 0.18);
	color: ${colors.brandDark};
	position: relative;
`;
const ChipClose = styled.button`
	position: absolute;
	top: -6px;
	right: -6px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: none;
	background: #fff;
	color: ${colors.brandDark};
	box-shadow: 0 2px 6px rgba(0,0,0,0.15);
	cursor: pointer;
	line-height: 18px;
	font-size: 12px;
`;

const Row = styled.div`
	display: flex;
	align-items: center;
	gap: ${space(1.5)};
	flex-wrap: wrap;
	@media (max-width: ${bp.sm}) {
		gap: ${space(1)};
	}
`;

const Grid = styled.div`
	display: flex;
	flex-direction: column;
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

// Modal components
const Overlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
	padding: ${space(2)};
`;
const Dialog = styled.div`
	background: var(--card-bg);
	border-radius: 16px;
	width: 100%;
	max-width: 520px;
	box-shadow: 0 20px 60px rgba(16,24,40,0.25);
	padding: ${space(3)};
`;
const DialogTitle = styled.h3`
	margin: 0 0 ${space(2)};
	color: ${colors.brandDark};
`;
const DialogActions = styled.div`
	display: flex;
	gap: ${space(1)};
	justify-content: flex-end;
	margin-top: ${space(2)};
	flex-wrap: wrap;
`;
const Label = styled.label`
	display: block;
	font-size: 0.9rem;
	color: var(--muted);
	margin-bottom: 6px;
`;
const TextArea = styled.textarea`
	width: 100%;
	min-height: 92px;
	padding: 10px 12px;
	border-radius: 10px;
	border: 1px solid #F4C6A5;
	outline: none;
	resize: vertical;
`;
const spin = keyframes`
	to { transform: rotate(360deg); }
`;
const Spinner = styled.div`
	width: 22px; height: 22px;
	border-radius: 50%;
	border: 3px solid rgba(0,0,0,0.1);
	border-top-color: ${colors.brand1};
	animation: ${spin} 0.9s linear infinite;
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

// Minimal skeleton list generator to reduce repetition
function SkeletonList({ count = 4, widths = ['40%', '25%'] }) {
	return (
		<List>
			{Array.from({ length: count }).map((_, i) => (
				<ListItem key={i}>
					{widths.map((w, j) => <SkeletonLine key={j} $w={w} />)}
				</ListItem>
			))}
		</List>
	);
}

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
	font-size: 3.6rem;
	line-height: 1.15;
	padding-bottom: 4px;
	background: linear-gradient(90deg, ${colors.brand1}, ${colors.brand2});
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	@media (max-width: ${bp.sm}) {
		font-size: 2.4rem;
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
		const [dark, setDark] = useState(() => {
			try { return localStorage.getItem('ssc:dark') === '1'; } catch { return false; }
		});
		const [loadingThanks, setLoadingThanks] = useState(false);
		const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
		const [sessions, setSessions] = useState([]);
		const [loadingSessions, setLoadingSessions] = useState(false);
		const [stats, setStats] = useState({ users: 0, thanks: 0, badges: 0 });
		const [menuOpen, setMenuOpen] = useState(false);
		const [modal, setModal] = useState({ open: false, type: null, title: '', fields: {}, target: null, message: '' });
	const resetModal = () => setModal({ open: false, type: null, title: '', fields: {}, target: null, message: '' });
		const [route, setRoute] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
		const navigate = (path) => { if (typeof window !== 'undefined') { window.history.pushState({}, '', path); setRoute(path); } };
		useEffect(() => {
			const onPop = () => setRoute(window.location.pathname);
			window.addEventListener('popstate', onPop);
			return () => window.removeEventListener('popstate', onPop);
		}, []);

		const addToast = (text, tone = 'info') => {
			const id = Math.random().toString(36).slice(2);
			const color = tone === 'success' ? '#10B981' : tone === 'error' ? '#EF4444' : colors.brand2;
			setToasts(t => [...t, { id, text, color }]);
			setTimeout(() => setToasts(t => (Array.isArray(t) ? t.filter(x => x.id !== id) : [])), 3000);
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

		useEffect(() => {
			try { localStorage.setItem('ssc:dark', dark ? '1' : '0'); } catch {}
		}, [dark]);

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
				setModal({ open: true, type: 'loading', title: 'Loading demo data…', fields: {}, target: null, message: 'Seeding users…' });
				// Create users and set profiles
				const created = [];
				for (const d of demoUsers) {
					const res = await fetch(`${API}/auth`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: d.username }) });
					const u = await res.json();
					created.push(u);
					await fetch(`${API}/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, skillsOffered: d.teach, skillsWanted: d.learn }) });
				}
				setModal(m => ({ ...m, message: 'Adding badges…' }));
				// Add some badges
				await fetch(`${API}/badge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'alex', badge: 'Super Teacher' }) });
				await fetch(`${API}/badge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'alex', badge: 'Helper' }) });
				await fetch(`${API}/badge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'taylor', badge: 'Fast Learner' }) });
				setModal(m => ({ ...m, message: 'Posting thanks…' }));
				// Wall of Thanks examples
				await fetch(`${API}/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'demo', to: 'alex', message: 'Thanks for the awesome guitar session!' }) });
				await fetch(`${API}/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'taylor', to: 'demo', message: 'Loved the coding tips!' }) });
				// Refresh lists
				fetchThanks();
				fetchLeaderboard();
				setModal({ open: true, type: 'done', title: 'Demo data loaded', fields: {}, target: null, message: 'Try usernames: demo, alex, taylor, sam, jordan' });
			} catch (e) {
				console.error(e);
				setModal({ open: true, type: 'done', title: 'Failed to load demo data', fields: {}, target: null, message: 'Please retry.' });
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
				try { localStorage.setItem('ssc:lastUser', data.username); } catch {}
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
		const data = await res.json();
		setMatches(toArray(data));
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
				const data = await res.json();
				setThanksWall(toArray(data));
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
				const data = await res.json();
				setSessions(toArray(data));
			} catch (e) {
				addToast('Could not load sessions', 'error');
			} finally {
				setLoadingSessions(false);
			}
		};

		const openSessionModal = (toUser) => {
			const now = new Date();
			const pad = (n) => String(n).padStart(2, '0');
			const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
			setModal({ open: true, type: 'session', title: `Propose session with ${toUser.username}`, fields: { skill: '', time: local }, target: toUser, message: '' });
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
				const safe = toArray(data);
				setLeaderboard(safe);
				setStats(s => ({ ...s, badges: safe.reduce((sum, r) => sum + (r.badges || 0), 0) }));
			} catch (e) {
				addToast('Could not load leaderboard', 'error');
			} finally {
				setLoadingLeaderboard(false);
			}
	};

	// Badge suggestions helper (deduped and limited)
	const badgeSuggestions = (l) => {
		const suggestions = ['Team Player','Problem Solver','Great Mentor'];
		const skillBased = [
			...toArray(l.skillsOffered).map(s => `${s} Mentor`),
			...toArray(l.skillsWanted).map(s => `Learning ${s}`)
		];
		return Array.from(new Set([...suggestions, ...skillBased])).slice(0, 3);
	};

	useEffect(() => {
		fetchThanks();
		fetchLeaderboard();
		fetchSessions();
		// auto-fill last user
		try {
			const last = localStorage.getItem('ssc:lastUser');
			if (last && !user) setUsername(last);
		} catch {}
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
	const openThanksModal = (to) => {
		setModal({ open: true, type: 'thanks', title: `Send thanks to ${to}`, fields: { message: '' }, target: to, message: '' });
	};

	const confirmModal = async () => {
		if (!modal.open) return;
		try {
			if (modal.type === 'thanks') {
				const res = await fetch(`${API}/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: user.username, to: modal.target, message: modal.fields.message }) });
				if (!res.ok) throw new Error('Could not post thanks');
				addToast('Shared your thanks!', 'success');
				fetchThanks();
			}
			if (modal.type === 'session') {
				// validate
				if (!modal.fields.skill?.trim()) throw new Error('Please enter a skill');
				const when = new Date(modal.fields.time);
				if (isNaN(when.getTime())) throw new Error('Please choose a valid date and time');
				if (when.getTime() < Date.now()) throw new Error('Please choose a future time');
				const iso = when.toISOString();
				const res = await fetch(`${API}/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromId: user.id, toId: modal.target.id, skill: modal.fields.skill.trim(), time: iso }) });
				if (!res.ok) throw new Error('Could not create session');
				addToast('Session proposed', 'success');
				fetchSessions();
			}
			setModal({ open: false, type: null, title: '', fields: {}, target: null, message: '' });
		} catch (e) {
			addToast(e.message || 'Action failed', 'error');
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
							<img className="wordmark" src={dark ? "/logo-wordmark-dark.svg" : "/logo-wordmark.svg"} alt="SkillSwap Connect by Leslie Fernando" />
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
								{[
									{ label: 'Community', value: `${stats.users || 5}+` },
									{ label: 'Thank-yous', value: String(thanksWall.length) },
									{ label: 'Badges earned', value: String(leaderboard.reduce((sum, r) => sum + (r.badges || 0), 0)) },
								].map((s, i) => (
									<StatBox key={i}>
										<span style={{ color: colors.muted }}>{s.label}</span>
										<BigNumber>{s.value}</BigNumber>
									</StatBox>
								))}
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

				{/* Modal */}
				{modal.open && (
					<Overlay role="dialog" aria-modal="true" aria-label={modal.title}
						onKeyDown={(e) => {
							if (e.key === 'Escape') resetModal();
							if (e.key === 'Tab') {
								const focusable = e.currentTarget.querySelectorAll('button, [href], input, textarea');
								const first = focusable[0];
								const last = focusable[focusable.length - 1];
								if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
								else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
							}
						}}
						onClick={(e) => { if (e.target === e.currentTarget) resetModal(); }}>
						<Dialog onClick={(e) => e.stopPropagation()}>
							<DialogTitle>{modal.title}</DialogTitle>
							{modal.type === 'thanks' && (
								<div>
									<Label htmlFor="thanksMsg">Message</Label>
									<TextArea id="thanksMsg" value={modal.fields.message} onChange={(e) => setModal(m => ({ ...m, fields: { ...m.fields, message: e.target.value } }))} />
									<DialogActions>
										<GhostButton onClick={resetModal}>Cancel</GhostButton>
										<Button onClick={confirmModal}>Send</Button>
									</DialogActions>
								</div>
							)}
							{modal.type === 'session' && (
								<div>
									<Label htmlFor="skill">Skill</Label>
									<Input id="skill" value={modal.fields.skill} onChange={(e) => setModal(m => ({ ...m, fields: { ...m.fields, skill: e.target.value } }))} />
									<Label htmlFor="time" style={{ marginTop: space(1) }}>Date & time</Label>
									<Input id="time" type="datetime-local" value={modal.fields.time} onChange={(e) => setModal(m => ({ ...m, fields: { ...m.fields, time: e.target.value } }))} />
									<DialogActions>
										<GhostButton onClick={resetModal}>Cancel</GhostButton>
										<Button onClick={confirmModal}>Propose</Button>
									</DialogActions>
								</div>
							)}
							{modal.type === 'loading' && (
								<div style={{ display: 'flex', alignItems: 'center', gap: space(1) }}>
									<Spinner /> <span>{modal.message || 'Please wait…'}</span>
								</div>
							)}
							{modal.type === 'done' && (
								<div>
									<p style={{ marginTop: 0 }}>{modal.message}</p>
									<DialogActions>
										<Button onClick={resetModal}>Close</Button>
									</DialogActions>
								</div>
							)}
						</Dialog>
					</Overlay>
				)}
			</>
		);
	}

	// Dedicated Profile route
	if (route.startsWith('/profile')) {
		const uname = route.split('/')[2] || (user?.username || '');
		return (
			<>
				<GlobalStyle dark={dark} />
				<Suspense fallback={<div style={{ padding: 24 }}><span style={{ color: 'var(--muted)' }}>Loading profile…</span></div>}>
					<ProfilePage apiBase={API} currentUser={user} username={uname} dark={dark} goHome={() => navigate('/')} />
				</Suspense>
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
						<img className="wordmark" src={dark ? "/logo-wordmark-dark.svg" : "/logo-wordmark.svg"} alt="SkillSwap Connect by Leslie Fernando" />
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
										<MenuItem role="menuitem" onClick={() => { setMenuOpen(false); navigate(`/profile/${user.username}`); }}>Profile</MenuItem>
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
								{toArray(skillsOffered).length ? toArray(skillsOffered).map(skill => <SkillTag key={skill}>{skill}</SkillTag>) : <span style={{ color: colors.muted }}>None yet</span>}
							</div>
						</div>
						<div style={{ marginBottom: space(2) }}>
							<b>Skills you want to learn:</b>
							<div style={{ marginTop: space(1) }}>
								{toArray(skillsWanted).length ? toArray(skillsWanted).map(skill => <SkillTag key={skill}>{skill}</SkillTag>) : <span style={{ color: colors.muted }}>None yet</span>}
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
								{toArray(matches).map(m => {
									const initials = m.username.slice(0,2).toUpperCase();
									const hue = (m.username.charCodeAt(0) * 37) % 360;
									const bg = `hsl(${hue} 70% 50%)`;
									return (
										<ListItem key={m.id}>
											<div style={{ display: 'flex', alignItems: 'center', gap: space(1.25), flex: 1 }}>
												<Avatar $bg={bg} aria-hidden>{initials}</Avatar>
												<div>
													<div style={{ fontWeight: 600 }}>{m.username}</div>
													<div style={{ color: colors.muted, fontSize: '0.9rem' }}>Teaches: {toArray(m.skillsOffered).join(', ')}</div>
													<div style={{ color: colors.muted, fontSize: '0.9rem' }}>Wants: {toArray(m.skillsWanted).join(', ')}</div>
												</div>
											</div>
											<ActionRow>
												<Button aria-label={`Say thanks to ${m.username}`} onClick={() => openThanksModal(m.username)}>Thanks</Button>
												<GhostButton aria-label={`Propose session with ${m.username}`} onClick={() => openSessionModal(m)}>Propose</GhostButton>
											</ActionRow>
										</ListItem>
									);
								})}
							</List>
						)}
					</Card>

					<Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<SectionTitle>Sessions</SectionTitle>
						{loadingSessions ? (
							<SkeletonList count={4} widths={["40%","25%"]} />
						) : sessions.length === 0 ? (
							<p style={{ color: colors.muted, marginTop: 0 }}>No sessions yet. Propose one from the Matches section.</p>
						) : (
							<List>
								{toArray(sessions).map(s => (
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
						<div>
							{loadingThanks ? (
								<SkeletonList count={5} widths={["30%","50%"]} />
							) : thanksWall.length === 0 ? (
								<p style={{ color: colors.muted, marginTop: 0 }}>No shoutouts yet. Spread some kindness!</p>
							) : (
								<List>
									{toArray(thanksWall).map(t => (
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
							<SkeletonList count={4} widths={["40%","20%"]} />
						) : leaderboard.length === 0 ? (
							<p style={{ color: colors.muted, marginTop: 0 }}>No badges yet.</p>
			) : (
							<ol style={{ margin: 0, paddingLeft: space(3) }}>
								{toArray(leaderboard).map(l => {
																	const suggestions = ['Team Player','Problem Solver','Great Mentor'];
																	return (
																		<li key={l.username} style={{ marginBottom: space(1.5) }}>
																			<div style={{ display: 'flex', alignItems: 'center', gap: space(1) }}>
																				<Avatar $bg={'#F59E0B'} aria-hidden>{l.username.slice(0,2).toUpperCase()}</Avatar>
																				<span><b>{l.username}</b> – Badges: {l.badges}</span>
																			</div>
																													{Array.isArray(l.badgesList) && l.badgesList.length > 0 && (
																				<div style={{ marginTop: space(1), display: 'flex', flexWrap: 'wrap' }}>
																															{l.badgesList.map((bname, i) => (
																																<div key={i} style={{ position: 'relative', marginRight: space(1), marginBottom: space(1) }}>
																																	<BadgeChip>{bname}</BadgeChip>
																																	{user && l.username !== user.username && (
																																		<ChipClose aria-label={`Remove ${bname}`} title="Remove badge" onClick={async () => {
																																			try {
																																				await fetch(`${API}/badge`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: l.username, badge: bname }) });
																																				fetchLeaderboard();
																																				addToast('Badge removed', 'success');
																																			} catch {}
																																		}}>×</ChipClose>
																																	)}
																																</div>
																															))}
																				</div>
																			)}
																													{user && l.username !== user.username && (
																				<ActionRow style={{ marginTop: space(1) }}>
																					<InputSmall aria-label={`Badge for ${l.username}`} placeholder="Badge name" value={badge} onChange={e => setBadge(e.target.value)} />
																					<Button aria-label={`Award badge to ${l.username}`} onClick={() => awardBadge(l.username)}>Award</Button>
																															{badgeSuggestions(l).map(sug => (
																						<GhostButton key={sug} onClick={() => { setBadge(sug); setTimeout(() => awardBadge(l.username), 0); }}>+ {sug}</GhostButton>
																					))}
																				</ActionRow>
																			)}
																		</li>
																	);
																})}
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
					<ConfettiLayer aria-hidden>
						{Array.from({ length: 36 }).map((_, i) => {
							const angle = (i / 36) * Math.PI * 2;
							const distance = 180 + Math.random() * 120;
							const x = Math.cos(angle) * distance;
							const y = Math.sin(angle) * distance;
							const hue = Math.round((i / 36) * 360);
							return (
								<Particle
									key={i}
									initial={{ left: '50%', top: '10%', opacity: 1, x: 0, y: 0, rotate: 0 }}
									animate={{ x, y, rotate: 360, opacity: 0 }}
									transition={{ duration: 0.8, ease: 'ease-out' }}
									style={{ background: `hsl(${hue} 90% 55%)` }}
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
