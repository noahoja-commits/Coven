import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './auth/AuthProvider';
import { isSupabaseConfigured } from './lib/supabase';
import { SignInScreen } from './components/auth/SignInScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { fetchFeed, createPost, deletePost as dbDeletePost, togglePostReaction, fetchComments, createComment, castPollVote, clearPollVote } from './lib/db/posts';
import { insertProfile, updateProfile, getProfileStats, getProfileByHandle } from './lib/db/profiles';
import { fetchFollowing, followUser, unfollowUser } from './lib/db/social';
import { fetchConversations, getOrCreateDM, createGroup, fetchMessages as fetchDMMessages, sendDM, markRead as dmMarkRead, setBuried as dmSetBuried, subscribeDMs } from './lib/db/dm';
import { fetchActiveStories, postStory as dbPostStory, deleteStory, reactToStory } from './lib/db/stories';
import { fetchListings, createListing } from './lib/db/listings';
import { fetchPayoutStatus, startPayoutSetup, refreshPayoutStatus } from './lib/db/payouts';
import { listCrews, createCrew as dbCreateCrew, joinCrew as dbJoinCrew } from './lib/db/crews';
import { fetchProfileState, saveProfileState } from './lib/db/profileState';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications, subscribeNotifications, hydrateRealtime } from './lib/db/notifications';
import { fetchBlockedIds, blockUser as dbBlockUser, unblockUser as dbUnblockUser, reportContent } from './lib/db/moderation';
import { BlockedOverlay } from './components/settings/BlockedOverlay';
import { enablePush, disablePush, pushStatus } from './lib/db/push';
import { setTonightPin, clearTonightPin, fetchTonightPins, subscribeTonightPins } from './lib/db/tonight';
import { Toast } from './components/shared/Toast';
import { fetchMyTicketEventIds } from './lib/db/festival';
import { FestivalMap } from './components/festival/FestivalMap';
import { VenueMapEditor } from './components/festival/VenueMapEditor';
import { FONT_HREF, F } from './styles/fonts';
import { Header } from './components/shared/Header';
import { BottomNav } from './components/shared/BottomNav';
import { DMsOverlay } from './components/shared/DMsOverlay';
import { ChatThread } from './components/shared/ChatThread';
import { ComposeOverlay } from './components/shared/ComposeOverlay';
import { NotificationsPanel } from './components/shared/NotificationsPanel';
import { GrainOverlay } from './components/shared/Visuals';
import { startAmbient, stopAmbient } from './lib/ambient';
import { fetchWeatherTint } from './lib/weather';
import { InstallPrompt } from './components/shared/InstallPrompt';

import { HomeScreen } from './components/feed/HomeScreen';
import { CommunitiesScreen, CommunityDetail } from './components/communities/CommunitiesScreen';
import { MapScreen } from './components/map/MapScreen';
import { EventsScreen } from './components/events/EventsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { TonightStatusModal } from './components/profile/TonightStatusModal';
import { ProfileEditModal } from './components/profile/ProfileEditModal';
import { UserProfileOverlay } from './components/profile/UserProfileOverlay';
import { StoryViewer } from './components/feed/StoryViewer';
import { StoryComposer } from './components/feed/StoryComposer';
import { SearchOverlay } from './components/shared/SearchOverlay';
import { CrewBrowse } from './components/profile/CrewBrowse';
import { AddGraveModal } from './components/profile/AddGraveModal';
import { AddAnniversaryModal } from './components/profile/AddAnniversaryModal';
import { EventDetail } from './components/events/EventDetail';
import { CreateEventModal } from './components/events/CreateEventModal';
import { TicketManager } from './components/events/TicketManager';
import { MyTicketsOverlay } from './components/events/MyTicketsOverlay';
import { startCheckout } from './lib/db/tickets';
import { NowPlayingModal } from './components/profile/NowPlayingModal';
import { NewGroupDMModal } from './components/shared/NewGroupDMModal';
import { ReflectionsModal } from './components/profile/ReflectionsModal';

import { CovenMenu } from './components/coven/CovenMenu';
// Lazy — the Library carries the full text of every book; keep it out of the initial bundle.
const LibraryOverlay = lazy(() => import('./components/library/LibraryOverlay').then(m => ({ default: m.LibraryOverlay })));
const ReaderView = lazy(() => import('./components/library/ReaderView').then(m => ({ default: m.ReaderView })));
import { OdditiesOverlay } from './components/oddities/OdditiesOverlay';
import { OddityDetail } from './components/oddities/OddityDetail';
import { OddityCompose } from './components/oddities/OddityCompose';
import { TarotOverlay } from './components/coven/TarotOverlay';
import { CodexOverlay } from './components/coven/CodexOverlay';
import { EphemerisOverlay } from './components/coven/EphemerisOverlay';
import { SigilOverlay } from './components/coven/SigilOverlay';
import { PendulumOverlay } from './components/coven/PendulumOverlay';
import { ConfessionsOverlay } from './components/coven/ConfessionsOverlay';
import { SoulsOverlay } from './components/coven/SoulsOverlay';
import { FashionScreen } from './components/fashion/FashionScreen';

import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SettingsScreen, DEFAULT_SETTINGS } from './components/settings/SettingsScreen';

import { COMMUNITIES } from './data/communities';
import { fetchEvents, createEvent, toggleEventRsvp as dbToggleRsvp, fetchEventAttendees } from './lib/db/events';
import { CommentsOverlay } from './components/feed/CommentsOverlay';
import { QuoteModal } from './components/feed/QuoteModal';
import { VespersArchiveModal } from './components/feed/VespersArchiveModal';
import { TRACKER_CATEGORIES } from './data/profile';

