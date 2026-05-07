import { useState, useEffect } from 'react';
import { FONT_HREF } from './styles/fonts';
import { Header } from './components/shared/Header';
import { BottomNav } from './components/shared/BottomNav';
import { DMsOverlay } from './components/shared/DMsOverlay';
import { ComposeOverlay } from './components/shared/ComposeOverlay';
import { NotificationsPanel } from './components/shared/NotificationsPanel';
import { GrainOverlay } from './components/shared/Visuals';

import { HomeScreen } from './components/feed/HomeScreen';
import { CommunitiesScreen, CommunityDetail } from './components/communities/CommunitiesScreen';
import { MapScreen } from './components/map/MapScreen';
import { EventsScreen } from './components/events/EventsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { TonightStatusModal } from './components/profile/TonightStatusModal';

import { CovenMenu } from './components/coven/CovenMenu';
import { LibraryOverlay } from './components/library/LibraryOverlay';
import { ReaderView } from './components/library/ReaderView';
import { OdditiesOverlay } from './components/oddities/OdditiesOverlay';
import { OddityDetail } from './components/oddities/OddityDetail';
import { OddityCompose } from './components/oddities/OddityCompose';

import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SettingsScreen, DEFAULT_SETTINGS } from './components/settings/SettingsScreen';

import { COMMUNITIES } from './data/communities';
import { NOTIFICATIONS } from './data/notifications';
import { DEFAULT_PROFILE, GRAVES, ANNIVERSARIES, DEFAULT_TRACKERS, TRACKER_CATEGORIES } from './data/profile';

