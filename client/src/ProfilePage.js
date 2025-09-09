import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const space = (n) => `${n * 8}px`;
const colors = {
  brand1: '#F97316',
  brand2: '#FDBA74',
  brandDark: '#C2410C',
  ink: '#1F2937',
  muted: '#6B7280',
};

const Shell = styled.div`
  max-width: 1000px;
  margin: ${space(5)} auto;
  padding: 0 ${space(3)};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${space(2)}; margin-bottom: ${space(2)};
`;
const Title = styled.h1`
  margin: 0; font-size: 1.6rem; color: ${colors.brandDark};
`;
const Button = styled.button`
  background: linear-gradient(90deg, ${colors.brand1}, ${colors.brand2});
  color: #fff; border: 0; border-radius: 10px; padding: 10px 14px; cursor: pointer;
`;
const Card = styled.section`
  background: var(--card-bg, #fff);
  border-radius: 16px; padding: ${space(3)}; box-shadow: 0 10px 30px rgba(16,24,40,0.08);
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(12, 1fr); gap: ${space(2)};
`;
const Col = styled.div`
  grid-column: span ${p => p.span || 12};
`;
const Avatar = styled.div`
  width: 64px; height: 64px; border-radius: 50%; background: #F59E0B; color: white; display: grid; place-items: center; font-weight: 800;
`;
const Stat = styled.div`
  display: flex; flex-direction: column; gap: 4px; padding: ${space(2)}; border-radius: 12px; background: rgba(253, 186, 116, 0.15);
`;
const BadgeChip = styled.span`
  display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; background: rgba(255, 159, 64, 0.18); color: ${colors.brandDark}; margin: 0 ${space(1)} ${space(1)} 0;
`;
const List = styled.ul`
  list-style: none; padding: 0; margin: 0;
`;
const ListItem = styled.li`
  padding: 10px 0; border-bottom: 1px dashed rgba(0,0,0,0.08);
`;
const Bars = styled.div`
  display: flex; gap: ${space(1)}; align-items: flex-end; height: 120px; padding: ${space(1)} 0;
`;
const Bar = styled.div`
  width: 44px; border-radius: 8px 8px 0 0; background: ${p => p.color || '#F59E0B'}; height: ${p => p.h || 0}px;
`;

export default function ProfilePage({ apiBase, currentUser, username, dark, goHome }) {
  const me = currentUser?.username || username;
  const [badges, setBadges] = useState([]);
  const [thanksGiven, setThanksGiven] = useState([]);
  const [thanksReceived, setThanksReceived] = useState([]);
  const [sessions, setSessions] = useState([]);
  const toArray = (v) => (Array.isArray(v) ? v : []);

  useEffect(() => {
    async function load() {
      try {
        const [lbRes, thxRes] = await Promise.all([
          fetch(`${apiBase}/leaderboard`),
          fetch(`${apiBase}/thanks`),
        ]);
  const lb = await lbRes.json();
  const thx = await thxRes.json();
  const row = toArray(lb).find(r => r.username === me);
  setBadges(toArray(row?.badgesList));
  setThanksGiven(toArray(thx).filter(t => t.from === me));
  setThanksReceived(toArray(thx).filter(t => t.to === me));
        if (currentUser?.id) {
          const sRes = await fetch(`${apiBase}/sessions/${currentUser.id}`);
          const ss = await sRes.json();
          setSessions(toArray(ss));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Profile load failed', e);
      }
    }
    load();
  }, [apiBase, me, currentUser]);

  const initials = (me || '?').slice(0, 2).toUpperCase();
  const accepted = sessions.filter(s => s.status === 'accepted').length;
  const pending = sessions.filter(s => s.status !== 'accepted').length;

  const max = Math.max(1, badges.length, thanksGiven.length, thanksReceived.length, accepted + pending);
  const h = (v) => Math.round((v / max) * 120);

  return (
    <Shell>
      <Header>
        <Title>Profile</Title>
        <Button onClick={goHome}>← Back</Button>
      </Header>

      <Grid>
        <Col span={12}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar aria-hidden>{initials}</Avatar>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>@{me}</div>
                <div style={{ color: colors.muted }}>Your contributions at a glance</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginTop: 16 }}>
              <Stat>
                <span style={{ color: colors.muted }}>Badges</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{badges.length}</span>
              </Stat>
              <Stat>
                <span style={{ color: colors.muted }}>Thanks given</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{thanksGiven.length}</span>
              </Stat>
              <Stat>
                <span style={{ color: colors.muted }}>Thanks received</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{thanksReceived.length}</span>
              </Stat>
              <Stat>
                <span style={{ color: colors.muted }}>Sessions</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{accepted + pending}</span>
              </Stat>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ color: colors.muted, marginBottom: 6 }}>Contributions</div>
              <Bars>
                <Bar title={`Badges: ${badges.length}`} color="#F59E0B" h={h(badges.length)} />
                <Bar title={`Thanks given: ${thanksGiven.length}`} color="#10B981" h={h(thanksGiven.length)} />
                <Bar title={`Thanks received: ${thanksReceived.length}`} color="#3B82F6" h={h(thanksReceived.length)} />
                <Bar title={`Sessions: ${accepted + pending}`} color="#A855F7" h={h(accepted + pending)} />
              </Bars>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0, color: colors.brandDark }}>Badges</h3>
            {badges.length === 0 ? (
              <div style={{ color: colors.muted }}>No badges yet.</div>
            ) : (
              <div>
                {badges.map((b, i) => <BadgeChip key={i}>{b}</BadgeChip>)}
              </div>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0, color: colors.brandDark }}>Recent Thanks</h3>
            {thanksGiven.length + thanksReceived.length === 0 ? (
              <div style={{ color: colors.muted }}>No activity yet.</div>
            ) : (
              <List>
                {[...thanksGiven.map(t => ({ ...t, _kind: 'Given' })), ...thanksReceived.map(t => ({ ...t, _kind: 'Received' }))]
                  .sort((a,b) => b.time - a.time)
                  .slice(0,5)
                  .map(t => (
                    <ListItem key={t.id}>
                      <b>{t._kind}</b> — {t._kind === 'Given' ? `to ${t.to}` : `from ${t.from}`} — <span style={{ color: colors.muted }}>{new Date(t.time).toLocaleString()}</span>
                      <div style={{ color: colors.muted }}>{t.message}</div>
                    </ListItem>
                  ))}
              </List>
            )}
          </Card>
        </Col>
      </Grid>
    </Shell>
  );
}