export default function App() {
  // === AUTH ===
  const { loading: authLoading, session, userId, dbProfile, recovery, signOut, refreshProfile } = useAuth();
  const meId = userId;
  const followIdByHandle = useRef({});

  // === STATE ===
  const [tab, setTab] = useState('home');
  const [community, setCommunity] = useState(null);
  const [showDMs, setShowDMs] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  // Best-known meta for the open thread so it renders even before the inbox
  // (fetchConversations) has caught up — e.g. opening from a DM notification or
  // a brand-new conversation. Without this the thread renders blank (no reply box).
  const [activeConvMeta, setActiveConvMeta] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [pushState, setPushState] = useState('off');
  const [weatherTint, setWeatherTint] = useState(null); // {color,opacity} when Weather mood is on
  const [showTonightModal, setShowTonightModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [activeUserHandle, setActiveUserHandle] = useState(null);
  const [showStoryComposer, setShowStoryComposer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCrewBrowse, setShowCrewBrowse] = useState(false);
  const [showAddGrave, setShowAddGrave] = useState(false);
  const [showAddAnniv, setShowAddAnniv] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [showVespersArchive, setShowVespersArchive] = useState(false);

  const [activePortal, setActivePortal] = useState(null); // 'menu' | 'library' | 'oddities' | etc.
  const [activeText, setActiveText] = useState(null); // library reader
  const [activeOddity, setActiveOddity] = useState(null);
  const [showOddityCompose, setShowOddityCompose] = useState(false);
  const [activePostComments, setActivePostComments] = useState(null);

  const [profile, setProfile] = useState(null); // mapped from the Supabase profile row
  const [tonightStatus, setTonightStatus] = useLocalStorage('tonightStatus', { text: '', setAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  const [tonightPins, setTonightPins] = useState([]); // DB-backed: other souls out tonight
  const [trackers, setTrackers] = useState({}); // Supabase-backed (profile_state)
  const [notifications, setNotifications] = useState([]); // Supabase-backed (DB triggers + realtime)
  const [settings, setSettings] = useLocalStorage('settings', DEFAULT_SETTINGS);

  // Live content state (Supabase-backed)
  const [posts, setPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [followingPeople, setFollowingPeople] = useState([]);
  const activeConversationRef = useRef(null);
  const cloudSyncedRef = useRef(false);
  const [communityMembership, setCommunityMembership] = useLocalStorage('communityMembership', { general: true, goth: true });
  const [eventRsvp, setEventRsvp] = useState({});
  const [events, setEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [activeEventAttendees, setActiveEventAttendees] = useState([]);
  const [ticketManagerEvent, setTicketManagerEvent] = useState(null);
  const [venueEditorEvent, setVenueEditorEvent] = useState(null);
  const [myTicketEventIds, setMyTicketEventIds] = useState([]);
  const [exitedFestivalId, setExitedFestivalId] = useState(null);
  const [festTick, setFestTick] = useState(0);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState({ hasAccount: false, enabled: false });
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', {});
  const [graves, setGraves] = useState([]); // Supabase-backed (profile_state)
  const [sigils, setSigils] = useState([]); // Supabase-backed (profile_state)
  const [following, setFollowing] = useState({}); // {handle: ts}, backed by follows table
  const [stories, setStories] = useState([]);
  const [listings, setListings] = useState([]);
  const [crews, setCrews] = useState([]); // public crew directory (group conversations)
  const [crewBusy, setCrewBusy] = useState({}); // {convId: true} while joining
  const [muted, setMuted] = useLocalStorage('muted', {});
  const [anniversaries, setAnniversaries] = useLocalStorage('anniversaries', []);
  const [cardHistory, setCardHistory] = useLocalStorage('cardHistory', {});
  const [marginalia, setMarginalia] = useLocalStorage('marginalia', {});
  const [postCandles, setPostCandles] = useLocalStorage('postCandles', {});
  const [nowPlaying, setNowPlaying] = useLocalStorage('nowPlaying', null);
  const [activityLog, setActivityLog] = useLocalStorage('activityLog', []);
  const [reflections, setReflections] = useState([]); // Supabase-backed (profile_state)
  const [mutedKeywords, setMutedKeywords] = useLocalStorage('mutedKeywords', []);
  const [hiddenPosts, setHiddenPosts] = useLocalStorage('hiddenPosts', {});
  const [ritual, setRitual] = useLocalStorage('ritual', { streak: 0, lastDay: null });
  const [crystals, setCrystals] = useLocalStorage('crystals', []);
  const [pinnedPostId, setPinnedPostId] = useLocalStorage('pinnedPostId', null);
  const [shrineTheme, setShrineTheme] = useLocalStorage('shrineTheme', 'oxblood');
  const [feedSort, setFeedSort] = useLocalStorage('feedSort', 'latest');
  const [feedScope, setFeedScope] = useState('everyone'); // 'everyone' | 'following'
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [blockedIds, setBlockedIds] = useState(() => new Set());
  const [divinationLog, setDivinationLog] = useLocalStorage('divinationLog', []);
  const [storyHighlights, setStoryHighlights] = useLocalStorage('storyHighlights', []);

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

  // Ambient drone follows the "Sound on" toggle (the toggle click is the gesture
  // browsers require to start audio). Always stop on unmount. Skip the toast on the
  // initial mount so a persisted "on" doesn't pop a toast at load.
  const soundMounted = useRef(false);
  useEffect(() => {
    if (settings.soundOn) startAmbient();
    else stopAmbient();
    if (soundMounted.current) showToast(settings.soundOn ? 'ambient drone on 🔊' : 'ambient off');
    soundMounted.current = true;
    return () => stopAmbient();
  }, [settings.soundOn]);

  // Weather mood: when enabled, get location + current conditions -> a tint.
  // Only requests geolocation here (on toggle-on), never on load.
  useEffect(() => {
    let active = true;
    if (!settings.weatherMood) { setWeatherTint(null); return undefined; }
    showToast('reading your local weather…');
    fetchWeatherTint().then(t => {
      if (!active) return;
      if (t) { setWeatherTint(t); showToast(`weather mood: ${t.label}`); }
      else { setWeatherTint(null); showToast("couldn't read your local weather — allow location access, then toggle again.", 'error'); }
    });
    return () => { active = false; };
  }, [settings.weatherMood]);

  // Lock body scroll when a modal overlay is open
  useEffect(() => {
    const anyModal = showEditProfile || showTonightModal || showSettings || showNotifs
      || showCompose || showStoryComposer || showSearch || showVespersArchive
      || showAddGrave || showAddAnniv || showNewGroup || showReflections || showCrewBrowse
      || showNowPlaying || showBlocked || showMyTickets || quoteTarget || activeStoryIndex !== null;
    document.body.style.overflow = anyModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEditProfile, showTonightModal, showSettings, showNotifs, showCompose, showStoryComposer, showSearch, showVespersArchive, showAddGrave, showAddAnniv, showNewGroup, showReflections, showCrewBrowse, showNowPlaying, showBlocked, showMyTickets, quoteTarget, activeStoryIndex]);

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

  // Live "out tonight" pins for the map (cross-user, realtime).
  useEffect(() => {
    if (!meId) return undefined;
    const load = () => fetchTonightPins().then(setTonightPins).catch(() => {});
    load();
    const unsub = subscribeTonightPins(load);
    return () => { unsub(); };
  }, [meId]);

  // Map the Supabase profile row -> the UI profile shape, then load real counts.
  useEffect(() => {
    if (!dbProfile) { setProfile(null); return; }
    setProfile({
      id: dbProfile.id,
      name: dbProfile.handle,
      avatar: dbProfile.avatar,
      avatarUrl: dbProfile.avatar_url || null,
      pronouns: dbProfile.pronouns || '',
      bio: dbProfile.bio || '',
      tags: dbProfile.tags || [],
      scenes: dbProfile.scenes || [],
      birthday: dbProfile.birthday || null,
      city: dbProfile.city || '',
      scene: dbProfile.city || '',
      joinedScene: dbProfile.created_at,
      followers: 0, following: 0, posts: 0,
      status: null,
    });
    getProfileStats(dbProfile.id)
      .then(s => setProfile(p => (p ? { ...p, ...s } : p)))
      .catch(() => {});
  }, [dbProfile]);

  // Load the feed + follow graph once we have an identity.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    let active = true;
    fetchFollowing(meId).then(({ map, idByHandle, people }) => {
      if (!active) return;
      setFollowing(map);
      followIdByHandle.current = idByHandle;
      setFollowingPeople(people || []);
    }).catch(() => {});
    fetchEvents(meId).then(({ events, rsvp }) => {
      if (!active) return;
      setEvents(events);
      setEventRsvp(rsvp);
    }).catch(() => {});
    fetchConversations().then(c => { if (active) setConversations(c); }).catch(() => {});
    fetchActiveStories(meId).then(s => { if (active) setStories(s); }).catch(() => {});
    fetchListings(meId).then(l => { if (active) setListings(l); }).catch(() => {});
    fetchPayoutStatus(meId).then(p => { if (active) setPayoutStatus(p); }).catch(() => {});
    listCrews().then(c => { if (active) setCrews(c); }).catch(() => {});
    fetchMyTicketEventIds().then(ids => { if (active) setMyTicketEventIds(ids); }).catch(() => {});
    fetchNotifications().then(n => { if (active) setNotifications(n); }).catch(() => {});
    fetchBlockedIds().then(ids => { if (active) setBlockedIds(new Set(ids)); }).catch(() => {});
    cloudSyncedRef.current = false;
    fetchProfileState().then(s => {
      if (!active) return;
      if (s.graves) setGraves(s.graves);
      if (s.trackers) setTrackers(s.trackers);
      if (s.sigils) setSigils(s.sigils);
      if (s.reflections) setReflections(s.reflections);
      // Cross-device personal layer: hydrate from the cloud blob (cloud wins on login).
      const cs = s.clientSync;
      if (cs) {
        if (cs.tonightStatus !== undefined) setTonightStatus(cs.tonightStatus);
        if (cs.communityMembership !== undefined) setCommunityMembership(cs.communityMembership);
        if (cs.bookmarks !== undefined) setBookmarks(cs.bookmarks);
        if (cs.muted !== undefined) setMuted(cs.muted);
        if (cs.anniversaries !== undefined) setAnniversaries(cs.anniversaries);
        if (cs.cardHistory !== undefined) setCardHistory(cs.cardHistory);
        if (cs.marginalia !== undefined) setMarginalia(cs.marginalia);
        if (cs.postCandles !== undefined) setPostCandles(cs.postCandles);
        if (cs.nowPlaying !== undefined) setNowPlaying(cs.nowPlaying);
        if (cs.activityLog !== undefined) setActivityLog(cs.activityLog);
        if (cs.mutedKeywords !== undefined) setMutedKeywords(cs.mutedKeywords);
        if (cs.hiddenPosts !== undefined) setHiddenPosts(cs.hiddenPosts);
        if (cs.ritual !== undefined) setRitual(cs.ritual);
        if (cs.crystals !== undefined) setCrystals(cs.crystals);
        if (cs.pinnedPostId !== undefined) setPinnedPostId(cs.pinnedPostId);
        if (cs.shrineTheme !== undefined) setShrineTheme(cs.shrineTheme);
        if (cs.divinationLog !== undefined) setDivinationLog(cs.divinationLog);
        if (cs.storyHighlights !== undefined) setStoryHighlights(cs.storyHighlights);
      }
      cloudSyncedRef.current = true;
    }).catch(() => { cloudSyncedRef.current = true; });
    return () => { active = false; };
  }, [meId, dbProfile]);

  // Feed: loads (and reloads on scope change) the first page, paginated by cursor.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    let active = true;
    setFeedHasMore(true);
    fetchFeed(meId, { scope: feedScope }).then(rows => {
      if (!active) return;
      setPosts(rows);
      setFeedHasMore(rows.length >= 20);
    }).catch(() => {});
    return () => { active = false; };
  }, [meId, dbProfile, feedScope]);

  const loadMoreFeed = () => {
    if (feedLoadingMore || !feedHasMore || !meId) return;
    const last = [...posts].reverse().find(p => p.createdAt);
    if (!last) return;
    setFeedLoadingMore(true);
    fetchFeed(meId, { scope: feedScope, before: last.createdAt }).then(more => {
      setPosts(prev => { const seen = new Set(prev.map(p => p.id)); return [...prev, ...more.filter(p => !seen.has(p.id))]; });
      setFeedHasMore(more.length >= 20);
    }).catch(() => {}).finally(() => setFeedLoadingMore(false));
  };

  // Persist the personal layer to the cloud (debounced) so it follows the user
  // across devices. Gated on cloudSyncedRef so we never clobber the cloud with
  // empty local state before the initial load finishes.
  useEffect(() => {
    if (!meId || !cloudSyncedRef.current) return;
    const blob = {
      tonightStatus, communityMembership, bookmarks, muted, anniversaries, cardHistory,
      marginalia, postCandles, nowPlaying, activityLog, mutedKeywords, hiddenPosts,
      ritual, crystals, pinnedPostId, shrineTheme, divinationLog, storyHighlights,
    };
    const t = setTimeout(() => { saveProfileState(meId, 'clientSync', blob).catch(() => {}); }, 800);
    return () => clearTimeout(t);
  }, [meId, tonightStatus, communityMembership, bookmarks, muted, anniversaries, cardHistory,
      marginalia, postCandles, nowPlaying, activityLog, mutedKeywords, hiddenPosts,
      ritual, crystals, pinnedPostId, shrineTheme, divinationLog, storyHighlights]);

  // Live notifications: a new row (follow/react/comment/dm) → refetch so the
  // bell updates in real time, with the actor's profile joined in.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    const unsub = subscribeNotifications((row) => {
      fetchNotifications().then(setNotifications).catch(() => {});
      // OS notification banner when the app is open/backgrounded (not killed)
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
          const n = hydrateRealtime(row);
          new Notification('Coven', { body: `someone ${n.text}`, icon: '/pwa-192.png', tag: row.id });
        }
      } catch { /* noop */ }
    });
    return unsub;
  }, [meId, dbProfile]);

  // Live DMs: keep the inbox + the open thread fresh as messages arrive.
  useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);
  useEffect(() => {
    if (!meId || !dbProfile) return;
    const unsub = subscribeDMs((row) => {
      fetchConversations().then(setConversations).catch(() => {});
      const openId = activeConversationRef.current;
      if (openId && row.conversation_id === openId) {
        // Re-fetch for correct handles/order, but keep any still-in-flight or
        // failed local messages so a refetch never clobbers what the user typed.
        fetchDMMessages(openId, meId).then(msgs => setMessages(prev => {
          const keep = (prev[openId] || []).filter(m =>
            (m.pending || m.failed) && !msgs.some(s => s.from === 'me' && s.body === m.body));
          return { ...prev, [openId]: [...msgs, ...keep] };
        })).catch(() => {});
        dmMarkRead(openId, meId).catch(() => {});
      }
    });
    return unsub;
  }, [meId, dbProfile]);

  // Returning from Stripe (ticket checkout or Connect onboarding) — webhooks are async.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('ticket');
    const connect = params.get('connect');
    if (!t && !connect) return;
    history.replaceState(null, '', window.location.pathname);
    if (t === 'success') {
      setTicketSuccess(true);
      if (meId) setTimeout(() => {
        fetchEvents(meId).then(({ events, rsvp }) => { setEvents(events); setEventRsvp(rsvp); }).catch(() => {});
      }, 2500);
    }
    if (connect === 'done' && meId) {
      // Pull status straight from Stripe for an instant update; retry a couple
      // times in case the account is still settling, falling back to the DB read.
      const refresh = (n) => refreshPayoutStatus(meId).then(p => {
        setPayoutStatus(p);
        if (!p.enabled && n > 0) setTimeout(() => refresh(n - 1), 2500);
      }).catch(() => fetchPayoutStatus(meId).then(setPayoutStatus).catch(() => {}));
      refresh(3);
    }
  }, [meId]);

  const setupPayouts = () => {
    if (!meId || payoutBusy) return;
    setPayoutBusy(true);
    showToast('opening secure payout setup…');
    // On success the page redirects to Stripe (no need to clear busy); only
    // clear + surface on failure so the button doesn't feel dead on a slow tap.
    startPayoutSetup(meId).catch(e => {
      setPayoutBusy(false);
      showToast(`payout setup unavailable — ${e.message}`, 'error');
    });
  };

  // ---- in-app toast + push device state ----
  const showToast = (text, kind = 'info') => setToast({ key: `${kind}-${performance.now()}`, text, kind });

  const refreshPushState = () => { pushStatus().then(setPushState).catch(() => {}); };
  useEffect(() => { refreshPushState(); }, [meId]);
  useEffect(() => { if (showSettings) refreshPushState(); }, [showSettings]);

  // Turn push on for this device, with clear feedback instead of a silent fail.
  const turnPushOn = async () => {
    const r = await enablePush(meId);
    if (r === 'ok') { showToast('Notifications on for this device.'); }
    else { showToast(r, 'error'); }
    refreshPushState();
    return r;
  };
  const turnPushOff = async () => {
    await disablePush();
    showToast('Notifications off for this device.');
    refreshPushState();
  };

  // Save tonight status: keep the instant local copy AND sync the public map pin.
  // Ghost mode keeps you off the map (status stays local/profile-only).
  const saveTonightStatus = (status) => {
    setTonightStatus(status);
    if (!status || !status.text) {
      clearTonightPin().catch(() => {});
    } else if (settings.ghostMode) {
      clearTonightPin().catch(() => {});
    } else {
      setTonightPin({ text: status.text, neighborhood: status.neighborhood, expiresAt: status.expiresAt }).catch(() => {});
    }
    fetchTonightPins().then(setTonightPins).catch(() => {});
  };

  // Load an event's attendees when its detail opens.
  useEffect(() => {
    if (!activeEvent) { setActiveEventAttendees([]); return; }
    let active = true;
    fetchEventAttendees(activeEvent)
      .then(a => { if (active) setActiveEventAttendees(a.map(x => ({ handle: x.handle, avatar: x.avatar }))); })
      .catch(() => {});
    return () => { active = false; };
  }, [activeEvent]);

  // Lazy-load a thread's comments when it opens (base count -> 0 to avoid double-count).
  useEffect(() => {
    if (!activePostComments || String(activePostComments).startsWith('temp-')) return;
    const pid = activePostComments;
    let active = true;
    fetchComments(pid, meId).then(list => {
      if (active) setPosts(prev => prev.map(p => (p.id === pid ? { ...p, comments: list, baseCommentCount: 0 } : p)));
    }).catch(() => {});
    return () => { active = false; };
  }, [activePostComments, meId]);

  // === HANDLERS ===
  // Persist a profile-depth blob (graves/trackers/sigils/reflections) for the logged-in user.
  const persistState = (key, value) => { if (meId) saveProfileState(meId, key, value).catch(() => {}); };

  const updateTracker = (catId, action) => {
    const cat = TRACKER_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    const next = { ...trackers };
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
    setTrackers(next);
    persistState('trackers', next);
  };

  const markAllNotifsRead = () => { setNotifications(n => n.map(x => ({ ...x, read: true }))); markAllNotificationsRead().catch(() => {}); };
  const markNotifRead = (id) => { setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x)); markNotificationRead(id).catch(() => {}); };
  // Ephemeral local feedback (errors, your own actions); real cross-user
  // notifications arrive from DB triggers + realtime below.
  const addNotification = (n) => setNotifications(prev => [{ id: `n${Date.now()}`, read: false, time: 'just now', ...n }, ...prev]);
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadDMs = conversations.reduce((s, c) => s + (c.buried ? 0 : (c.unread || 0)), 0);

  // Festival mode: the soonest event the user holds a ticket to, from 30 min before doors until it ends.
  useEffect(() => { const t = setInterval(() => setFestTick(x => x + 1), 60000); return () => clearInterval(t); }, []);
  const festivalEvent = useMemo(() => {
    void festTick; // recompute each minute
    const now = Date.now();
    const held = new Set(myTicketEventIds);
    return events.find(e => {
      if (!held.has(e.id) || !e.starts_at) return false;
      const s = new Date(e.starts_at).getTime();
      const end = e.ends_at ? new Date(e.ends_at).getTime() : s + 6 * 3600 * 1000;
      return now >= s - 30 * 60 * 1000 && now <= end;
    }) || null;
  }, [events, myTicketEventIds, festTick]);

  // === CONTENT HANDLERS ===
  const meHandle = profile?.name || 'you';
  const meAvatar = profile?.avatar || '✟';
  const meAvatarUrl = profile?.avatarUrl || null;

  const addPost = async ({ body, community, anonymous, poll, img, kind }) => {
    if (!meId) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId, kind: kind || (poll ? 'poll' : 'text'),
      user: anonymous ? 'anonymous' : meHandle,
      avatar: anonymous ? '✟' : meAvatar,
      time: 'just now',
      community: community || 'general', body, img,
      avatarUrl: anonymous ? undefined : meAvatarUrl,
      reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 }, comments: [], myReactions: {},
      mine: !anonymous, anonymous: !!anonymous, baseCommentCount: 0, pending: true,
    };
    if (poll) {
      optimistic.poll = {
        options: poll.map((label, i) => ({ id: `po${i}`, label, votes: 0 })),
        myVote: null,
      };
    }
    setPosts(prev => [optimistic, ...prev]);
    logActivity({ kind: 'post', glyph: anonymous ? '✟' : '✦', label: anonymous ? 'made a confession' : 'spoke into the dark', detail: body.length > 60 ? body.slice(0, 60) + '…' : body, postId: tempId });
    try {
      const saved = await createPost({ body, community, anonymous, poll, img, kind }, { id: meId, handle: meHandle, avatar: meAvatar, avatarUrl: meAvatarUrl });
      setPosts(prev => prev.map(p => (p.id === tempId ? saved : p)));
    } catch (e) {
      setPosts(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const voteOnPoll = (postId, optionId) => {
    const post = posts.find(p => p.id === postId);
    const wasOption = post?.poll?.myVote;
    const removing = wasOption === optionId; // tapping your current pick un-votes
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll) return p;
      if (removing) {
        return { ...p, poll: { ...p.poll, myVote: null, options: p.poll.options.map(o => o.id === optionId ? { ...o, votes: Math.max(0, o.votes - 1) } : o) } };
      }
      return {
        ...p,
        poll: {
          ...p.poll,
          myVote: optionId,
          options: p.poll.options.map(o => {
            if (o.id === optionId) return { ...o, votes: o.votes + 1 };
            if (o.id === wasOption) return { ...o, votes: Math.max(0, o.votes - 1) };
            return o;
          }),
        },
      };
    }));
    if (!meId || String(postId).startsWith('temp-')) return;
    const op = removing ? clearPollVote(postId, meId) : castPollVote(postId, optionId, meId);
    op.catch(() => { fetchFeed(meId).then(setPosts).catch(() => {}); }); // reconcile to server truth on error
  };

  const flipReaction = (postId, kind, wasMine) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        reactions: { ...p.reactions, [kind]: Math.max(0, (p.reactions?.[kind] || 0) + (wasMine ? -1 : 1)) },
        myReactions: { ...(p.myReactions || {}), [kind]: !wasMine },
      };
    }));
  };
  const reactToPost = (postId, kind) => {
    const current = posts.find(p => p.id === postId);
    const wasMine = !!(current?.myReactions && current.myReactions[kind]);
    flipReaction(postId, kind, wasMine);
    if (meId && !String(postId).startsWith('temp-')) {
      togglePostReaction(postId, kind, meId, wasMine).catch(() => flipReaction(postId, kind, !wasMine));
    }
  };

  const addComment = (postId, body, parentId = null) => {
    if (!meId || String(postId).startsWith('temp-')) return;
    const tempId = `tempc-${Date.now()}`;
    const optimistic = { id: tempId, user: meHandle, avatar: meAvatar, body, time: 'just now', mine: true, parentId, reactions: { heart: 0, skull: 0 }, myReactions: {}, pending: true };
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: [...(p.comments || []), optimistic] } : p)));
    const target = posts.find(p => p.id === postId);
    logActivity({ kind: 'comment', glyph: '✎', label: `answered ${target?.user || 'a soul'}`, detail: body.length > 60 ? body.slice(0, 60) + '…' : body, postId });
    createComment({ postId, body, parentId }, { id: meId, handle: meHandle, avatar: meAvatar, avatarUrl: meAvatarUrl })
      .then(saved => setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: (p.comments || []).map(c => (c.id === tempId ? saved : c)) } : p))))
      .catch(() => setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: (p.comments || []).filter(c => c.id !== tempId) } : p))));
  };

  const reactToComment = (postId, commentId, kind) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: (p.comments || []).map(c => {
          if (c.id !== commentId) return c;
          const myReactions = c.myReactions || {};
          const reactions = c.reactions || { heart: 0, skull: 0 };
          const wasMine = !!myReactions[kind];
          return {
            ...c,
            myReactions: { ...myReactions, [kind]: !wasMine },
            reactions: { ...reactions, [kind]: Math.max(0, (reactions[kind] || 0) + (wasMine ? -1 : 1)) },
          };
        }),
      };
    }));
  };

  const sendMessage = (conversationId, body) => {
    if (!meId || !conversationId || String(conversationId).startsWith('temp-')) return;
    const tempId = `tempm-${Date.now()}`;
    const optimistic = { id: tempId, from: 'me', body, time: 'just now', pending: true };
    setMessages(prev => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), optimistic] }));
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, last: body.length > 60 ? body.slice(0, 60) + '…' : body, time: 'just now' } : c
    ));
    sendDM(conversationId, meId, body)
      .then(saved => setMessages(prev => ({ ...prev, [conversationId]: (prev[conversationId] || []).map(m => m.id === tempId ? saved : m) })))
      // Keep the message (marked failed) so it isn't silently lost, and tell the user.
      .catch(() => {
        setMessages(prev => ({ ...prev, [conversationId]: (prev[conversationId] || []).map(m => m.id === tempId ? { ...m, pending: false, failed: true } : m) }));
        showToast("whisper didn't send — tap it to retry.", 'error');
      });
  };

  // Retry a failed message: drop the failed copy and resend.
  const retryMessage = (conversationId, messageId) => {
    let body = null;
    setMessages(prev => {
      const list = prev[conversationId] || [];
      const failed = list.find(m => m.id === messageId);
      if (failed) body = failed.body;
      return { ...prev, [conversationId]: list.filter(m => m.id !== messageId) };
    });
    if (body) sendMessage(conversationId, body);
  };

  const openConversation = (id, meta) => {
    if (!id) return;
    // Synthetic fallback so the thread (and its reply box) always render, even
    // before the inbox has this conversation. Real data overwrites it on fetch.
    const known = conversations.find(c => c.id === id);
    setActiveConvMeta(known || {
      id,
      user: meta?.user || (meta?.group ? 'whisper circle' : 'whisper'),
      avatar: meta?.avatar || '✦',
      avatarUrl: meta?.avatarUrl || null,
      group: !!meta?.group,
    });
    setActiveConversation(id);
    setShowDMs(false);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    if (meId) {
      fetchDMMessages(id, meId).then(msgs => setMessages(prev => ({ ...prev, [id]: msgs }))).catch(() => {});
      dmMarkRead(id, meId).catch(() => {});
    }
  };

  const buryConversation = (id) => {
    const conv = conversations.find(c => c.id === id);
    const next = !conv?.buried;
    setConversations(prev => prev.map(c => c.id === id ? { ...c, buried: next } : c));
    if (activeConversation === id) setActiveConversation(null);
    if (meId) dmSetBuried(id, meId, next).catch(() => {
      // revert on failure so the UI matches the server
      setConversations(prev => prev.map(c => c.id === id ? { ...c, buried: !next } : c));
    });
  };

  const toggleCommunityMembership = (id) => {
    const wasMember = !!communityMembership[id];
    setCommunityMembership(prev => ({ ...prev, [id]: !wasMember }));
    if (!wasMember) {
      const c = COMMUNITIES.find(x => x.id === id);
      addNotification({ kind: 'crew', avatar: c?.glyph || '✦', text: `you joined ${c?.name || id}` });
      logActivity({ kind: 'join', glyph: c?.glyph || '✦', label: `joined the ${c?.name || 'a'} scene` });
    }
  };

  const toggleEventRsvp = (id) => {
    const wasGoing = !!eventRsvp[id];
    setEventRsvp(prev => {
      const next = { ...prev };
      if (wasGoing) delete next[id]; else next[id] = true;
      return next;
    });
    if (!wasGoing) {
      addNotification({ kind: 'event', avatar: '◈', text: `you said you're going` });
      logActivity({ kind: 'rsvp', glyph: '◈', label: 'pledged to a rite', detail: events.find(e => e.id === id)?.name || null });
    }
    if (meId && !String(id).startsWith('temp-')) {
      dbToggleRsvp(id, meId, wasGoing).catch(() => setEventRsvp(prev => {
        const next = { ...prev };
        if (wasGoing) next[id] = true; else delete next[id];
        return next;
      }));
    }
  };

  const addEvent = async (data) => {
    if (!meId) return;
    const saved = await createEvent(data, { id: meId, handle: meHandle, avatar: meAvatar });
    setEvents(prev => [saved, ...prev]);
    logActivity({ kind: 'event', glyph: '◈', label: 'summoned a rite', detail: data.name });
  };

  const buyTicket = (eventId) => {
    if (!meId) return;
    startCheckout(eventId, meId).catch(e => {
      addNotification({ kind: 'event', avatar: '✖', text: `checkout unavailable — ${e.message}` });
    });
  };

  const deletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (meId && !String(postId).startsWith('temp-')) dbDeletePost(postId).catch(() => {});
  };

  const repostPost = async (originalId, commentary = '') => {
    const original = posts.find(p => p.id === originalId);
    if (!original || !meId) return;
    const quoted = { id: original.id, user: original.user, avatar: original.avatar, body: original.body, kind: original.kind, community: original.community };
    const tempId = `temp-${Date.now()}`;
    setPosts(prev => [{
      id: tempId, kind: 'repost', user: meHandle, avatar: meAvatar, time: 'just now',
      community: original.community, body: commentary,
      reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 }, comments: [], myReactions: {},
      mine: true, baseCommentCount: 0, pending: true, quoted,
    }, ...prev]);
    logActivity({ kind: 'repost', glyph: '↻', label: `echoed ${original.user}`, detail: commentary || original.body?.slice(0, 60) });
    try {
      const saved = await createPost({ body: commentary, community: original.community, quoted, kind: 'repost' }, { id: meId, handle: meHandle, avatar: meAvatar });
      setPosts(prev => prev.map(p => (p.id === tempId ? saved : p)));
    } catch (e) {
      setPosts(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const toggleBookmark = (postId) => {
    setBookmarks(prev => {
      const next = { ...prev };
      if (next[postId]) delete next[postId];
      else next[postId] = Date.now();
      return next;
    });
  };

  const resolveUserId = async (handle) => {
    if (followIdByHandle.current[handle]) return followIdByHandle.current[handle];
    try {
      const p = await getProfileByHandle(handle);
      if (p?.id) { followIdByHandle.current[handle] = p.id; return p.id; }
    } catch { /* ignore */ }
    return null;
  };

  const openDMWithUser = async (handle) => {
    if (!meId || !handle || handle === meHandle) return;
    const otherId = await resolveUserId(handle);
    if (!otherId) return;
    const convId = await getOrCreateDM(otherId).catch(() => null);
    if (!convId) return;
    await fetchConversations().then(setConversations).catch(() => {});
    setShowDMs(false);
    openConversation(convId, { user: handle });
  };

  const sendMessageToUser = async (handle, body) => {
    if (!meId) return;
    const otherId = await resolveUserId(handle);
    if (!otherId) return;
    const convId = await getOrCreateDM(otherId).catch(() => null);
    if (convId) sendMessage(convId, body);
  };

  const createGroupConversation = async ({ name, members }) => {
    if (!meId) return;
    const ids = (await Promise.all((members || []).map(h => resolveUserId(h)))).filter(Boolean);
    const convId = await createGroup(name, ids).catch(() => null);
    if (!convId) return;
    await fetchConversations().then(setConversations).catch(() => {});
    setShowDMs(false);
    openConversation(convId);
  };

  const lightCandle = (graveId) => {
    const next = graves.map(g => g.id === graveId
      ? { ...g, candleLitAt: Date.now(), flowers: (g.flowers || 0) + 1, addedFlowers: [meHandle, ...(g.addedFlowers || [])] }
      : g
    );
    setGraves(next);
    persistState('graves', next);
    addNotification({ kind: 'candle', avatar: '🕯', text: `you lit a candle` });
  };

  const saveSigil = (sigil) => {
    const next = [{ id: `s${Date.now()}`, ...sigil, sealedAt: Date.now() }, ...sigils];
    setSigils(next);
    persistState('sigils', next);
    logActivity({ kind: 'sigil', glyph: '⛧', label: 'sealed a sigil', detail: sigil.intention });
  };

  const openUserProfile = (handle) => {
    if (!handle || handle === meHandle) return;
    setActiveUserHandle(handle);
  };

  const toggleFollow = (handle) => {
    if (!handle || handle === meHandle) return;
    const wasFollowing = !!following[handle];
    setFollowing(prev => {
      const next = { ...prev };
      if (wasFollowing) delete next[handle];
      else {
        next[handle] = Date.now();
        addNotification({ kind: 'follow', user: handle, avatar: '✦', text: `you followed ${handle}` });
        logActivity({ kind: 'follow', glyph: '✦', label: `bound to ${handle}`, handle });
      }
      return next;
    });
    if (!meId) return;
    (async () => {
      let followeeId = followIdByHandle.current[handle];
      if (!followeeId) {
        try { followeeId = (await getProfileByHandle(handle))?.id; } catch { followeeId = null; }
        if (followeeId) followIdByHandle.current[handle] = followeeId;
      }
      if (!followeeId) return; // seed-only handle with no real account — local-only
      try {
        if (wasFollowing) await unfollowUser(meId, followeeId);
        else await followUser(meId, followeeId);
      } catch {
        // revert on failure
        setFollowing(prev => {
          const next = { ...prev };
          if (wasFollowing) next[handle] = Date.now(); else delete next[handle];
          return next;
        });
      }
    })();
  };

  const postStory = async (story) => {
    if (!meId) return;
    try {
      const saved = await dbPostStory(story, { id: meId, handle: meHandle, avatar: meAvatar });
      setStories(prev => [...prev, saved]);
    } catch { /* ignore */ }
  };

  const removeStory = (id) => {
    setStories(prev => prev.filter(s => s.id !== id));
    deleteStory(id).catch(() => {});
  };

  const addOddity = async (data) => {
    if (!meId) return;
    try {
      const saved = await createListing(data, { id: meId, handle: meHandle, avatar: meAvatar });
      setListings(prev => [saved, ...prev]);
    } catch { /* ignore */ }
  };

  const refreshCrews = () => listCrews().then(setCrews).catch(() => {});

  // A crew is a public group conversation — opening it routes through the DM thread.
  const joinCrewHandler = async (convId) => {
    setCrewBusy(prev => ({ ...prev, [convId]: true }));
    try {
      await dbJoinCrew(convId);
      const c = crews.find(x => x.id === convId);
      addNotification({ kind: 'crew', avatar: c?.glyph || '✦', text: `you joined ${c?.name || 'a crew'}` });
      logActivity({ kind: 'join', glyph: c?.glyph || '✦', label: `joined ${c?.name || 'a crew'}` });
      await refreshCrews();
      await fetchConversations().then(setConversations).catch(() => {});
      setShowCrewBrowse(false);
      openConversation(convId, { user: c?.name || 'a crew', avatar: c?.glyph || '✦', group: true });
    } catch { /* ignore */ }
    finally { setCrewBusy(prev => { const n = { ...prev }; delete n[convId]; return n; }); }
  };

  const createCrewHandler = async ({ name, glyph, description }) => {
    try {
      const convId = await dbCreateCrew(name, glyph, description);
      addNotification({ kind: 'crew', avatar: glyph || '✦', text: `you conjured ${name}` });
      logActivity({ kind: 'join', glyph: glyph || '✦', label: `conjured ${name}` });
      await refreshCrews();
      await fetchConversations().then(setConversations).catch(() => {});
      setShowCrewBrowse(false);
      openConversation(convId, { user: name, avatar: glyph || '✦', group: true });
    } catch { /* ignore */ }
  };

  const toggleMute = (handle) => {
    setMuted(prev => {
      const next = { ...prev };
      if (next[handle]) delete next[handle];
      else next[handle] = Date.now();
      return next;
    });
  };

  const addGrave = (grave) => {
    const next = [{ id: `g${Date.now()}`, flowers: 0, addedFlowers: [], visibility: 'friends', ...grave }, ...graves];
    setGraves(next);
    persistState('graves', next);
  };

  const addAnniversary = (anniv) => {
    setAnniversaries(prev => [...prev, { id: `a${Date.now()}`, visible: false, ...anniv }]);
  };

  const recordCardDraw = (dateKey, card) => {
    setCardHistory(prev => prev[dateKey] ? prev : { ...prev, [dateKey]: card });
  };

  const addMarginalia = (textId, mark) => {
    setMarginalia(prev => ({
      ...prev,
      [textId]: [...(prev[textId] || []), { id: `mg${Date.now()}`, ...mark, at: Date.now() }],
    }));
  };

  const removeMarginalia = (textId, markId) => {
    setMarginalia(prev => ({
      ...prev,
      [textId]: (prev[textId] || []).filter(m => m.id !== markId),
    }));
  };

  const visiblePosts = posts.filter(p => {
    if (hiddenPosts[p.id]) return false;
    if (muted[p.user]) return false;
    if (mutedKeywords.length > 0 && p.body) {
      const body = p.body.toLowerCase();
      if (mutedKeywords.some(k => k && body.includes(k.toLowerCase()))) return false;
    }
    if (p.authorId && blockedIds.has(p.authorId)) return false; // blocked both-ways
    return true;
  });

  const hidePost = (postId) => setHiddenPosts(prev => ({ ...prev, [postId]: Date.now() }));

  const blockUserById = async (profileId, handle) => {
    if (!profileId) return;
    setBlockedIds(prev => new Set(prev).add(profileId));
    setActiveUserHandle(null);
    addNotification({ kind: 'follow', avatar: '⛒', text: `you blocked ${handle || 'someone'}` });
    try { await dbBlockUser(profileId); } catch { /* ignore */ }
    fetchFeed(meId, { scope: feedScope }).then(setPosts).catch(() => {});
  };
  const unblockUserById = async (profileId) => {
    if (!profileId) return;
    await dbUnblockUser(profileId);
    setBlockedIds(prev => { const n = new Set(prev); n.delete(profileId); return n; });
    fetchFeed(meId, { scope: feedScope }).then(setPosts).catch(() => {});
  };
  const reportTarget = async (kind, targetId) => {
    try { await reportContent(kind, targetId, ''); addNotification({ kind: 'follow', avatar: '⚑', text: 'reported — thank you' }); }
    catch { /* ignore */ }
  };

  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const ritualDoneToday = ritual.lastDay === todayKey;

  const performRitual = () => {
    if (ritualDoneToday) return;
    const continuing = ritual.lastDay === yesterdayKey;
    const newStreak = continuing ? ritual.streak + 1 : 1;
    setRitual({ streak: newStreak, lastDay: todayKey });
    addNotification({ kind: 'vespers', avatar: '☩', text: `ritual marked · ${newStreak}d streak` });
    logActivity({ kind: 'ritual', glyph: '☩', label: `kept the ritual · day ${newStreak}` });
  };

  const toggleCrystal = (id) => {
    setCrystals(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 6 ? [...prev, id] : prev);
  };

  const togglePin = (postId) => {
    setPinnedPostId(prev => prev === postId ? null : postId);
  };

  const logDivination = (entry) => {
    setDivinationLog(prev => [{ id: `dv${Date.now()}`, at: Date.now(), ...entry }, ...prev].slice(0, 100));
  };

  const highlightStory = (story) => {
    setStoryHighlights(prev => [{ id: `sh${Date.now()}`, savedAt: Date.now(), ...story }, ...prev]);
  };
  const removeHighlight = (id) => {
    setStoryHighlights(prev => prev.filter(h => h.id !== id));
  };

  const logActivity = (entry) => {
    setActivityLog(prev => [{ id: `act${Date.now()}`, at: Date.now(), ...entry }, ...prev].slice(0, 100));
  };

  const addReflection = (body) => {
    const next = [{ id: `rf${Date.now()}`, body, at: Date.now() }, ...reflections];
    setReflections(next);
    persistState('reflections', next);
  };
  const removeReflection = (id) => {
    const next = reflections.filter(r => r.id !== id);
    setReflections(next);
    persistState('reflections', next);
  };

  const togglePostCandle = (postId) => {
    setPostCandles(prev => {
      const next = { ...prev };
      if (next[postId]) delete next[postId];
      else next[postId] = Date.now();
      return next;
    });
  };

  const handleNotificationTap = (n) => {
    markNotifRead(n.id);
    setShowNotifs(false);
    if (n.kind === 'dm' && n.conversationId) {
      openConversation(n.conversationId, { user: n.user, avatar: n.avatar });
    } else if (n.kind === 'follow' && n.user && n.user !== 'someone') {
      setActiveUserHandle(n.user);
    } else if ((n.kind === 'react' || n.kind === 'comment') && n.postId) {
      setActivePostComments(n.postId);
    } else if (n.kind === 'event') {
      setTab('events');
    }
  };

  const handleOnboard = async (data) => {
    if (!userId) return;
    try {
      await insertProfile({
        id: userId,
        handle: data.handle,
        avatar: data.glyph || '✦',
        city: data.city || '',
        birthday: data.birthday || null,
        tags: [...new Set(['goth', ...(data.vibes || []).slice(0, 3)])],
        scenes: data.scenes || [],
        bio: (data.vibes || []).length ? data.vibes.join(' · ') + ' · ' + data.city : (data.city || ''),
      });
    } catch (e) {
      if (e?.code === '23505') throw new Error('handle taken');
      throw e;
    }
    await refreshProfile();
  };

  const saveProfile = async (next) => {
    setProfile(next); // optimistic
    if (!meId) return;
    try {
      await updateProfile(meId, {
        handle: next.name,
        avatar: next.avatar,
        avatar_url: next.avatarUrl || null,
        pronouns: next.pronouns || '',
        bio: next.bio || '',
        tags: next.tags || [],
        city: next.city || next.scene || '',
        birthday: next.birthday || null,
      });
      await refreshProfile();
    } catch {
      await refreshProfile(); // revert to server truth on failure (e.g. handle taken)
    }
  };

  // === RENDER ===
  if (!isSupabaseConfigured) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-[#0A0A0A] text-[#F5F1E8] flex items-center justify-center min-h-[100dvh] px-8 text-center">
        <div>
          <div className="text-[#C9A961] text-4xl mb-4" style={F.brand}>Coven</div>
          <p className="text-[#A8A29E] text-sm" style={F.serif}>backend not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then reload.</p>
        </div>
      </div>
    );
  }
  if (authLoading || (session && dbProfile && !profile)) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-[#0A0A0A] text-[#C9A961] flex items-center justify-center min-h-[100dvh]">
        <div className="text-5xl animate-pulse-slow" style={F.brand}>Coven</div>
      </div>
    );
  }
  if (recovery) {
    return <ResetPasswordScreen />;
  }
  if (!session) {
    return <SignInScreen />;
  }
  if (!dbProfile) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-black text-[#F5F1E8] relative overflow-hidden min-h-[100dvh]">
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
      return (
        <CommunityDetail
          id={community}
          onBack={() => setCommunity(null)}
          posts={posts}
          isMember={!!communityMembership[community]}
          onToggleMembership={() => toggleCommunityMembership(community)}
        />
      );
    }
    if (tab === 'home') return (
      <HomeScreen
        posts={visiblePosts}
        onReact={reactToPost}
        onOpenComments={(id) => setActivePostComments(id)}
        onOpenCommunity={setCommunity}
        onOpenUser={openUserProfile}
        onDeletePost={deletePost}
        onHidePost={hidePost}
        onQuotePost={(id) => setQuoteTarget(id)}
        onTogglePin={togglePin}
        pinnedPostId={pinnedPostId}
        feedSort={feedSort}
        onSetFeedSort={setFeedSort}
        feedScope={feedScope}
        onSetFeedScope={setFeedScope}
        onLoadMore={loadMoreFeed}
        feedHasMore={feedHasMore}
        onReportPost={(id) => reportTarget('post', id)}
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        postCandles={postCandles}
        onToggleCandle={togglePostCandle}
        onOpenEvent={(ref) => {
          if (typeof ref === 'string') return setActiveEvent(ref);
          if (ref?.id) return setActiveEvent(ref.id);
          if (ref?.name) {
            const found = events.find(e => e.name.toLowerCase() === ref.name.toLowerCase());
            if (found) setActiveEvent(found.id);
          }
        }}
        onVotePoll={voteOnPoll}
        onOpenStory={(i) => setActiveStoryIndex(i)}
        onCreateStory={() => setShowStoryComposer(true)}
        stories={stories}
        meHandle={meHandle}
        meAvatar={meAvatar}
        tonightStatus={tonightStatus}
        onOpenTonightStatus={() => setShowTonightModal(true)}
        onOpenTarot={() => setActivePortal('tarot')}
        onOpenEphemeris={() => setActivePortal('ephemeris')}
        onOpenLibrary={(id) => { setActivePortal('library'); setActiveText(id); }}
        onOpenCodex={() => setActivePortal('codex')}
        onOpenVespersArchive={() => setShowVespersArchive(true)}
        settings={settings}
      />
    );
    if (tab === 'communities') return (
      <CommunitiesScreen
        onOpenCommunity={setCommunity}
        membership={communityMembership}
        onToggleMembership={toggleCommunityMembership}
      />
    );
    if (tab === 'map') {
      if (festivalEvent && exitedFestivalId !== festivalEvent.id) {
        return <FestivalMap event={festivalEvent} onExit={() => setExitedFestivalId(festivalEvent.id)} />;
      }
      return (
        <MapScreen
          tonightStatus={tonightStatus}
          pins={tonightPins.filter(p => p.userId !== meId && !blockedIds.has(p.userId))}
          onOpenUser={(h) => setActiveUserHandle(h)}
          onOpenTonightStatus={() => setShowTonightModal(true)}
          festivalEvent={festivalEvent && exitedFestivalId === festivalEvent.id ? festivalEvent : null}
          onEnterFestival={() => setExitedFestivalId(null)}
        />
      );
    }
    if (tab === 'events') return (
      <EventsScreen events={events} rsvp={eventRsvp} onToggleRsvp={toggleEventRsvp} onOpenEvent={(id) => setActiveEvent(id)} onCreateEvent={() => setShowCreateEvent(true)} />
    );
    if (tab === 'fits') return <FashionScreen />;
    if (tab === 'profile') return (
      <ProfileScreen
        profile={{ ...profile, status: tonightStatus?.text || null }}
        graves={graves}
        anniversaries={anniversaries}
        trackers={trackers}
        onUpdateTracker={updateTracker}
        onOpenTonightStatus={() => setShowTonightModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        onEditProfile={() => setShowEditProfile(true)}
        onLightCandle={lightCandle}
        crews={crews.filter(c => c.isMember)}
        onOpenCrew={(id) => openConversation(id)}
        onBrowseCrews={() => setShowCrewBrowse(true)}
        onAddGrave={() => setShowAddGrave(true)}
        onAddAnniversary={() => setShowAddAnniv(true)}
        onOpenNowPlaying={() => setShowNowPlaying(true)}
        nowPlaying={nowPlaying}
        activityLog={activityLog}
        reflectionsCount={reflections.length}
        onOpenReflections={() => setShowReflections(true)}
        onOpenTickets={() => setShowMyTickets(true)}
        ritual={ritual}
        ritualDoneToday={ritualDoneToday}
        onPerformRitual={performRitual}
        crystals={crystals}
        onToggleCrystal={toggleCrystal}
        pinnedPost={pinnedPostId ? posts.find(p => p.id === pinnedPostId && p.mine) : null}
        shrineTheme={shrineTheme}
        onSetShrineTheme={setShrineTheme}
        storyHighlights={storyHighlights}
        onRemoveHighlight={removeHighlight}
        achievementState={{
          posts, me: meHandle, sigils, crystals, ritual,
          communityMembership, reflections, graves, bookmarks,
          divinationLog, following,
        }}
        sigils={sigils}
        bookmarks={Object.keys(bookmarks).map(id => posts.find(p => p.id === id)).filter(Boolean)}
        onOpenComments={(id) => setActivePostComments(id)}
        mementoMoriOn={settings.mementoMori}
        settings={settings}
      />
    );
    return null;
  };

  return (
    <div className="phone-frame max-w-md mx-auto relative overflow-hidden h-[100dvh] text-[#F5F1E8]"
      style={{ background: settings.parchmentMode ? '#EDE0C2' : '#0A0A0A' }}>
      {/* Vignette */}
      {settings.vignette && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: settings.parchmentMode
            ? 'radial-gradient(ellipse at center, transparent 60%, rgba(58, 34, 12, 0.25) 100%)'
            : 'radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.55) 100%)'
        }} />
      )}

      {/* Weather mood — subtle tint derived from the live local weather */}
      {settings.weatherMood && weatherTint && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: weatherTint.color,
          opacity: weatherTint.opacity,
          mixBlendMode: 'soft-light',
        }} />
      )}

      {/* Color mood — Blood moon (red wash) or Ash (desaturate). Rendered as
          overlay layers (not a root CSS filter) so fixed modals don't break. */}
      {settings.colorMood === 'bloodMoon' && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(139,0,0,0.35), rgba(60,0,0,0.5))',
          mixBlendMode: 'soft-light',
        }} />
      )}
      {settings.colorMood === 'ash' && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          backdropFilter: 'grayscale(0.85) contrast(1.05)',
          WebkitBackdropFilter: 'grayscale(0.85) contrast(1.05)',
        }} />
      )}

      {/* Grain */}
      {settings.grainIntensity > 0 && <GrainOverlay opacity={settings.grainIntensity} />}

      {/* Fixed header (pinned to the viewport frame) */}
      <Header
        tab={tab}
        onDMs={() => setShowDMs(true)}
        onCompose={() => setShowCompose(true)}
        onLibrary={onLibraryTap}
        onNotifications={() => {
          setShowNotifs(true);
          // If already granted, silently make sure this device stays subscribed.
          // First-time enabling (with feedback) lives in Settings → notifications.
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            enablePush(meId).then(refreshPushState).catch(() => {});
          }
        }}
        onSearch={() => setShowSearch(true)}
        communityName={community ? COMMUNITIES.find(c => c.id === community)?.name : null}
        unreadNotifications={unreadNotifs}
        unreadDMs={unreadDMs}
        parchment={settings.parchmentMode}
      />
      {/* Main content scrolls INSIDE the frame, between the fixed header and bottom nav.
          (top-[60px]/bottom-[68px] already include the safe-area insets — see index.css.) */}
      <div className="absolute inset-0 top-[60px] bottom-[68px] overflow-y-auto">
        <div className="animate-screen-in" key={`${tab}-${community || ''}`}>
          {renderTab()}
        </div>
      </div>

      <BottomNav tab={tab} onChange={(t) => { setTab(t); setCommunity(null); }} parchment={settings.parchmentMode} />

      <InstallPrompt />

      {/* Overlays */}
      {showDMs && !activeConversation && (
        <DMsOverlay
          conversations={conversations}
          onClose={() => setShowDMs(false)}
          onOpenConversation={openConversation}
          onNewGroup={() => setShowNewGroup(true)}
          onBury={buryConversation}
        />
      )}
      {showNewGroup && (
        <NewGroupDMModal
          people={followingPeople}
          onCreate={createGroupConversation}
          onClose={() => setShowNewGroup(false)}
        />
      )}
      {activeConversation && (
        <ChatThread
          conversationId={activeConversation}
          conversation={conversations.find(c => c.id === activeConversation) || activeConvMeta}
          messages={messages[activeConversation] || []}
          onSend={(body) => sendMessage(activeConversation, body)}
          onRetry={(messageId) => retryMessage(activeConversation, messageId)}
          onBack={() => { setActiveConversation(null); setActiveConvMeta(null); }}
        />
      )}
      {showCompose && (
        <ComposeOverlay
          meId={meId}
          onClose={() => setShowCompose(false)}
          onPost={(data) => { addPost(data); setShowCompose(false); }}
        />
      )}
      {activePostComments && (
        <CommentsOverlay
          post={posts.find(p => p.id === activePostComments)}
          onClose={() => setActivePostComments(null)}
          onComment={(body, parentId) => addComment(activePostComments, body, parentId)}
          onReact={(kind) => reactToPost(activePostComments, kind)}
          onReactComment={(commentId, kind) => reactToComment(activePostComments, commentId, kind)}
          isBookmarked={!!bookmarks[activePostComments]}
          onToggleBookmark={() => toggleBookmark(activePostComments)}
          onOpenUser={openUserProfile}
        />
      )}
      {activeUserHandle && (
        <UserProfileOverlay
          handle={activeUserHandle}
          posts={posts}
          isFollowing={!!following[activeUserHandle]}
          isMuted={!!muted[activeUserHandle]}
          onToggleFollow={() => toggleFollow(activeUserHandle)}
          onToggleMute={() => toggleMute(activeUserHandle)}
          onWhisper={() => { const h = activeUserHandle; setActiveUserHandle(null); openDMWithUser(h); }}
          onOpenComments={(id) => setActivePostComments(id)}
          onReact={reactToPost}
          onBlock={(profileId) => blockUserById(profileId, activeUserHandle)}
          onReport={(profileId) => reportTarget('user', profileId)}
          onClose={() => setActiveUserHandle(null)}
        />
      )}
      {showNotifs && (
        <NotificationsPanel
          notifications={notifications.filter(n => {
            const kinds = settings.notificationKinds;
            if (!kinds) return true;
            return kinds[n.kind] !== false;
          })}
          onClose={() => setShowNotifs(false)}
          onMarkAllRead={markAllNotifsRead}
          onMarkRead={markNotifRead}
          onTap={handleNotificationTap}
          onClearAll={() => { setNotifications([]); clearNotifications().catch(() => {}); }}
        />
      )}
      {showTonightModal && (
        <TonightStatusModal
          current={tonightStatus}
          onSave={saveTonightStatus}
          onClose={() => setShowTonightModal(false)}
        />
      )}
      {showEditProfile && (
        <ProfileEditModal
          profile={profile}
          meId={meId}
          onSave={saveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={activeStoryIndex}
          onReply={(authorHandle, body) => sendMessageToUser(authorHandle, body)}
          onReactStory={(storyId, kind) => { if (meId) reactToStory(storyId, kind, meId).catch(() => {}); }}
          onDelete={removeStory}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
      {showStoryComposer && (
        <StoryComposer
          meId={meId}
          onClose={() => setShowStoryComposer(false)}
          onPost={(story) => { postStory(story); setShowStoryComposer(false); }}
        />
      )}
      {showCrewBrowse && (
        <CrewBrowse
          crews={crews}
          busy={crewBusy}
          onJoin={joinCrewHandler}
          onCreate={createCrewHandler}
          onOpen={(id) => { setShowCrewBrowse(false); openConversation(id); }}
          onClose={() => setShowCrewBrowse(false)}
        />
      )}
      {showAddGrave && (
        <AddGraveModal onSave={addGrave} onClose={() => setShowAddGrave(false)} />
      )}
      {showAddAnniv && (
        <AddAnniversaryModal onSave={addAnniversary} onClose={() => setShowAddAnniv(false)} />
      )}
      {activeEvent && (
        <EventDetail
          event={events.find(e => e.id === activeEvent)}
          isGoing={!!eventRsvp[activeEvent]}
          onToggleRsvp={toggleEventRsvp}
          attendees={activeEventAttendees}
          meHandle={meHandle}
          onBuy={buyTicket}
          onManageTickets={(ev) => setTicketManagerEvent(ev)}
          onOpenUser={(h) => { setActiveEvent(null); setActiveUserHandle(h); }}
          onBack={() => setActiveEvent(null)}
        />
      )}
      {showCreateEvent && (
        <CreateEventModal onCreate={addEvent} onClose={() => setShowCreateEvent(false)} />
      )}
      {ticketManagerEvent && (
        <TicketManager
          event={ticketManagerEvent}
          onClose={() => setTicketManagerEvent(null)}
          onEditVenueMap={() => { const ev = ticketManagerEvent; setTicketManagerEvent(null); setVenueEditorEvent(ev); }}
        />
      )}
      {venueEditorEvent && (
        <VenueMapEditor
          event={venueEditorEvent}
          me={{ id: meId }}
          onClose={() => setVenueEditorEvent(null)}
          onSaved={() => { fetchEvents(meId).then(({ events: ev }) => setEvents(ev)).catch(() => {}); }}
        />
      )}
      {ticketSuccess && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-8" onClick={() => setTicketSuccess(false)}>
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] p-8 text-center max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">🎟</div>
            <div className="text-[#C9A961] text-lg mb-1" style={F.display}>TICKET SECURED</div>
            <p className="text-[#A8A29E] text-sm" style={F.serif}>your spot is held. see you in the dark.</p>
            <button onClick={() => setTicketSuccess(false)} className="mt-5 text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>close</button>
          </div>
        </div>
      )}
      {showVespersArchive && (
        <VespersArchiveModal
          onClose={() => setShowVespersArchive(false)}
          onOpenLibrary={(id) => { setActivePortal('library'); setActiveText(id); setShowVespersArchive(false); }}
        />
      )}
      {quoteTarget && (
        <QuoteModal
          post={posts.find(p => p.id === quoteTarget)}
          onSubmit={(text) => repostPost(quoteTarget, text)}
          onClose={() => setQuoteTarget(null)}
        />
      )}
      {showReflections && (
        <ReflectionsModal
          reflections={reflections}
          onAdd={addReflection}
          onRemove={removeReflection}
          onClose={() => setShowReflections(false)}
        />
      )}
      {showNowPlaying && (
        <NowPlayingModal
          current={nowPlaying}
          onSave={(v) => { setNowPlaying(v); setShowNowPlaying(false); }}
          onShare={({ artist, track }) => {
            addPost({ body: `🎵 on rotation: ${artist}${artist && track ? ' · ' : ''}${track}`, community: 'music' });
            setShowNowPlaying(false);
          }}
          onClose={() => setShowNowPlaying(false)}
        />
      )}
      {showSearch && (
        <SearchOverlay
          posts={posts}
          events={events}
          onClose={() => setShowSearch(false)}
          onOpenPost={(id) => { setActivePostComments(id); setShowSearch(false); }}
          onOpenUser={(handle) => { setActiveUserHandle(handle); setShowSearch(false); }}
          onOpenCommunity={(id) => { setTab('communities'); setCommunity(id); setShowSearch(false); }}
          onOpenEvent={() => { setTab('events'); setShowSearch(false); }}
          onOpenCodex={() => { setActivePortal('codex'); setShowSearch(false); }}
          onOpenLibrary={(id) => { setActivePortal('library'); setActiveText(id); setShowSearch(false); }}
        />
      )}
      {showSettings && (
        <SettingsScreen
          settings={settings}
          onChange={setSettings}
          onBack={() => setShowSettings(false)}
          onLogout={() => { setShowSettings(false); signOut(); }}
          mutedKeywords={mutedKeywords}
          onSetMutedKeywords={setMutedKeywords}
          payoutStatus={payoutStatus}
          payoutBusy={payoutBusy}
          onSetupPayouts={setupPayouts}
          pushState={pushState}
          onEnablePush={turnPushOn}
          onDisablePush={turnPushOff}
          onEditProfile={() => setShowEditProfile(true)}
          onOpenBlocked={() => setShowBlocked(true)}
        />
      )}
      {showBlocked && (
        <BlockedOverlay
          onBack={() => setShowBlocked(false)}
          onUnblock={unblockUserById}
        />
      )}
      {showMyTickets && (
        <MyTicketsOverlay
          meId={meId}
          onBack={() => setShowMyTickets(false)}
          onOpenEvent={(id) => { setShowMyTickets(false); setActiveEvent(id); }}
        />
      )}

      {/* Coven portals */}
      {activePortal === 'menu' && (
        <CovenMenu
          onClose={() => setActivePortal(null)}
          onOpen={(id) => setActivePortal(id)}
        />
      )}
      {(activePortal === 'library' || activeText) && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          {activePortal === 'library' && !activeText && (
            <LibraryOverlay
              onClose={() => setActivePortal('menu')}
              onOpenText={(id) => setActiveText(id)}
            />
          )}
          {activeText && (
            <ReaderView
              textId={activeText}
              marginalia={marginalia[activeText] || []}
              onAddMarginalia={(m) => addMarginalia(activeText, m)}
              onRemoveMarginalia={(id) => removeMarginalia(activeText, id)}
              meHandle={meHandle}
              meAvatar={meAvatar}
              onBack={() => setActiveText(null)}
            />
          )}
        </Suspense>
      )}
      {activePortal === 'tarot' && (
        <TarotOverlay
          onClose={() => setActivePortal('menu')}
          history={cardHistory}
          onRecord={recordCardDraw}
          onLogDivination={logDivination}
          divinationLog={divinationLog}
          onShare={(pull) => {
            const body = `✦ today's pull: ${pull.card.name}${pull.reversed ? ' · reversed' : ''} — "${pull.reversed ? pull.card.reversed : pull.card.upright}"`;
            addPost({ body, community: 'general' });
            setActivePortal('menu');
          }}
        />
      )}
      {activePortal === 'codex' && (
        <CodexOverlay onClose={() => setActivePortal('menu')} />
      )}
      {activePortal === 'ephemeris' && (
        <EphemerisOverlay onClose={() => setActivePortal('menu')} profile={profile} />
      )}
      {activePortal === 'sigils' && (
        <SigilOverlay onClose={() => setActivePortal('menu')} onSave={saveSigil} />
      )}
      {activePortal === 'pendulum' && (
        <PendulumOverlay onClose={() => setActivePortal('menu')} onLog={logDivination} />
      )}
      {activePortal === 'souls' && (
        <SoulsOverlay
          meId={meId}
          following={following}
          onClose={() => setActivePortal('menu')}
          onOpenUser={(h) => { setActivePortal(null); setActiveUserHandle(h); }}
        />
      )}
      {activePortal === 'confessions' && (
        <ConfessionsOverlay onClose={() => setActivePortal('menu')}
          userConfessions={posts.filter(p => p.anonymous).map(p => ({
            id: p.id, body: p.body, at: Date.now(),
            reactions: p.reactions, myReactions: p.myReactions || {},
          }))} />
      )}
      {activePortal === 'oddities' && !activeOddity && !showOddityCompose && (
        <OdditiesOverlay
          onClose={() => setActivePortal('menu')}
          onOpenOddity={(id) => setActiveOddity(id)}
          onCompose={() => setShowOddityCompose(true)}
          listings={listings}
        />
      )}
      {activeOddity && (
        <OddityDetail
          item={listings.find(l => l.id === activeOddity)}
          onWhisper={(h) => { setActiveOddity(null); setActivePortal(null); openDMWithUser(h); }}
          onOpenUser={(h) => { setActiveOddity(null); setActivePortal(null); if (h && h !== meHandle) setActiveUserHandle(h); }}
          onBack={() => setActiveOddity(null)}
        />
      )}
      {showOddityCompose && (
        <OddityCompose
          meId={meId}
          onClose={() => setShowOddityCompose(false)}
          onCreate={(data) => addOddity(data)}
        />
      )}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