export default function App() {
  // === STATE ===
  const [tab, setTab] = useState('home');
  const [community, setCommunity] = useState(null);
  const [showDMs, setShowDMs] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTonightModal, setShowTonightModal] = useState(false);

  const [activePortal, setActivePortal] = useState(null); // 'menu' | 'library' | 'oddities' | etc.
  const [activeText, setActiveText] = useState(null); // library reader
  const [activeOddity, setActiveOddity] = useState(null);
  const [showOddityCompose, setShowOddityCompose] = useState(false);

  const [onboarded, setOnboarded] = useState(true); // change to false to test onboarding
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [tonightStatus, setTonightStatus] = useState({ text: profile.status, setAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  const [trackers, setTrackers] = useState(DEFAULT_TRACKERS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load fonts
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // Apply parchment mode
  useEffect(() => {
    if (settings.parchmentMode) document.body.classList.add('parchment-mode');
    else document.body.classList.remove('parchment-mode');
  }, [settings.parchmentMode]);

  // Auto-expire tonight status after 12h
  useEffect(() => {
    if (tonightStatus?.expiresAt && tonightStatus.expiresAt < Date.now()) {
      setTonightStatus(null);
    }
    const t = setInterval(() => {
      setTonightStatus(s => (s?.expiresAt && s.expiresAt < Date.now()) ? null : s);
    }, 60000);
    return () => clearInterval(t);
  }, [tonightStatus]);

  // === HANDLERS ===
  const updateTracker = (catId, action) => {
    const cat = TRACKER_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    setTrackers(prev => {
      const next = { ...prev };
      if (action === 'log' || action === 'add') {
        if (cat.mode === 'streak') {
          next[catId] = { ...(next[catId] || { public: cat.defaultPublic }), streakStart: Date.now() };
        } else {
          next[catId] = { ...(next[catId] || { public: cat.defaultPublic }), lastAt: Date.now() };
        }
      } else if (action === 'togglePublic') {
        if (next[catId]) next[catId] = { ...next[catId], public: !next[catId].public };
      } else if (action === 'remove') {
        delete next[catId];
      }
      return next;
    });
  };

  const markAllNotifsRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const markNotifRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleOnboard = (data) => {
    setProfile(p => ({
      ...p,
      name: data.handle,
      bio: data.vibes.length > 0 ? data.vibes.join(' · ') + ' · ' + data.city : data.city,
      birthday: data.birthday || p.birthday,
      tags: [...new Set(['goth', ...data.vibes.slice(0, 3)])],
    }));
    setOnboarded(true);
  };

  // === RENDER ===
  if (!onboarded) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-black text-[#F5F1E8] relative overflow-hidden">
        <OnboardingFlow onComplete={handleOnboard} />
      </div>
    );
  }

  // Profile context for header
  const isInsideOverlay = activePortal || activeOddity || showOddityCompose || activeText;
  const onLibraryTap = () => {
    if (activePortal) return;
    setActivePortal('menu');
  };

  const renderTab = () => {
    if (community) {
      return <CommunityDetail id={community} onBack={() => setCommunity(null)} />;
    }
    if (tab === 'home') return <HomeScreen onOpenCommunity={setCommunity} tonightStatus={tonightStatus} />;
    if (tab === 'communities') return <CommunitiesScreen onOpenCommunity={setCommunity} />;
    if (tab === 'map') return <MapScreen />;
    if (tab === 'events') return <EventsScreen />;
    if (tab === 'profile') return (
      <ProfileScreen
        profile={{ ...profile, status: tonightStatus?.text || null }}
        graves={GRAVES}
        anniversaries={ANNIVERSARIES}
        trackers={trackers}
        onUpdateTracker={updateTracker}
        onOpenTonightStatus={() => setShowTonightModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        mementoMoriOn={settings.mementoMori}
        settings={settings}
      />
    );
    return null;
  };

  return (
    <div className="phone-frame max-w-md mx-auto relative overflow-hidden text-[#F5F1E8]"
      style={{ background: settings.parchmentMode ? '#EDE0C2' : '#0A0A0A' }}>
      {/* Vignette */}
      {settings.vignette && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: settings.parchmentMode
            ? 'radial-gradient(ellipse at center, transparent 60%, rgba(58, 34, 12, 0.25) 100%)'
            : 'radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.55) 100%)'
        }} />
      )}

      {/* Grain */}
      {settings.grainIntensity > 0 && <GrainOverlay opacity={settings.grainIntensity} />}

      {/* Main content area */}
      <div className="relative pt-[60px] pb-0 min-h-[100vh]" style={{ minHeight: '100dvh' }}>
        <Header
          tab={tab}
          onDMs={() => setShowDMs(true)}
          onCompose={() => setShowCompose(true)}
          onLibrary={onLibraryTap}
          onNotifications={() => setShowNotifs(true)}
          communityName={community ? COMMUNITIES.find(c => c.id === community)?.name : null}
          unreadNotifications={unreadNotifs}
          parchment={settings.parchmentMode}
        />
        <div className="animate-screen-in" key={`${tab}-${community || ''}`}>
          {renderTab()}
        </div>
      </div>

      <BottomNav tab={tab} onChange={(t) => { setTab(t); setCommunity(null); }} parchment={settings.parchmentMode} />

      {/* Overlays */}
      {showDMs && <DMsOverlay onClose={() => setShowDMs(false)} />}
      {showCompose && <ComposeOverlay onClose={() => setShowCompose(false)} />}
      {showNotifs && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifs(false)}
          onMarkAllRead={markAllNotifsRead}
          onMarkRead={markNotifRead}
        />
      )}
      {showTonightModal && (
        <TonightStatusModal
          current={tonightStatus}
          onSave={setTonightStatus}
          onClose={() => setShowTonightModal(false)}
        />
      )}
      {showSettings && (
        <SettingsScreen
          settings={settings}
          onChange={setSettings}
          onBack={() => setShowSettings(false)}
          onLogout={() => { setOnboarded(false); setShowSettings(false); }}
        />
      )}

      {/* Coven portals */}
      {activePortal === 'menu' && (
        <CovenMenu
          onClose={() => setActivePortal(null)}
          onOpen={(id) => setActivePortal(id)}
        />
      )}
      {activePortal === 'library' && !activeText && (
        <LibraryOverlay
          onClose={() => setActivePortal('menu')}
          onOpenText={(id) => setActiveText(id)}
        />
      )}
      {activeText && (
        <ReaderView textId={activeText} onBack={() => setActiveText(null)} />
      )}
      {activePortal === 'oddities' && !activeOddity && !showOddityCompose && (
        <OdditiesOverlay
          onClose={() => setActivePortal('menu')}
          onOpenOddity={(id) => setActiveOddity(id)}
          onCompose={() => setShowOddityCompose(true)}
        />
      )}
      {activeOddity && (
        <OddityDetail id={activeOddity} onBack={() => setActiveOddity(null)} />
      )}
      {showOddityCompose && (
        <OddityCompose onClose={() => setShowOddityCompose(false)} />
      )}
    </div>
  );
}
