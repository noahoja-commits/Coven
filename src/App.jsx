import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './auth/AuthProvider';
import { isSupabaseConfigured } from './lib/supabase';
import { SignInScreen } from './components/auth/SignInScreen';
import { fetchFeed, fetchPostById, createPost, deletePost as dbDeletePost, updatePost as dbUpdatePost, updateComment as dbUpdateComment, deleteComment as dbDeleteComment, togglePostReaction, fetchComments, createComment, toggleCommentReaction, castPollVote, clearPollVote, fetchEventRecaps } from './lib/db/posts';
import { insertProfile, updateProfile, getProfileStats, getProfileByHandle, fetchProfiles, saveNotificationPrefs } from './lib/db/profiles';
import { fetchFollowing, fetchFollowers, followUser, unfollowUser } from './lib/db/social';
import { FollowListOverlay } from './components/profile/FollowListOverlay';
import { joinCommunity, leaveCommunity, fetchCommunityMemberCounts } from './lib/db/communities';
import { fetchConversations, getOrCreateDM, createGroup, fetchMessages as fetchDMMessages, sendDM, markRead as dmMarkRead, setBuried as dmSetBuried, subscribeDMs, toggleDMReaction, subscribeDMReactions, sendPostToDM } from './lib/db/dm';
import { fetchActiveStories, postStory as dbPostStory, deleteStory, reactToStory } from './lib/db/stories';
import { fetchListings, createListing, deleteListing, markListingSold } from './lib/db/listings';
import { fetchShops, createShop, deleteShop as dbDeleteShop, startBoostCheckout } from './lib/db/shops';
import { fetchPayoutStatus, startPayoutSetup, refreshPayoutStatus } from './lib/db/payouts';
import { listCrews, createCrew as dbCreateCrew, joinCrew as dbJoinCrew, leaveCrew } from './lib/db/crews';
import { fetchProfileState, saveProfileState, saveMyspace } from './lib/db/profileState';
import { MySpaceEditor } from './components/profile/MySpaceEditor';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications, subscribeNotifications, hydrateRealtime } from './lib/db/notifications';
import { fetchBlockedIds, blockUser as dbBlockUser, unblockUser as dbUnblockUser, reportContent } from './lib/db/moderation';
import { BlockedOverlay } from './components/settings/BlockedOverlay';
import { TermsGate } from './components/legal/TermsGate';
import { TERMS_VERSION } from './lib/legal';
import { DeleteAccountModal } from './components/settings/DeleteAccountModal';
import { deleteAccount } from './lib/db/account';
import { ReportSheet } from './components/shared/ReportSheet';
import { enablePush, disablePush, pushStatus } from './lib/db/push';
import { setTonightPin, clearTonightPin, fetchTonightPins, subscribeTonightPins, setTonightGeo, clearTonightGeo, fetchNearby } from './lib/db/tonight';
import { Toast } from './components/shared/Toast';
import { fetchMyTicketEventIds } from './lib/db/festival';
import { FestivalMap } from './components/festival/FestivalMap';
import { VenueMapEditor } from './components/festival/VenueMapEditor';
import { SHOCK_FONT_HREF, F } from './styles/fonts';
import { Header } from './components/shared/Header';
import { BottomNav } from './components/shared/BottomNav';
import { FeatureBoundary } from './components/FeatureBoundary';
import { withRetry } from './lib/withRetry';
import { DMsOverlay } from './components/shared/DMsOverlay';
import { ChatThread } from './components/shared/ChatThread';
import { ComposeOverlay } from './components/shared/ComposeOverlay';
import { NotificationsPanel } from './components/shared/NotificationsPanel';
import { GrainOverlay, AmbientGlow, HalftoneOverlay } from './components/shared/Visuals';
import { SHOCK_MODES } from './components/shared/shockModes';
// ShockOverlay is ~78 kB of source (the whole horror system) and only renders when a
// shock mode is active — lazy-load it so it never weighs down first paint.
const ShockOverlay = lazy(() => import('./components/shared/ShockOverlay').then(m => ({ default: m.ShockOverlay })));
import { ShockModePicker } from './components/settings/ShockModePicker';
import { startAmbient, stopAmbient } from './lib/ambient';
import { fetchWeatherTint, getPosition, getPositionIfGranted, markGeoGranted } from './lib/weather';
import { InstallPrompt } from './components/shared/InstallPrompt';

import { HomeScreen } from './components/feed/HomeScreen';
import { CommunitiesScreen, CommunityDetail } from './components/communities/CommunitiesScreen';
import { MapScreen } from './components/map/MapScreen';
import { EventsScreen } from './components/events/EventsScreen';
const ProfileScreen = lazy(() => import('./components/profile/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const LegalScreen = lazy(() => import('./components/legal/LegalScreen').then(m => ({ default: m.LegalScreen })));
const ResetPasswordScreen = lazy(() => import('./components/auth/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })));
import { TonightStatusModal } from './components/profile/TonightStatusModal';
import { AdminPanel } from './components/settings/AdminPanel';
import { ProfileEditModal } from './components/profile/ProfileEditModal';
import { MoodModal } from './components/profile/MoodModal';
import { moodActive } from './data/moods';
import { ShareToDMModal } from './components/shared/ShareToDMModal';
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
import { DreamJournalModal } from './components/profile/DreamJournalModal';

import { CovenMenu } from './components/coven/CovenMenu';
// Lazy — the Coven portals + marketplace are all off the initial render path, so keep
// them out of the main bundle and load on first open (wrapped in Suspense below).
const OdditiesOverlay = lazy(() => import('./components/oddities/OdditiesOverlay').then(m => ({ default: m.OdditiesOverlay })));
const OddityDetail = lazy(() => import('./components/oddities/OddityDetail').then(m => ({ default: m.OddityDetail })));
const OddityCompose = lazy(() => import('./components/oddities/OddityCompose').then(m => ({ default: m.OddityCompose })));
const TarotOverlay = lazy(() => import('./components/coven/TarotOverlay').then(m => ({ default: m.TarotOverlay })));
const CodexOverlay = lazy(() => import('./components/coven/CodexOverlay').then(m => ({ default: m.CodexOverlay })));
const EphemerisOverlay = lazy(() => import('./components/coven/EphemerisOverlay').then(m => ({ default: m.EphemerisOverlay })));
const SigilOverlay = lazy(() => import('./components/coven/SigilOverlay').then(m => ({ default: m.SigilOverlay })));
const PendulumOverlay = lazy(() => import('./components/coven/PendulumOverlay').then(m => ({ default: m.PendulumOverlay })));
const ConfessionsOverlay = lazy(() => import('./components/coven/ConfessionsOverlay').then(m => ({ default: m.ConfessionsOverlay })));
const SoulsOverlay = lazy(() => import('./components/coven/SoulsOverlay').then(m => ({ default: m.SoulsOverlay })));
const SigilDrawOverlay = lazy(() => import('./components/coven/SigilDrawOverlay').then(m => ({ default: m.SigilDrawOverlay })));
const IntentionTimerOverlay = lazy(() => import('./components/coven/IntentionTimerOverlay').then(m => ({ default: m.IntentionTimerOverlay })));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const HashtagFeed = lazy(() => import('./components/feed/HashtagFeed').then(m => ({ default: m.HashtagFeed })));

import { AgeGate } from './components/shared/AgeGate';
import { DEFAULT_SETTINGS } from './components/settings/defaults';
// Rare-path screens: onboarding runs once per account, settings/legal open occasionally,
// profile is one tab of five. All lazy — none belong in the first-paint bundle.
const OnboardingFlow = lazy(() => import('./components/onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));
const WelcomeOverlay = lazy(() => import('./components/onboarding/WelcomeOverlay').then(m => ({ default: m.WelcomeOverlay })));
const SettingsScreen = lazy(() => import('./components/settings/SettingsScreen').then(m => ({ default: m.SettingsScreen })));

import { COMMUNITIES } from './data/communities';
import { fetchEvents, fetchEventMap, createEvent, toggleEventRsvp as dbToggleRsvp, fetchEventAttendees, deleteEvent as dbDeleteEvent, joinWaitlist, leaveWaitlist, fetchWaitlist } from './lib/db/events';
import { fetchIsAdmin, heartbeat } from './lib/db/admin';
import { CommentsOverlay } from './components/feed/CommentsOverlay';
import { QuoteModal } from './components/feed/QuoteModal';
// VespersArchiveModal statically imports the ~49 kB TEXTS library — lazy so that data
// only loads when the archive is opened.
const VespersArchiveModal = lazy(() => import('./components/feed/VespersArchiveModal').then(m => ({ default: m.VespersArchiveModal })));
import { TRACKER_CATEGORIES } from './data/profile';
import { livingTheme, meetsAge, isVigil } from './data/helpers';
import { earnedAchievements } from './data/achievements';
import { inQuietHours } from './lib/quietHours';
import { FloatingCat } from './components/shared/FloatingCat';
import { ForbiddenReveal } from './components/shared/ForbiddenReveal';
import { ShockHaunt } from './components/shared/ShockHaunt';
import { primeHorror, startDread, stopDread } from './lib/horror';
import { ShockQuickSwitch } from './components/shared/ShockQuickSwitch';
import { ShockSparks } from './components/shared/ShockSparks';

// Map a RAW notification kind → its settings category. settings.notificationKinds is keyed by
// CATEGORY (reaction/reply/follow/dm/event/crew/digest — see SettingsScreen), but notifications
// carry the raw kind (react/comment/rsvp/…). Without this mapping the in-app bell filter compares
// a raw kind against category keys and silently no-ops for everything but follow/dm.
const NOTIF_KIND_CATEGORY = {
  react: 'reaction', story_react: 'reaction',
  comment: 'reply',
  follow: 'follow', mention: 'follow', coauthor: 'follow',
  dm: 'dm',
  rsvp: 'event', event_reminder: 'event',
  ticket_sale: 'event', event_change: 'event', event_cancelled: 'event', // 0067 kinds
  crew_join: 'crew',
  digest: 'digest',
};

export default function App() {
  // === AUTH ===
  const { loading: authLoading, session, userId, dbProfile, recovery, signOut, refreshProfile } = useAuth();
  const meId = userId;
  const followIdByHandle = useRef({});

  // === STATE ===
  const [tab, setTab] = useState('home');
  // The map layer stays MOUNTED once created (hidden with visibility:hidden on other tabs,
  // which keeps its real size) so the maplibre instance survives tab switches — rebuilding
  // it on every visit (style fetch + tile fetch + worker spin-up) is what made it finicky.
  // It also WARM-MOUNTS ~4s after launch: the map initializes, positions, and renders its
  // tiles invisibly in the background, so the first tap on the map tab is instant.
  const [mapVisited, setMapVisited] = useState(false);
  useEffect(() => { if (tab === 'map') setMapVisited(true); }, [tab]);
  useEffect(() => {
    const t = setTimeout(() => setMapVisited(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const [community, setCommunity] = useState(null);
  const [showDMs, setShowDMs] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  // Best-known meta for the open thread so it renders even before the inbox
  // (fetchConversations) has caught up — e.g. opening from a DM notification or
  // a brand-new conversation. Without this the thread renders blank (no reply box).
  const [activeConvMeta, setActiveConvMeta] = useState(null);
  const [dmPrefill, setDmPrefill] = useState(''); // seeds the chat draft (e.g. an oddity inquiry)
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // UX gate only — every admin surface re-checks server-side
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [toast, setToast] = useState(null);
  const [pushState, setPushState] = useState('off');
  const [weatherTint, setWeatherTint] = useState(null); // {color,opacity} when Weather mood is on
  const [showTonightModal, setShowTonightModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMyspaceEditor, setShowMyspaceEditor] = useState(false);
  const [myspaceCfg, setMyspaceCfg] = useState(null); // own old-web profile blob {about,want,top}
  const [showMood, setShowMood] = useState(false);
  const [sharePostTarget, setSharePostTarget] = useState(null); // postId being forwarded to a DM
  const [showBlocked, setShowBlocked] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportSheet, setReportSheet] = useState(null); // { kind, id } | null
  const [legalEscalation, setLegalEscalation] = useState(null); // 'illegal' | 'copyright' | null
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [activeUserHandle, setActiveUserHandle] = useState(null);
  const [showStoryComposer, setShowStoryComposer] = useState(false);
  const [storyAttachedPost, setStoryAttachedPost] = useState(null); // a post being shared into a story
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeHashtag, setActiveHashtag] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCrewBrowse, setShowCrewBrowse] = useState(false);
  const [showAddGrave, setShowAddGrave] = useState(false);
  const [showAddAnniv, setShowAddAnniv] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  const [showDreams, setShowDreams] = useState(false);
  const [showShockPicker, setShowShockPicker] = useState(false);
  // Hidden horror modes: discovered via secret rituals (anger the familiar, unravel the self).
  // Once summoned, they unlock in the picker. `revealTarget` plays the forbidden intro first.
  const [unlockedShock, setUnlockedShock] = useLocalStorage('unlockedShock', []);
  const [revealTarget, setRevealTarget] = useState(null);
  const summonShock = (mode) => { if (!revealTarget) { primeHorror(); setRevealTarget(mode); } };
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [showVespersArchive, setShowVespersArchive] = useState(false);

  const [activePortal, setActivePortal] = useState(null); // 'menu' | 'oddities' | etc.
  // Tracks whether the current portal was opened from the star→menu (so closing returns
  // to the menu) vs. directly from the home screen / logo (so closing returns to home).
  const [portalFromMenu, setPortalFromMenu] = useState(false);
  const [activeOddity, setActiveOddity] = useState(null);
  const [showOddityCompose, setShowOddityCompose] = useState(false);
  const [composeKind, setComposeKind] = useState('sale'); // sale | wanted | commission
  const [shops, setShops] = useState([]);
  const [activePostComments, setActivePostComments] = useState(null);
  const [followList, setFollowList] = useState(null); // { type:'followers'|'following', people:[] } | null

  const [profile, setProfile] = useState(null); // mapped from the Supabase profile row
  const [tonightStatus, setTonightStatus] = useLocalStorage('tonightStatus', { text: '', setAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  const [tonightPins, setTonightPins] = useState([]); // DB-backed: other souls out tonight
  const [nearby, setNearby] = useState([]); // privacy-fuzzed proximity (only when you share location)
  const [trackers, setTrackers] = useState({}); // Supabase-backed (profile_state)
  const [notifications, setNotifications] = useState([]); // Supabase-backed (DB triggers + realtime)
  const [rawSettings, setSettings] = useLocalStorage('settings', DEFAULT_SETTINGS);
  // Merge in defaults so users with an older persisted settings blob get new keys
  // (otherwise undefined keys defeat the `!== 'none'` / `!== false` gates — e.g. the
  // shock-mode fun pack would mount with no mode selected). First render is correct.
  const settings = { ...DEFAULT_SETTINGS, ...rawSettings };

  // A 'transient' horror mode (paralysis) is NOT a selectable theme — angering the demon plays it
  // for ~10s, then it clears itself. While it plays it overrides the chosen shockMode everywhere
  // the effect renders, but it never persists.
  const [transientShock, setTransientShock] = useState(null);
  const transientTimer = useRef(null);
  const effectiveShockMode = transientShock || settings.shockMode;
  // hygiene: clear any pending transient-scare timer if the app ever unmounts
  useEffect(() => () => clearTimeout(transientTimer.current), []);

  // Sync the client notification-category toggles to the server so push actually
  // respects them (api/_push.sendToUser gates on profiles.notification_prefs by KIND).
  // One-way (client→server); skip the initial mount so we don't clobber stored prefs.
  const notifKindsKey = JSON.stringify(settings.notificationKinds || {});
  const notifSyncedRef = useRef(false);
  useEffect(() => {
    if (!meId) return;
    if (!notifSyncedRef.current) { notifSyncedRef.current = true; return; }
    const CAT_KINDS = { reaction: ['react', 'story_react'], reply: ['comment'], follow: ['follow', 'mention', 'coauthor'], dm: ['dm'], event: ['rsvp', 'event_reminder', 'ticket_sale', 'event_change', 'event_cancelled'], crew: ['crew_join'], digest: ['digest'] };
    const nk = settings.notificationKinds || {};
    const prefs = {};
    for (const [cat, kinds] of Object.entries(CAT_KINDS)) {
      const on = nk[cat] !== false;
      for (const k of kinds) prefs[k] = on;
    }
    saveNotificationPrefs(meId, prefs).catch((e) => console.error('[prefs] save failed — server push may not honor your choices:', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifKindsKey, meId]);

  // Admin gate (UX only — the server re-checks everything) + presence heartbeat.
  // Heartbeat every 2 min while the app is open, plus immediately on login and whenever
  // the tab becomes visible again — that's what powers the admin "souls online" roster.
  useEffect(() => {
    if (!meId) { setIsAdmin(false); return undefined; }
    fetchIsAdmin(meId).then(setIsAdmin).catch(() => setIsAdmin(false));
    heartbeat(meId);
    const beat = setInterval(() => heartbeat(meId), 2 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') heartbeat(meId); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(beat); document.removeEventListener('visibilitychange', onVisible); };
  }, [meId]);

  // Live content state (Supabase-backed)
  const [posts, setPosts] = useState([]);
  const [feedError, setFeedError] = useState(false);
  const [feedReloadKey, setFeedReloadKey] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [followingPeople, setFollowingPeople] = useState([]);
  const activeConversationRef = useRef(null);
  const cloudSyncedRef = useRef(false);
  const [communityMembership, setCommunityMembership] = useLocalStorage('communityMembership', { general: true, goth: true });
  const [ageDob, setAgeDob] = useLocalStorage('ageDob', ''); // DOB attested at an age-gated door (synced to cloud)
  const [communityCounts, setCommunityCounts] = useState({}); // server-backed member counts per scene
  const [communityPosts, setCommunityPosts] = useState(null); // real per-scene feed for the open scene
  const [composeCommunity, setComposeCommunity] = useState(null); // preset scene when composing from a scene
  const [composeEventId, setComposeEventId] = useState(null); // set when composing an event recap
  const [eventRecaps, setEventRecaps] = useState([]); // recap posts for the open event
  const [eventRsvp, setEventRsvp] = useState({});
  const [events, setEvents] = useState([]);
  const [eventsOnMap, setEventsOnMap] = useState([]); // events with coords that pass the map anti-spam gate
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventDraftCoords, setEventDraftCoords] = useState(null); // {lat,lng} picked on the map → pre-pins CreateEventModal
  const [activeEventAttendees, setActiveEventAttendees] = useState([]);
  const [eventWaitlist, setEventWaitlist] = useState({ count: 0, mine: false });
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
  const [postCandles, setPostCandles] = useLocalStorage('postCandles', {});
  const [nowPlaying, setNowPlaying] = useLocalStorage('nowPlaying', null);
  const [activityLog, setActivityLog] = useLocalStorage('activityLog', []);
  const [reflections, setReflections] = useState([]); // Supabase-backed (profile_state)
  const [dreams, setDreams] = useState([]); // private dream journal (profile_state)
  const [activeIntention, setActiveIntention] = useState(null); // spell/intention timer (profile_state)
  const [mutedKeywords, setMutedKeywords] = useLocalStorage('mutedKeywords', []);
  const [hiddenPosts, setHiddenPosts] = useLocalStorage('hiddenPosts', {});
  const [ritual, setRitual] = useLocalStorage('ritual', { streak: 0, lastDay: null });
  const [crystals, setCrystals] = useLocalStorage('crystals', []);
  const [shrine, setShrine] = useLocalStorage('shrine', []); // placed altar object ids
  const [flameLitAt, setFlameLitAt] = useLocalStorage('flameLitAt', 0); // your profile flame
  const [pinnedPostId, setPinnedPostId] = useLocalStorage('pinnedPostId', null);
  const [shrineTheme, setShrineTheme] = useLocalStorage('shrineTheme', 'oxblood');
  const [feedSort, setFeedSort] = useLocalStorage('feedSort', 'latest');
  const [feedScope, setFeedScope] = useState('everyone'); // 'everyone' | 'following'
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true); // first-page spinner/skeleton
  const [suggestedSouls, setSuggestedSouls] = useState([]); // real recent profiles for cold-start
  const [seenWelcome, setSeenWelcome] = useLocalStorage('seenWelcome', false); // one-time first-run guide
  const [loreUnlocked, setLoreUnlocked] = useLocalStorage('loreUnlocked', false); // hidden-lore easter egg
  const [showSigilDraw, setShowSigilDraw] = useState(false);
  const [blockedIds, setBlockedIds] = useState(() => new Set());
  const [divinationLog, setDivinationLog] = useLocalStorage('divinationLog', []);
  const [storyHighlights, setStoryHighlights] = useLocalStorage('storyHighlights', []);
  const [seenStories, setSeenStories] = useLocalStorage('seenStories', {}); // { [storyId]: 1 } — watched stories

  // Core fonts load from index.html <head>. The shock-mode display faces are heavier and rarely
  // used, so pull them in lazily the first time any shock mode is active (then they stay cached).
  useEffect(() => {
    if (effectiveShockMode !== 'none' && !document.querySelector('link[data-shock-fonts]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = SHOCK_FONT_HREF;
      link.setAttribute('data-shock-fonts', '');
      document.head.appendChild(link);
    }
  }, [effectiveShockMode]);

  // Apply parchment mode + global media treatment (one effect, no extra hook)
  useEffect(() => {
    if (settings.parchmentMode) document.body.classList.add('parchment-mode');
    else document.body.classList.remove('parchment-mode');
    document.body.classList.remove('media-noir', 'media-oxblood');
    if (settings.mediaTreatment === 'noir') document.body.classList.add('media-noir');
    else if (settings.mediaTreatment === 'oxblood') document.body.classList.add('media-oxblood');
    // Per-shock-mode GOTHIC typography retheme — a different gothic face per mode, forced across the UI.
    const SHOCK_FONT = {
      insomnia: 'shock-type-grenze', emergency: 'shock-type-grenze', requiem: 'shock-type-grenze',
      'dead-channel': 'shock-type-pirata', glitch: 'shock-type-pirata', alchemy: 'shock-type-pirata',
      scream: 'shock-type-metal', inferno: 'shock-type-metal',
      spatter: 'shock-type-unifraktur', void: 'shock-type-unifraktur', reliquary: 'shock-type-unifraktur',
      rebirth: 'shock-type-rocker', cathedral: 'shock-type-rocker', mist: 'shock-type-rocker',
      keepsake: 'shock-type-fell', vow: 'shock-type-unifraktur', lament: 'shock-type-fell',
      xerox: 'shock-type-oswald', duotone: 'shock-type-oswald',
      egodeath: 'shock-type-grenze', paralysis: 'shock-type-metal',
    };
    document.body.classList.remove('shock-type-grenze', 'shock-type-pirata', 'shock-type-metal', 'shock-type-unifraktur', 'shock-type-rocker', 'shock-type-fell', 'shock-type-oswald');
    const fc = SHOCK_FONT[effectiveShockMode];
    if (fc && !settings.parchmentMode) document.body.classList.add(fc);
    // Some modes recolour the WHOLE app via a reliable element filter on .phone-frame (backdrop-filter
    // wouldn't override the red base): insomnia=candlelit sepia, requiem=stark B&W, mist=sepia,
    // duotone=bone monochrome (its oxblood layer sits on top), ego-death=a breathing uncanny hue-warp,
    // paralysis=drained b&w horror. (insomnia/duotone were electric blue pre-gothic-reskin.)
    const SHOCK_DUO = { insomnia: 'shock-duo-sepia', requiem: 'shock-duo-bw', mist: 'shock-duo-sepia', keepsake: 'shock-duo-sepia', xerox: 'shock-duo-bw', duotone: 'shock-duo-bw', egodeath: 'shock-duo-warp', paralysis: 'shock-duo-bw' };
    document.body.classList.remove('shock-duo-blue', 'shock-duo-bw', 'shock-duo-sepia', 'shock-duo-warp');
    const dc = SHOCK_DUO[effectiveShockMode];
    if (dc && !settings.parchmentMode) document.body.classList.add(dc);
  }, [settings.parchmentMode, settings.mediaTreatment, effectiveShockMode]);

  // Dread bed — a heartbeat + whispers run for as long as a horror mode is active. (Audio only
  // starts once a gesture has resumed the context; the trigger tap primes it.)
  useEffect(() => {
    if (effectiveShockMode === 'paralysis' || effectiveShockMode === 'egodeath') startDread();
    else stopDread();
    return () => stopDread();
  }, [effectiveShockMode]);

  // Ambient drone. The AudioContext MUST be started/resumed synchronously inside
  // the user's tap (toggleSound, called straight from the toggle) — iOS drops audio
  // started later from an effect because the user-activation has already expired.
  const soundMounted = useRef(false);
  const toggleSound = (on) => {
    if (on) startAmbient(); else stopAmbient();   // synchronous, inside the gesture
    setSettings(s => ({ ...s, soundOn: on }));
    showToast(on ? 'ambient drone on 🔊' : 'ambient off');
  };
  // Secondary: reflect a persisted/loaded soundOn and clean up on unmount. Does NOT
  // toast (that's the toggle's job) and won't fight the gesture-started context.
  useEffect(() => {
    if (settings.soundOn && soundMounted.current) startAmbient();
    soundMounted.current = true;
    return () => stopAmbient();
  }, [settings.soundOn]);

  // Weather mood: when enabled, get location + current conditions -> a tint. Refreshes every
  // 15 min so it tracks the real sky (e.g. a passing afternoon storm) instead of getting stuck.
  // Only requests geolocation here (on toggle-on), never on load.
  useEffect(() => {
    if (!settings.weatherMood) { setWeatherTint(null); return undefined; }
    let active = true;
    const load = (announce) => fetchWeatherTint().then(t => {
      if (!active) return;
      if (t) { setWeatherTint(t); if (announce) showToast(`weather mood: ${t.label}`); }
      else if (announce) { setWeatherTint(null); showToast("couldn't read your local weather — allow location access, then toggle again.", 'error'); }
    }).catch(() => {});
    showToast('reading your local weather…');
    load(true);
    const timer = setInterval(() => load(false), 15 * 60 * 1000);
    return () => { active = false; clearInterval(timer); };
  }, [settings.weatherMood]);

  // Lock body scroll when a modal overlay is open
  useEffect(() => {
    const anyModal = showEditProfile || showMood || showTonightModal || showSettings || showNotifs
      || showCompose || showStoryComposer || showSearch || showVespersArchive || showAnalytics || activeHashtag
      || showAddGrave || showAddAnniv || showNewGroup || showReflections || showDreams || showCrewBrowse
      || showNowPlaying || showBlocked || showLegal || showDeleteConfirm || showMyTickets || quoteTarget || activeStoryIndex !== null;
    document.body.style.overflow = anyModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEditProfile, showMood, showTonightModal, showSettings, showNotifs, showCompose, showStoryComposer, showSearch, showVespersArchive, showAddGrave, showAddAnniv, showNewGroup, showReflections, showDreams, showCrewBrowse, showNowPlaying, showBlocked, showLegal, showDeleteConfirm, showMyTickets, quoteTarget, activeStoryIndex]);

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
      decor: dbProfile.decor || {},
      mood: dbProfile.mood || {},
      archetype: dbProfile.archetype || null,
      city: dbProfile.city || '',
      scene: dbProfile.city || '',
      joinedScene: dbProfile.created_at,
      followers: 0, following: 0, posts: 0,
      status: null,
    });
    getProfileStats(dbProfile.id)
      .then(s => setProfile(p => (p ? { ...p, ...s } : p)))
      .catch(() => {});
  }, [dbProfile?.id]);

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
    fetchEventMap().then(m => { if (active) setEventsOnMap(m); }).catch(() => {});
    fetchEvents(meId).then(({ events, rsvp }) => {
      if (!active) return;
      setEvents(events);
      setEventRsvp(rsvp);
    }).catch(() => {});
    withRetry(() => fetchConversations()).then(c => { if (active) setConversations(c); }).catch(e => console.error('[load] conversations failed:', e));
    fetchActiveStories(meId).then(s => { if (active) setStories(s); }).catch(() => {});
    fetchListings(meId).then(l => { if (active) setListings(l); }).catch(() => {});
    fetchShops(meId).then(s => { if (active) setShops(s); }).catch(() => {});
    fetchPayoutStatus(meId).then(p => { if (active) setPayoutStatus(p); }).catch(() => {});
    listCrews().then(c => { if (active) setCrews(c); }).catch(() => {});
    fetchMyTicketEventIds().then(ids => { if (active) setMyTicketEventIds(ids); }).catch(() => {});
    withRetry(() => fetchNotifications()).then(n => { if (active) setNotifications(n); }).catch(e => console.error('[load] notifications failed:', e));
    fetchBlockedIds().then(ids => { if (active) setBlockedIds(new Set(ids)); }).catch(() => {});
    fetchCommunityMemberCounts().then(c => { if (active) setCommunityCounts(c); }).catch(() => {});
    fetchProfiles({ excludeId: meId, limit: 12 }).then(s => { if (active) setSuggestedSouls((s || []).map(p => ({ ...p, avatarUrl: p.avatar_url }))); }).catch(() => {});
    cloudSyncedRef.current = false;
    fetchProfileState().then(s => {
      if (!active) return;
      if (s.graves) setGraves(s.graves);
      if (s.trackers) setTrackers(s.trackers);
      if (s.sigils) setSigils(s.sigils);
      if (s.reflections) setReflections(s.reflections);
      if (s.dreamJournal) setDreams(s.dreamJournal);
      if (s.intention) setActiveIntention(s.intention);
      if (s.myspace) setMyspaceCfg(s.myspace);
      // Cross-device personal layer: hydrate from the cloud blob (cloud wins on login).
      const cs = s.clientSync;
      if (cs) {
        if (cs.tonightStatus !== undefined) setTonightStatus(cs.tonightStatus);
        if (cs.communityMembership !== undefined) setCommunityMembership(cs.communityMembership);
        if (cs.bookmarks !== undefined) setBookmarks(cs.bookmarks);
        if (cs.muted !== undefined) setMuted(cs.muted);
        if (cs.anniversaries !== undefined) setAnniversaries(cs.anniversaries);
        if (cs.cardHistory !== undefined) setCardHistory(cs.cardHistory);
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
        if (cs.shrine !== undefined) setShrine(cs.shrine);
        if (cs.flameLitAt !== undefined) setFlameLitAt(cs.flameLitAt);
        if (cs.ageDob !== undefined && cs.ageDob) setAgeDob(cs.ageDob);
      }
      cloudSyncedRef.current = true;
    }).catch(() => { cloudSyncedRef.current = true; });
    return () => { active = false; };
  }, [meId, dbProfile?.id]);

  // Feed: loads (and reloads on scope change) the first page, paginated by cursor.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    let active = true;
    setFeedHasMore(true);
    setFeedLoading(true);
    withRetry(() => fetchFeed(meId, { scope: feedScope })).then(rows => {
      if (!active) return;
      setPosts(rows);
      setFeedHasMore(rows.length >= 20);
      setFeedError(false);
    }).catch(e => { console.error('[load] feed failed:', e); if (active) setFeedError(true); })
      .finally(() => { if (active) setFeedLoading(false); });
    return () => { active = false; };
  }, [meId, dbProfile?.id, feedScope, feedReloadKey]);

  // Real per-scene feed: when a scene is open, fetch its own posts (not just whatever
  // happens to be in the loaded global feed). Falls back to null (→ client filter) on error.
  useEffect(() => {
    if (!community || !meId) { setCommunityPosts(null); return; }
    let active = true;
    setCommunityPosts(null);
    fetchFeed(meId, { scope: 'everyone', community, limit: 40 })
      .then(rows => { if (active) setCommunityPosts(rows); })
      // On error, resolve the null loading sentinel (which otherwise keeps CommunityDetail on
      // "gathering the scene" forever) to the client-filtered global feed — the fallback this
      // effect's own header comment promises. `posts` here is the feed captured at open time.
      .catch(e => {
        console.error('[load] scene feed failed:', e);
        if (active) setCommunityPosts(posts.filter(p => community === 'general' || (p.community || 'general') === community));
      });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community, meId]);

  const loadMoreFeed = () => {
    if (feedLoadingMore || !feedHasMore || !meId) return;
    const last = [...posts].reverse().find(p => p.createdAt);
    if (!last) return;
    setFeedLoadingMore(true);
    fetchFeed(meId, { scope: feedScope, before: { createdAt: last.createdAt, id: last.id } }).then(more => {
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
      postCandles, nowPlaying, activityLog, mutedKeywords, hiddenPosts,
      ritual, crystals, pinnedPostId, shrineTheme, divinationLog, storyHighlights, shrine, flameLitAt,
      ageDob,
    };
    const t = setTimeout(() => { saveProfileState(meId, 'clientSync', blob).catch((e) => console.error('[clientSync] cloud save failed — cross-device sync may lag:', e)); }, 800);
    return () => clearTimeout(t);
  }, [meId, tonightStatus, communityMembership, bookmarks, muted, anniversaries, cardHistory,
      postCandles, nowPlaying, activityLog, mutedKeywords, hiddenPosts,
      ritual, crystals, pinnedPostId, shrineTheme, divinationLog, storyHighlights, shrine, flameLitAt, ageDob]);

  // Latest quiet-hours setting for the realtime closure below (avoids a stale capture).
  const quietHoursRef = useRef(settings.quietHours);
  quietHoursRef.current = settings.quietHours;

  // Live notifications: a new row (follow/react/comment/dm) → refetch so the
  // bell updates in real time, with the actor's profile joined in.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    const unsub = subscribeNotifications(meId, (row) => {
      fetchNotifications().then(setNotifications).catch(() => {});
      // OS notification banner when the app is open/backgrounded (not killed) —
      // suppressed during quiet hours (the bell badge above still updates).
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden && !inQuietHours(quietHoursRef.current)) {
          const n = hydrateRealtime(row);
          new Notification('Coven', { body: `someone ${n.text}`, icon: '/pwa-192.png', tag: row.id });
        }
      } catch { /* noop */ }
    });
    return unsub;
  }, [meId, dbProfile?.id]);

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
          // Always keep FAILED messages (their "tap to retry" must survive a refetch even if an
          // earlier delivered message had the same text). Keep PENDING ones unless a delivered copy
          // with the same body already arrived (dedupe the in-flight optimistic echo).
          const keep = (prev[openId] || []).filter(m =>
            m.failed || (m.pending && !msgs.some(s => s.from === 'me' && s.body === m.body)));
          return { ...prev, [openId]: [...msgs, ...keep] };
        })).catch(() => {});
        dmMarkRead(openId, meId).catch(() => {});
      }
    });
    return unsub;
  }, [meId, dbProfile?.id]);

  // Live reaction chips: on any reaction change, refetch the open thread (cheap; DM threads
  // are small). RLS only delivers reactions in conversations the user belongs to.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    const unsub = subscribeDMReactions(() => {
      const openId = activeConversationRef.current;
      if (!openId) return;
      fetchDMMessages(openId, meId).then(msgs => setMessages(prev => {
        const keep = (prev[openId] || []).filter(m =>
          (m.pending || m.failed) && !msgs.some(s => s.from === 'me' && s.body === m.body));
        return { ...prev, [openId]: [...msgs, ...keep] };
      })).catch(() => {});
    });
    return unsub;
  }, [meId, dbProfile?.id]);

  // Returning from Stripe (ticket checkout / Connect onboarding) — webhooks are async, and on a
  // COLD load meId is null on first paint. So parse the URL params ONCE on mount (the params get
  // cleared here), stash the payment-return intent, and run the meId-gated refreshes in the effect
  // below once auth has rehydrated — otherwise a cold return from Stripe silently skips the refresh.
  const [pendingTicketRefresh, setPendingTicketRefresh] = useState(false);
  const [pendingConnectRefresh, setPendingConnectRefresh] = useState(false);
  const [pendingBoostRefresh, setPendingBoostRefresh] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('ticket');
    const connect = params.get('connect');
    // Deep links: a shared link can open specific content on load.
    const u = params.get('u');
    const ev = params.get('event');
    const od = params.get('oddity');
    const po = params.get('post');
    const boost = params.get('boost');
    const haunt = params.get('haunt'); // a cursed link: ?haunt=paralysis|egodeath plays the reveal
    if (!t && !connect && !u && !ev && !od && !po && !boost && !haunt) return;
    history.replaceState(null, '', window.location.pathname);
    if (u) setActiveUserHandle(u.toLowerCase().replace(/[^a-z0-9_.]/g, ''));
    if (ev) { setActiveEvent(ev); setTab('events'); }
    if (od) { setActiveOddity(od); setTab('oddities'); }
    if (po) setActivePostComments(po);
    if (t === 'success') { setTicketSuccess(true); setPendingTicketRefresh(true); }
    if (connect === 'done') setPendingConnectRefresh(true);
    if (boost === 'success') { setTab('oddities'); setPendingBoostRefresh(true); }
    if (haunt === 'paralysis' || haunt === 'egodeath') setTimeout(() => setRevealTarget(haunt), 700);
  }, []);

  // Run the meId-gated post-payment refreshes once auth is ready (covers the cold-load case
  // where meId was still null when we returned from Stripe). Each fires once, then clears.
  useEffect(() => {
    if (!meId) return;
    if (pendingTicketRefresh) {
      setPendingTicketRefresh(false);
      setTimeout(() => {
        fetchEvents(meId).then(({ events, rsvp }) => { setEvents(events); setEventRsvp(rsvp); }).catch(() => {});
      }, 2500);
    }
    if (pendingConnectRefresh) {
      setPendingConnectRefresh(false);
      // Pull status straight from Stripe for an instant update; retry a couple times in case the
      // account is still settling, falling back to the DB read.
      const refresh = (n) => refreshPayoutStatus().then(p => {
        setPayoutStatus(p);
        if (!p.enabled && n > 0) setTimeout(() => refresh(n - 1), 2500);
      }).catch((e) => {
        console.error('[payouts] live refresh failed, falling back to DB read:', e);
        fetchPayoutStatus(meId).then(setPayoutStatus).catch(() => {});
      });
      refresh(3);
    }
    if (pendingBoostRefresh) {
      setPendingBoostRefresh(false);
      showToast('★ your store is boosted — pinned to the top.');
      // Give the webhook a moment to set boosted_until, then pull the pinned ordering.
      setTimeout(() => { fetchShops(meId).then(setShops).catch(() => {}); }, 2500);
    }
  }, [meId, pendingTicketRefresh, pendingConnectRefresh, pendingBoostRefresh]);

  const setupPayouts = () => {
    if (!meId || payoutBusy) return;
    setPayoutBusy(true);
    showToast('opening secure payout setup…');
    // On success the page redirects to Stripe (no need to clear busy); only
    // clear + surface on failure so the button doesn't feel dead on a slow tap.
    startPayoutSetup().catch(e => {
      console.error('[payouts] setup failed:', e);
      setPayoutBusy(false);
      showToast(`payout setup unavailable — ${e.message}`, 'error');
    });
  };

  // ---- in-app toast + push device state ----
  const showToast = (text, kind = 'info') => setToast({ key: `${kind}-${performance.now()}`, text, kind });

  const refreshPushState = () => { pushStatus().then(setPushState).catch(() => {}); };
  // One effect: refresh on login and whenever Settings opens (opening Settings right after login
  // used to fire two overlapping reads).
  useEffect(() => { if (meId) refreshPushState(); }, [meId, showSettings]);

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
  // Ghost mode keeps you off the map entirely (status stays local/profile-only).
  // Await the write before refetching so a clear can't race the refetch and
  // re-surface a pin that's mid-delete.
  const saveTonightStatus = async (status) => {
    setTonightStatus(status);
    // Sharing is independent of writing a status — you can just go live on the map.
    const sharing = !!(status && status.share && !settings.ghostMode);
    const hasPresence = !!(status && (status.text || status.share) && !settings.ghostMode);
    try {
      if (!hasPresence) {
        await clearTonightPin();
      } else {
        // A shared-location-only user still gets a pin (default text) so they appear on the map.
        await setTonightPin({ text: status.text || '· out tonight ·', neighborhood: status.neighborhood, expiresAt: status.expiresAt });
      }
    } catch { /* ignore network errors */ }
    // Real GPS proximity (opt-in): store precise coords (owner-locked) or clear them.
    // Read the location and write it in SEPARATE try/catches so a failed DB write reports the
    // real reason instead of blaming the GPS (which is what hid the original DM/RLS bug class).
    if (sharing) {
      let coords;
      try {
        coords = await getPosition();
      } catch {
        clearTonightGeo().catch(() => {});
        setNearby([]);
        showToast("couldn't read your location — sharing off.", 'error');
        coords = null;
      }
      if (coords) {
        markGeoGranted(); // survives iOS PWA permission amnesia — silent refreshes keep working
        try {
          await setTonightGeo({ lat: coords.latitude, lng: coords.longitude, fuzzM: status.fuzzM });
          fetchNearby(coords.latitude, coords.longitude).then(list => { if (list) setNearby(list); }).catch(() => {});
        } catch (err) {
          clearTonightGeo().catch(() => {}); // never leave stale coords broadcasting
          setNearby([]);
          showToast(`couldn't share your location — ${err?.message || 'try again'}`, 'error');
        }
      }
    } else {
      // Turning sharing off — a failed clear leaves coords broadcasting, so surface it.
      clearTonightGeo().catch(() => showToast("couldn't stop sharing your location — check your connection.", 'error'));
      setNearby([]);
    }
    fetchTonightPins().then(setTonightPins).catch(() => {});
  };

  // Going ghost must immediately pull any existing pin AND precise coords from the shared map.
  // Surface a failure — otherwise you'd believe you went invisible while your pin/coords stay live.
  useEffect(() => {
    if (!settings.ghostMode) return;
    Promise.all([clearTonightPin(), clearTonightGeo()])
      .then(() => fetchTonightPins().then(setTonightPins).catch(() => {}))
      .catch(() => showToast("couldn't fully hide you from the map — check your connection, then toggle ghost mode again.", 'error'));
    setNearby([]);
  }, [settings.ghostMode]);

  // Refresh privacy-fuzzed proximity while the map is open — but ONLY if location was already
  // granted, so opening the map never re-prompts. First-timers grant once via the explicit
  // "share location" button; after that this silent read just works. You can always SEE the
  // living map regardless; sharing only decides whether you appear ON it.
  // IMPORTANT: a failed refresh (flaky GPS indoors, transient RPC error, iOS PWA permission
  // amnesia) keeps the LAST-KNOWN pins instead of wiping the map — the old wipe-on-failure
  // was why "locations don't stick around". Refresh repeats every 60s while the tab is open.
  useEffect(() => {
    if (tab !== 'map' || !meId || settings.ghostMode) return undefined;
    let active = true;
    const refresh = () => {
      getPositionIfGranted()
        .then((coords) => (coords ? fetchNearby(coords.latitude, coords.longitude) : null))
        .then(list => { if (active && list) setNearby(list); })
        .catch(() => { /* keep last-known pins */ });
    };
    refresh();
    const t = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(t); };
  }, [tab, meId, settings.ghostMode]);

  // Load an event's attendees + waitlist + recap posts when its detail opens.
  useEffect(() => {
    if (!activeEvent) { setActiveEventAttendees([]); setEventWaitlist({ count: 0, mine: false }); setEventRecaps([]); return; }
    let active = true;
    fetchEventAttendees(activeEvent)
      .then(a => { if (active) setActiveEventAttendees(a.map(x => ({ userId: x.user_id, handle: x.handle, avatar: x.avatar, isMutual: !!x.is_mutual }))); })
      .catch(() => {});
    fetchWaitlist(activeEvent, meId)
      .then(w => { if (active) setEventWaitlist(w); })
      .catch(() => { if (active) setEventWaitlist({ count: 0, mine: false }); });
    fetchEventRecaps(activeEvent, meId)
      .then(r => { if (active) setEventRecaps(r); })
      .catch(() => { if (active) setEventRecaps([]); });
    return () => { active = false; };
  }, [activeEvent, meId]);

  // Start a recap → open the composer pre-linked to the event.
  const startEventRecap = (eventId) => { setComposeEventId(eventId); setShowCompose(true); };
  // Open a recap post's comments (inject it into the feed cache so CommentsOverlay resolves it).
  const openRecapPost = (post) => {
    setPosts(prev => prev.some(p => p.id === post.id) ? prev : [...prev, post]);
    setActiveEvent(null);
    setActivePostComments(post.id);
  };

  // Join / leave a sold-out rite's waitlist (optimistic + revert on failure).
  const joinEventWaitlist = (eventId) => {
    if (!meId) return;
    setEventWaitlist(w => ({ count: w.count + 1, mine: true }));
    joinWaitlist(eventId, meId).then(() => showToast('you’re on the waitlist.')).catch(() => {
      setEventWaitlist(w => ({ count: Math.max(0, w.count - 1), mine: false }));
      showToast("couldn't join the waitlist — try again.", 'error');
    });
  };
  const leaveEventWaitlist = (eventId) => {
    if (!meId) return;
    setEventWaitlist(w => ({ count: Math.max(0, w.count - 1), mine: false }));
    leaveWaitlist(eventId, meId).catch(() => {
      setEventWaitlist(w => ({ count: w.count + 1, mine: true }));
      showToast("couldn't leave the waitlist — try again.", 'error');
    });
  };

  // Lazy-load a thread's comments when it opens (base count -> 0 to avoid double-count).
  // If comments were opened for a post that isn't in the loaded feed page (a notification tap,
  // a hashtag/search result, another user's profile grid, or a ?post= deep link), fetch the
  // post itself first and inject it — otherwise CommentsOverlay gets post=undefined and renders
  // blank (mirrors openRecapPost's inject-then-open). `posts` is intentionally not a dep: the
  // membership check reads the current feed at open time; adding it would refetch on every change.
  useEffect(() => {
    if (!activePostComments || String(activePostComments).startsWith('temp-')) return;
    const pid = activePostComments;
    let active = true;
    const ensurePost = posts.some(p => p.id === pid)
      ? Promise.resolve()
      : fetchPostById(pid, meId).then(p => { if (p && active) setPosts(prev => prev.some(x => x.id === pid) ? prev : [p, ...prev]); }).catch(() => {});
    ensurePost.then(() => fetchComments(pid, meId)).then(list => {
      if (active && list) setPosts(prev => prev.map(p => (p.id === pid ? { ...p, comments: list, baseCommentCount: 0 } : p)));
    }).catch(() => {});
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePostComments, meId]);

  // Keep the pinned post resolvable on the shrine even after the feed paginates past it (or on a
  // fresh load): if it isn't in the loaded feed, fetch + inject it so ProfileScreen's
  // `posts.find(id && mine)` lookup doesn't come up empty and silently drop the pin.
  useEffect(() => {
    if (!pinnedPostId || !meId || posts.some(p => p.id === pinnedPostId)) return;
    let active = true;
    fetchPostById(pinnedPostId, meId).then(p => {
      if (p && p.mine && active) setPosts(prev => prev.some(x => x.id === pinnedPostId) ? prev : [...prev, p]);
    }).catch(() => {});
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedPostId, meId]);

  // === HANDLERS ===
  // Persist a profile-depth blob (graves/trackers/sigils/reflections) for the logged-in user.
  const persistState = (key, value) => { if (meId) saveProfileState(meId, key, value).catch((e) => console.error('[persistState] cloud save failed for', key, '— may not sync across devices:', e)); };

  // Spell / intention timer — one active "working" at a time, persisted in profile_state.
  const startIntention = (obj) => { setActiveIntention(obj); persistState('intention', obj); };
  const clearIntention = () => { setActiveIntention(null); persistState('intention', null); };
  // Completion watcher (above the render gate): when the candle is spent, toast + clear.
  useEffect(() => {
    if (!activeIntention) return;
    const check = () => {
      if (Date.now() >= activeIntention.endsAt) {
        showToast('the working is complete · ' + activeIntention.name, 'success');
        clearIntention();
      }
    };
    check(); // catch a working that finished while the app was closed
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, [activeIntention]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateTracker = (catId, action, payload) => {
    const next = { ...trackers };
    // Add a custom tracker the presets don't cover (stored inline w/ its own def).
    if (action === 'addCustom') {
      const label = (payload?.label || '').trim().slice(0, 24);
      if (!label) return;
      const id = `custom-${Date.now()}`;
      next[id] = { custom: true, label, glyph: payload?.glyph || '✦', mode: 'last', public: false, lastAt: Date.now() };
      setTrackers(next); persistState('trackers', next);
      return;
    }
    // Preset categories come from the static list; custom ones carry their def in state.
    const cat = TRACKER_CATEGORIES.find(c => c.id === catId) || (next[catId]?.custom ? next[catId] : null);
    if (!cat) return;
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

  // Celebrate a newly-earned achievement with a toast. Seeded from localStorage + armed
  // only AFTER the cold load settles, so data streaming in on login isn't mistaken for
  // fresh earns (no retroactive spam). All deps are declared above; gate is far below.
  const seenAchRef = useRef(null);
  const achArmedRef = useRef(false);
  useEffect(() => {
    if (!meId) return;
    const lsKey = 'coven:v1:seenAchievements:' + meId;
    const earned = earnedAchievements({ posts, me: meHandle, sigils, crystals, ritual, communityMembership, reflections, graves, bookmarks, divinationLog, following });
    const timeouts = [];
    if (seenAchRef.current === null) {
      let seen = [];
      try { const raw = localStorage.getItem(lsKey); if (raw) seen = JSON.parse(raw); } catch { /* noop */ }
      seenAchRef.current = new Set(seen);
      timeouts.push(setTimeout(() => { achArmedRef.current = true; }, 5000));
    }
    if (!achArmedRef.current) {
      earned.forEach(a => seenAchRef.current.add(a.id)); // absorb during cold load
    } else {
      const fresh = earned.filter(a => !seenAchRef.current.has(a.id));
      fresh.forEach((a, i) => timeouts.push(setTimeout(() => showToast('a mark earned ✦ — ' + a.name), i * 1400)));
      fresh.forEach(a => seenAchRef.current.add(a.id));
    }
    try { localStorage.setItem(lsKey, JSON.stringify([...seenAchRef.current])); } catch { /* noop */ }
    return () => timeouts.forEach(clearTimeout);
  }, [meId, posts, meHandle, sigils, crystals, ritual, communityMembership, reflections, graves, bookmarks, divinationLog, following]);

  const addPost = async ({ body, community, anonymous, poll, img, kind, eventId, coauthorId, coauthorHandle, scheduled }) => {
    if (!meId) return;
    // Scheduled for later — create it hidden (no optimistic feed insert) and confirm.
    if (scheduled) {
      try {
        await createPost({ body, community, anonymous, poll, img, kind, eventId, coauthorId, coauthorHandle, scheduled }, { id: meId, handle: meHandle, avatar: meAvatar, avatarUrl: meAvatarUrl });
        const w = new Date(scheduled);
        showToast(`scheduled for ${w.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.`);
      } catch {
        showToast("couldn't schedule that — try again.", 'error');
      }
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId, kind: kind || (poll ? 'poll' : 'text'),
      user: anonymous ? 'anonymous' : meHandle,
      avatar: anonymous ? '✟' : meAvatar,
      time: 'just now',
      community: community || 'general', body, img,
      avatarUrl: anonymous ? undefined : meAvatarUrl,
      coauthorHandle: anonymous ? null : (coauthorHandle || null),
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
      const saved = await createPost({ body, community, anonymous, poll, img, kind, eventId, coauthorId, coauthorHandle }, { id: meId, handle: meHandle, avatar: meAvatar, avatarUrl: meAvatarUrl });
      setPosts(prev => prev.map(p => (p.id === tempId ? saved : p)));
      if (eventId) fetchEventRecaps(eventId, meId).then(setEventRecaps).catch(() => {}); // refresh the event's recaps
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
  const reactToPost = (postId, kind, wasMineOverride) => {
    // wasMineOverride lets callers that hold their own copy of the post (e.g. HashtagFeed,
    // whose post may not be in the home feed) pass the correct pre-toggle state.
    const current = posts.find(p => p.id === postId);
    const wasMine = wasMineOverride !== undefined
      ? wasMineOverride
      : !!(current?.myReactions && current.myReactions[kind]);
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
    // Read the prior state up front so persistence sees the correct wasMine, then optimistic-update.
    const comment = posts.find(p => p.id === postId)?.comments?.find(c => c.id === commentId);
    const wasMine = !!comment?.myReactions?.[kind];
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: (p.comments || []).map(c => {
          if (c.id !== commentId) return c;
          const myReactions = c.myReactions || {};
          const reactions = c.reactions || { heart: 0, skull: 0 };
          return {
            ...c,
            myReactions: { ...myReactions, [kind]: !wasMine },
            reactions: { ...reactions, [kind]: Math.max(0, (reactions[kind] || 0) + (wasMine ? -1 : 1)) },
          };
        }),
      };
    }));
    if (meId) toggleCommentReaction(commentId, kind, meId, wasMine).catch(() => {
      // Roll the optimistic toggle back (mirror reactToPost) so the chip matches the server.
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: (p.comments || []).map(c => {
            if (c.id !== commentId) return c;
            const myReactions = c.myReactions || {};
            const reactions = c.reactions || { heart: 0, skull: 0 };
            return {
              ...c,
              myReactions: { ...myReactions, [kind]: wasMine },
              reactions: { ...reactions, [kind]: Math.max(0, (reactions[kind] || 0) + (wasMine ? 1 : -1)) },
            };
          }),
        };
      }));
      showToast("couldn't react — try again.", 'error');
    });
  };

  const sendMessage = (conversationId, body, audioUrl = null) => {
    if (!meId || !conversationId || String(conversationId).startsWith('temp-')) return;
    const tempId = `tempm-${Date.now()}`;
    const preview = audioUrl ? '🎙️ voice note' : (body.length > 60 ? body.slice(0, 60) + '…' : body);
    const optimistic = { id: tempId, from: 'me', body, audioUrl, time: 'just now', pending: true };
    setMessages(prev => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), optimistic] }));
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, last: preview, time: 'just now' } : c
    ));
    sendDM(conversationId, meId, body, audioUrl)
      .then(saved => setMessages(prev => ({ ...prev, [conversationId]: (prev[conversationId] || []).map(m => m.id === tempId ? saved : m) })))
      // Keep the message (marked failed) so it isn't silently lost, and tell the user.
      .catch(() => {
        setMessages(prev => ({ ...prev, [conversationId]: (prev[conversationId] || []).map(m => m.id === tempId ? { ...m, pending: false, failed: true } : m) }));
        showToast("whisper didn't send — tap it to retry.", 'error');
      });
  };

  // Toggle a reaction (bat/fire/skull/smoke) on a single whisper.
  const reactToMessage = (conversationId, messageId, kind) => {
    if (!meId || !conversationId) return;
    const msg = (messages[conversationId] || []).find(m => m.id === messageId);
    if (!msg || String(messageId).startsWith('tempm-')) return; // can't react to an unsent message
    const wasMine = !!msg.myReactions?.[kind];
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(m => {
        if (m.id !== messageId) return m;
        const reactions = { ...(m.reactions || { bat: 0, fire: 0, skull: 0, smoke: 0 }) };
        const myReactions = { ...(m.myReactions || {}) };
        reactions[kind] = Math.max(0, (reactions[kind] || 0) + (wasMine ? -1 : 1));
        if (wasMine) delete myReactions[kind]; else myReactions[kind] = true;
        return { ...m, reactions, myReactions };
      }),
    }));
    toggleDMReaction(messageId, kind, meId, wasMine).catch(() => {
      fetchDMMessages(conversationId, meId).then(msgs => setMessages(prev => ({ ...prev, [conversationId]: msgs }))).catch(() => {});
      showToast("couldn't react — try again.", 'error');
    });
  };

  // Retry a failed message: drop the failed copy and resend.
  const retryMessage = (conversationId, messageId) => {
    let body = null, audioUrl = null;
    setMessages(prev => {
      const list = prev[conversationId] || [];
      const failed = list.find(m => m.id === messageId);
      if (failed) { body = failed.body; audioUrl = failed.audioUrl || null; }
      return { ...prev, [conversationId]: list.filter(m => m.id !== messageId) };
    });
    if (body || audioUrl) sendMessage(conversationId, body, audioUrl);
  };

  const openConversation = (id, meta) => {
    if (!id) return;
    setDmPrefill(meta?.prefill || ''); // seed (or clear) the draft for this open
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
    activeConversationRef.current = id; // update synchronously so the guard below is reliable
    setShowDMs(false);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    if (meId) {
      // Guard against a stale fetch (from a thread you switched away from) clobbering the open one.
      fetchDMMessages(id, meId).then(msgs => {
        if (activeConversationRef.current !== id) return;
        setMessages(prev => ({ ...prev, [id]: msgs }));
      }).catch(() => {});
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
    // Optimistic count bump + server-backed membership row (migration 0031).
    setCommunityCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + (wasMember ? -1 : 1)) }));
    (wasMember ? leaveCommunity(id) : joinCommunity(id))
      .then(() => {
        // Only announce the join AFTER the server confirms it (don't log a join that didn't persist).
        if (!wasMember) {
          const c = COMMUNITIES.find(x => x.id === id);
          addNotification({ kind: 'crew', avatar: c?.glyph || '✦', text: `you joined ${c?.name || id}` });
          logActivity({ kind: 'join', glyph: c?.glyph || '✦', label: `joined the ${c?.name || 'a'} scene` });
        }
      })
      .catch(() => {
        // Roll back the optimistic membership flag + count so the UI matches the server.
        setCommunityMembership(prev => ({ ...prev, [id]: wasMember }));
        setCommunityCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + (wasMember ? 1 : -1)) }));
        showToast(wasMember ? "couldn't leave the scene — try again." : "couldn't join the scene — try again.", 'error');
      });
  };

  const toggleEventRsvp = (id) => {
    const wasGoing = !!eventRsvp[id];
    setEventRsvp(prev => {
      const next = { ...prev };
      if (wasGoing) delete next[id]; else next[id] = true;
      return next;
    });
    // Announce the RSVP only once it's real — otherwise a failed write left a "you're going"
    // notification + activity entry contradicting the reverted button.
    const announce = () => {
      if (!wasGoing) {
        addNotification({ kind: 'event', avatar: '◈', text: `you said you're going` });
        logActivity({ kind: 'rsvp', glyph: '◈', label: 'pledged to a rite', detail: events.find(e => e.id === id)?.name || null });
      }
    };
    if (meId && !String(id).startsWith('temp-')) {
      dbToggleRsvp(id, meId, wasGoing).then(announce).catch(() => {
        setEventRsvp(prev => {
          const next = { ...prev };
          if (wasGoing) next[id] = true; else delete next[id];
          return next;
        });
        showToast("couldn't update your RSVP — try again.", 'error');
      });
    } else {
      announce();
    }
  };

  const addEvent = async (data) => {
    if (!meId) return;
    try {
      const saved = await createEvent(data, { id: meId, handle: meHandle, avatar: meAvatar });
      setEvents(prev => [saved, ...prev]);
      logActivity({ kind: 'event', glyph: '◈', label: 'summoned a rite', detail: data.name });
      // Refresh the map pins so a just-created event with a location appears immediately.
      if (data.lat != null && data.lng != null) fetchEventMap().then(setEventsOnMap).catch(() => {});
    } catch (e) {
      showToast("couldn't create the rite — try again.", 'error');
      throw e; // let the modal keep itself open so the user doesn't lose their input
    }
  };

  const buyTicket = (eventId) => {
    if (!meId) return;
    startCheckout(eventId).catch(e => {
      console.error('[checkout] failed:', e);
      addNotification({ kind: 'event', avatar: '✖', text: `checkout unavailable — ${e.message}` });
    });
  };

  const removeEvent = (eventId) => {
    const snapshot = events;
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setActiveEvent(null);
    dbDeleteEvent(eventId).then(() => showToast('the rite is undone.'))
      .catch(() => { setEvents(snapshot); showToast("couldn't delete that rite — try again.", 'error'); });
  };

  const deletePost = (postId) => {
    const snapshot = posts;
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (meId && !String(postId).startsWith('temp-')) {
      dbDeletePost(postId).catch(() => {
        setPosts(snapshot);
        showToast("couldn't remove that — try again.", 'error');
      });
    }
  };

  const editPost = (postId, body) => {
    const clean = (body || '').trim();
    if (!clean) return;
    // Guard the fresh-post race: a post created moments ago still has an optimistic temp id
    // (no server row to PATCH). Surface it instead of silently dropping the edit.
    if (String(postId).startsWith('temp-')) { showToast('still posting — give it a moment, then edit.', 'error'); return; }
    const snapshot = posts;
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, body: clean, edited: true } : p)));
    dbUpdatePost(postId, clean).catch(() => { setPosts(snapshot); showToast("couldn't save your edit — try again.", 'error'); });
  };

  // Comments live inside posts[].comments — edit/delete update that nested array optimistically.
  const editComment = (postId, commentId, body) => {
    const clean = (body || '').trim();
    if (!clean) return;
    if (String(commentId).startsWith('tempc-')) { showToast('still sending — give it a moment.', 'error'); return; }
    const snapshot = posts;
    setPosts(prev => prev.map(p => (p.id === postId
      ? { ...p, comments: (p.comments || []).map(c => (c.id === commentId ? { ...c, body: clean, edited: true } : c)) }
      : p)));
    dbUpdateComment(commentId, clean).catch(() => { setPosts(snapshot); showToast("couldn't save your edit — try again.", 'error'); });
  };

  const deleteComment = (postId, commentId) => {
    if (String(commentId).startsWith('tempc-')) { showToast('still sending — give it a moment.', 'error'); return; }
    const snapshot = posts;
    setPosts(prev => prev.map(p => (p.id === postId
      ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId), baseCommentCount: Math.max(0, (p.baseCommentCount || 1) - 1) }
      : p)));
    dbDeleteComment(commentId).catch(() => { setPosts(snapshot); showToast("couldn't delete that — try again.", 'error'); });
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

  const openDMWithUser = async (handle, prefill = '') => {
    if (!meId || !handle || handle === meHandle) return;
    const otherId = await resolveUserId(handle);
    if (!otherId) return;
    const convId = await getOrCreateDM(otherId).catch(() => null);
    if (!convId) return;
    await fetchConversations().then(setConversations).catch(() => {});
    setShowDMs(false);
    openConversation(convId, { user: handle, prefill });
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
        showToast(wasFollowing ? "couldn't unfollow — try again." : "couldn't follow — try again.", 'error');
      }
    })();
  };

  const postStory = async (story, attached = null) => {
    if (!meId) return;
    try {
      const saved = await dbPostStory(story, { id: meId, handle: meHandle, avatar: meAvatar, avatarUrl: meAvatarUrl });
      // The rail doesn't refetch, so attach the shared-post preview now or it won't show until reload.
      const ap = (attached && attached.id === story.post_id)
        ? { id: attached.id, user: attached.anonymous ? 'anonymous' : attached.user, avatar: attached.avatar, avatarUrl: attached.avatarUrl || null, body: attached.body || '', img: attached.img || null }
        : null;
      setStories(prev => [...prev, ap ? { ...saved, attachedPost: ap } : saved]);
    } catch {
      showToast("couldn't post your story — try again.", 'error');
    }
  };

  const removeStory = (id) => {
    let removed = null;
    setStories(prev => { removed = prev.find(s => s.id === id) || null; return prev.filter(s => s.id !== id); });
    deleteStory(id).catch(() => {
      // re-add on failure so it doesn't silently reappear on the next refresh
      if (removed) setStories(prev => prev.some(s => s.id === id) ? prev : [...prev, removed]);
      showToast("couldn't remove that story — try again.", 'error');
    });
  };

  const addOddity = async (data) => {
    if (!meId) return;
    try {
      const saved = await createListing(data, { id: meId, handle: meHandle, avatar: meAvatar });
      setListings(prev => [saved, ...prev]);
    } catch { showToast("couldn't post that — try again.", 'error'); }
  };

  const addShop = async (data) => {
    if (!meId) return;
    try {
      const saved = await createShop(data, { id: meId, handle: meHandle, avatar: meAvatar });
      setShops(prev => [saved, ...prev]);
    } catch { showToast("couldn't add your shop — try again.", 'error'); }
  };
  const removeShop = (id) => {
    setShops(prev => prev.filter(s => s.id !== id));
    dbDeleteShop(id).catch(() => { showToast("couldn't remove that shop.", 'error'); fetchShops(meId).then(setShops).catch(() => {}); });
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
    const next = [{ id: `g${Date.now()}`, flowers: 0, addedFlowers: [], ...grave, visibility: grave.private ? 'private' : 'friends' }, ...graves];
    setGraves(next);
    persistState('graves', next);
  };

  const addAnniversary = (anniv) => {
    setAnniversaries(prev => [...prev, { id: `a${Date.now()}`, visible: false, ...anniv }]);
  };

  const recordCardDraw = (dateKey, card) => {
    setCardHistory(prev => prev[dateKey] ? prev : { ...prev, [dateKey]: card });
  };

  // Shared mute test (muted handle OR muted keyword in the body). Used by the home
  // feed AND scene/profile lists so muting actually applies everywhere posts show.
  const isMutedPost = (p) => {
    if (!p) return false;
    if (p.user && muted[p.user]) return true;
    if (mutedKeywords.length > 0 && p.body) {
      const body = p.body.toLowerCase();
      if (mutedKeywords.some(k => k && body.includes(k.toLowerCase()))) return true;
    }
    return false;
  };

  const visiblePosts = posts.filter(p => {
    if (hiddenPosts[p.id]) return false;
    if (isMutedPost(p)) return false;
    if (p.authorId && blockedIds.has(p.authorId)) return false; // blocked both-ways
    return true;
  });

  const hidePost = (postId) => setHiddenPosts(prev => ({ ...prev, [postId]: Date.now() }));

  const blockUserById = async (profileId, handle) => {
    if (!profileId || !meId) return;
    setBlockedIds(prev => new Set(prev).add(profileId));
    setActiveUserHandle(null);
    addNotification({ kind: 'follow', avatar: '⛒', text: `you blocked ${handle || 'someone'}` });
    try {
      await dbBlockUser(profileId);
    } catch {
      setBlockedIds(prev => { const n = new Set(prev); n.delete(profileId); return n; });
      showToast("couldn't block — try again.", 'error');
      return;
    }
    fetchFeed(meId, { scope: feedScope }).then(setPosts).catch(() => {});
  };
  const unblockUserById = async (profileId) => {
    if (!profileId || !meId) return;
    // Optimistic unblock with rollback (mirror blockUserById) — a bare `await` here would throw an
    // unhandled rejection on failure and silently never update the UI.
    setBlockedIds(prev => { const n = new Set(prev); n.delete(profileId); return n; });
    try {
      await dbUnblockUser(profileId);
      fetchFeed(meId, { scope: feedScope }).then(setPosts).catch(() => {});
    } catch {
      setBlockedIds(prev => new Set(prev).add(profileId)); // revert
      showToast("couldn't unblock — try again.", 'error');
    }
  };
  const reportTarget = async (kind, targetId, reason = '') => {
    if (!meId || !targetId) return;
    try { await reportContent(kind, targetId, reason); addNotification({ kind: 'follow', avatar: '⚑', text: 'reported — thank you' }); }
    catch { showToast("couldn't submit the report — try again.", 'error'); }
  };

  // Your own follower / following lists (RLS allows reading your own edges only).
  const openFollowing = () => setFollowList({ tab: 'following' });
  const openFollowers = () => { if (meId) setFollowList({ tab: 'followers' }); };

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

  const addDream = (title, body) => {
    const next = [{ id: `dr${Date.now()}`, title: title || '', body, at: Date.now() }, ...dreams];
    setDreams(next);
    persistState('dreamJournal', next);
  };
  const removeDream = (id) => {
    const next = dreams.filter(d => d.id !== id);
    setDreams(next);
    persistState('dreamJournal', next);
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
    if ((n.kind === 'dm' || n.kind === 'crew_join') && n.conversationId) {
      openConversation(n.conversationId, { user: n.user, avatar: n.avatar });
    } else if (n.kind === 'follow' && n.user && n.user !== 'someone') {
      setActiveUserHandle(n.user);
    } else if ((n.kind === 'react' || n.kind === 'comment' || n.kind === 'mention' || n.kind === 'coauthor') && n.postId) {
      setActivePostComments(n.postId);
    } else if (n.kind === 'event' || n.kind === 'rsvp' || n.kind === 'ticket_sale' || n.kind === 'event_change' || n.kind === 'event_cancelled') {
      setTab('events');
    } else if (n.kind === 'report' && isAdmin) {
      setShowAdminPanel(true); // admins jump straight to the queue
    } else if (n.kind === 'story_react' && n.user && n.user !== 'someone') {
      setActiveUserHandle(n.user); // the story may have expired — go to the reactor
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
        // Onboarding completion is the acceptance event for the clickwrap shown at
        // sign-up — record which terms version was agreed to and when.
        tos_version: TERMS_VERSION,
        tos_accepted_at: new Date().toISOString(),
      });
    } catch (e) {
      if (e?.code === '23505') throw new Error('handle taken');
      throw e;
    }
    await refreshProfile();
    // First-follows from onboarding — run AFTER the profile exists so follower_id=auth.uid()
    // passes the follows RLS insert policy. allSettled so one failure can't block entry.
    if (Array.isArray(data.follows) && data.follows.length) {
      await Promise.allSettled(data.follows.map(id => followUser(userId, id)));
    }
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
        decor: next.decor || {},
        archetype: next.archetype || null,
      });
      await refreshProfile();
    } catch {
      await refreshProfile(); // revert to server truth on failure (e.g. handle taken)
      showToast("couldn't save your profile — that handle may be taken.", 'error');
    }
  };

  // Forward the currently-shared post into a whisper (existing thread or a new one).
  const whisperPost = async ({ convId, userId, handle, avatar }) => {
    const postId = sharePostTarget;
    setSharePostTarget(null);
    if (!postId || !meId) return;
    try {
      let cid = convId;
      if (!cid && userId) cid = await getOrCreateDM(userId);
      if (!cid) return;
      await sendPostToDM(cid, meId, postId);
      fetchConversations().then(setConversations).catch(() => {});
      openConversation(cid, { user: handle, avatar });
      showToast('whispered.');
    } catch {
      showToast("couldn't whisper that — try again.", 'error');
    }
  };

  // Set/clear the self-set profile mood (public, expiring aura). Pass {} to clear.
  const saveMood = async (mood) => {
    setProfile(p => (p ? { ...p, mood: mood || {} } : p)); // optimistic
    if (!meId) return;
    try {
      await updateProfile(meId, { mood: mood || {} });
    } catch {
      await refreshProfile();
      showToast("couldn't set your mood — try again.", 'error');
    }
  };

  // ---- Overlay back-button + Escape handling ----------------------------------
  // Hooks MUST live above the early-return gate below (a render that returns early would
  // otherwise run fewer hooks → React hooks-order crash). No router → without this the
  // Android hardware back button exits the whole PWA from any overlay, and Escape does
  // nothing. We treat overlays like a history stack: each open pushes a guard entry, and
  // Back / Escape peel exactly one layer. (closePortal is defined below the gate; it's only
  // called from event handlers, after render, so referencing it here is safe.)
  const anyOverlayOpen = !!(
    showSigilDraw ||
    ticketSuccess || activeStoryIndex !== null || showStoryComposer || venueEditorEvent ||
    ticketManagerEvent || showCreateEvent || showAdminPanel || showMyspaceEditor || showEditProfile || showMood || sharePostTarget || showSettings || showBlocked || showLegal || showDeleteConfirm || reportSheet || legalEscalation ||
    showMyTickets || showReflections || showDreams || showNowPlaying || showAddGrave || showAddAnniv ||
    showVespersArchive || showNewGroup || showTonightModal || quoteTarget || showOddityCompose ||
    activeOddity || activePostComments || followList || activeConversation || activeUserHandle ||
    showSearch || showCrewBrowse || activeEvent || showCompose || showNotifs || showDMs || activePortal ||
    showShockPicker || showAnalytics || activeHashtag ||
    (!seenWelcome && meId && dbProfile && profile) // first-run welcome — so Back/Escape dismisses it, not the PWA
  );
  // Close the single top-most overlay (z-order priority). Returns true if it closed one.
  const closeTopOverlay = () => {
    if (!seenWelcome && meId && dbProfile && profile) { setSeenWelcome(true); return true; }
    if (showSigilDraw) { setShowSigilDraw(false); return true; }
    if (ticketSuccess) { setTicketSuccess(false); return true; }
    if (activeStoryIndex !== null) { setActiveStoryIndex(null); return true; }
    if (showStoryComposer) { setShowStoryComposer(false); setStoryAttachedPost(null); return true; }
    if (showAnalytics) { setShowAnalytics(false); return true; }
    if (activeHashtag) { setActiveHashtag(null); return true; }
    if (venueEditorEvent) { setVenueEditorEvent(null); return true; }
    if (ticketManagerEvent) { setTicketManagerEvent(null); return true; }
    if (showAdminPanel) { setShowAdminPanel(false); return true; }
    if (showMyspaceEditor) { setShowMyspaceEditor(false); return true; }
    if (showCreateEvent) { setShowCreateEvent(false); setEventDraftCoords(null); return true; }
    if (showEditProfile) { setShowEditProfile(false); return true; }
    if (showMood) { setShowMood(false); return true; }
    if (sharePostTarget) { setSharePostTarget(null); return true; }
    if (legalEscalation) { setLegalEscalation(null); return true; }
    if (reportSheet) { setReportSheet(null); return true; }
    if (showDeleteConfirm) { setShowDeleteConfirm(false); return true; }
    if (showLegal) { setShowLegal(false); return true; }
    if (showBlocked) { setShowBlocked(false); return true; }
    // Settings peels AFTER Blocked/Legal/Delete/Report — those open ON TOP of Settings without
    // closing it, so Back/Escape must dismiss the visible child before the Settings behind it.
    if (showSettings) { setShowSettings(false); return true; }
    if (showMyTickets) { setShowMyTickets(false); return true; }
    if (showReflections) { setShowReflections(false); return true; }
    if (showDreams) { setShowDreams(false); return true; }
    if (showShockPicker) { setShowShockPicker(false); return true; }
    if (showNowPlaying) { setShowNowPlaying(false); return true; }
    if (showAddGrave) { setShowAddGrave(false); return true; }
    if (showAddAnniv) { setShowAddAnniv(false); return true; }
    if (showVespersArchive) { setShowVespersArchive(false); return true; }
    if (showNewGroup) { setShowNewGroup(false); return true; }
    if (showTonightModal) { setShowTonightModal(false); return true; }
    if (quoteTarget) { setQuoteTarget(null); return true; }
    if (showOddityCompose) { setShowOddityCompose(false); return true; }
    if (activeOddity) { setActiveOddity(null); return true; }
    if (activePostComments) { setActivePostComments(null); return true; }
    if (followList) { setFollowList(null); return true; }
    if (activeConversation) { setActiveConversation(null); setActiveConvMeta(null); return true; }
    if (activeUserHandle) { setActiveUserHandle(null); return true; }
    if (showSearch) { setShowSearch(false); return true; }
    if (showCrewBrowse) { setShowCrewBrowse(false); return true; }
    if (activeEvent) { setActiveEvent(null); return true; }
    if (showCompose) { setShowCompose(false); return true; }
    if (showNotifs) { setShowNotifs(false); return true; }
    if (showDMs) { setShowDMs(false); return true; }
    if (activePortal) { closePortal(); return true; }
    return false;
  };
  // Keep the latest state/closure reachable from the once-attached listeners below.
  const anyOverlayOpenRef = useRef(false); anyOverlayOpenRef.current = anyOverlayOpen;
  const closeTopRef = useRef(null); closeTopRef.current = closeTopOverlay;
  const overlayGuardRef = useRef(false);

  // Push a history guard when an overlay opens; consume an orphaned guard on UI-close.
  useEffect(() => {
    if (anyOverlayOpen && !overlayGuardRef.current) {
      overlayGuardRef.current = true;
      window.history.pushState({ covenOverlay: true }, '');
    } else if (!anyOverlayOpen && overlayGuardRef.current) {
      overlayGuardRef.current = false;
      if (window.history.state?.covenOverlay) window.history.back();
    }
  }, [anyOverlayOpen]);

  // Back button → peel one layer. The browser already popped our guard; if layers remain
  // open the effect above re-pushes a fresh guard for the next Back press.
  useEffect(() => {
    const onPop = () => {
      overlayGuardRef.current = false;
      if (anyOverlayOpenRef.current) closeTopRef.current?.();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Escape behaves exactly like Back so the guard stack stays consistent.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || !anyOverlayOpenRef.current) return;
      e.preventDefault();
      if (overlayGuardRef.current) window.history.back();
      else closeTopRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Shock-mode fun pack: quick-switch handlers + shake-to-shuffle (hooks ABOVE the render gate) ──
  // Locked secret modes never appear in the cycle/shuffle until they've been discovered.
  const ACTIVE_SHOCK_IDS = SHOCK_MODES.filter((m) => m.id !== 'none' && !m.transient && (!m.secret || unlockedShock.includes(m.id))).map((m) => m.id);
  const nextShock = () => setSettings((s) => {
    const i = ACTIVE_SHOCK_IDS.indexOf(s.shockMode);
    return { ...s, shockMode: ACTIVE_SHOCK_IDS[(i + 1) % ACTIVE_SHOCK_IDS.length] };
  });
  const shuffleShock = () => setSettings((s) => {
    const pool = ACTIVE_SHOCK_IDS.filter((id) => id !== s.shockMode);
    return { ...s, shockMode: pool[Math.floor(Math.random() * pool.length)] || s.shockMode };
  });
  const shakeAt = useRef(0);
  useEffect(() => {
    if (settings.shakeShuffle === false || settings.shockMode === 'none') return;
    let last = 0, px = 0, py = 0, pz = 0, primed = false;
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      const now = Date.now(); if (now - last < 110) return; last = now;
      const d = Math.abs((a.x || 0) - px) + Math.abs((a.y || 0) - py) + Math.abs((a.z || 0) - pz);
      px = a.x || 0; py = a.y || 0; pz = a.z || 0;
      if (!primed) { primed = true; return; }
      if (d > 42 && now - shakeAt.current > 1200) { shakeAt.current = now; shuffleShock(); }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [settings.shakeShuffle, settings.shockMode]);

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
    return (
      <Suspense fallback={<div className="min-h-[100dvh] bg-black flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
        <ResetPasswordScreen />
      </Suspense>
    );
  }
  if (!session) {
    return <SignInScreen />;
  }
  if (!dbProfile) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-black text-[#F5F1E8] relative overflow-hidden min-h-[100dvh]">
        <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          <OnboardingFlow onComplete={handleOnboard} onSignOut={signOut} />
        </Suspense>
      </div>
    );
  }
  // Terms re-acceptance gate. `undefined` means the tos_version column isn't
  // deployed yet (selectProfile fell back to the no-tos column list) — fail open.
  // `null`/stale means the column exists and this profile hasn't accepted the
  // current version — block until they agree.
  if (dbProfile.tos_version !== undefined && dbProfile.tos_version !== TERMS_VERSION) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-black text-[#F5F1E8] relative overflow-hidden min-h-[100dvh]">
        <TermsGate onAgree={async () => {
          await updateProfile(userId, { tos_version: TERMS_VERSION, tos_accepted_at: new Date().toISOString() });
          await refreshProfile();
        }} />
      </div>
    );
  }

  // Profile context for header
  const isInsideOverlay = activePortal || activeOddity || showOddityCompose;
  const onLibraryTap = () => {            // ✦ star → the portals menu
    if (activePortal) return;
    setActivePortal('menu');
  };
  const onLogoTap = () => {               // Coven wordmark → the portals menu
    if (activePortal) return;
    setActivePortal('menu');
  };
  // Open a portal directly from outside the menu (home screen tiles); closing returns home.
  const openPortalDirect = (id) => { setPortalFromMenu(false); setActivePortal(id); };
  // Single close handler for every portal overlay: back to the menu if that's where we
  // came from, otherwise all the way out to where the user was (home).
  const closePortal = () => setActivePortal(portalFromMenu ? 'menu' : null);

  // Age gate — the vice scenes + confessions are 18+; events carry their own door
  // policy (all-ages / 18+ / 21+). knownDob comes from a prior gate pass (synced) or
  // the user's own profile birthday; ageOk(min) is the verdict (unknown DOB → false).
  const VICE_SCENES = new Set(['drinking', 'smoking', 'gambling', 'partying']);
  const knownDob = ageDob || profile?.birthday || '';
  const ageOk = (min) => meetsAge(knownDob, min);
  const eventMinAge = (ev) => ev?.ageRestriction === '21' ? 21 : ev?.ageRestriction === '18' ? 18 : 0;

  const renderTab = () => {
    if (community) {
      if (VICE_SCENES.has(community) && !ageOk(18)) {
        return <AgeGate minAge={18} label="this scene" onPass={setAgeDob} onClose={() => setCommunity(null)} />;
      }
      return (
        <CommunityDetail
          id={community}
          onBack={() => setCommunity(null)}
          posts={(communityPosts || posts).filter(p => !isMutedPost(p) && !hiddenPosts[p.id])}
          loading={communityPosts === null}
          memberCount={communityCounts[community] || 0}
          isMember={!!communityMembership[community]}
          onToggleMembership={() => toggleCommunityMembership(community)}
          onPostToScene={() => { setComposeCommunity(community); setShowCompose(true); }}
          onOpenUser={openUserProfile}
        />
      );
    }
    if (tab === 'home') return (
      <HomeScreen
        posts={visiblePosts}
        feedError={feedError}
        onRetryFeed={() => { setFeedError(false); setFeedReloadKey(k => k + 1); }}
        onReact={reactToPost}
        onOpenComments={(id) => setActivePostComments(id)}
        onOpenCommunity={setCommunity}
        onOpenUser={openUserProfile}
        onDeletePost={deletePost}
        onEditPost={editPost}
        onHidePost={hidePost}
        onQuotePost={(id) => setQuoteTarget(id)}
        onWhisperPost={(id) => setSharePostTarget(id)}
        onOpenHashtag={(tag) => setActiveHashtag(tag)}
        onTogglePin={togglePin}
        pinnedPostId={pinnedPostId}
        feedSort={feedSort}
        onSetFeedSort={setFeedSort}
        feedScope={feedScope}
        onSetFeedScope={setFeedScope}
        onLoadMore={loadMoreFeed}
        feedHasMore={feedHasMore}
        onReportPost={(id) => setReportSheet({ kind: 'post', id })}
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
        onCreateStory={() => { setStoryAttachedPost(null); setShowStoryComposer(true); }}
        stories={stories}
        seenStories={seenStories}
        meHandle={meHandle}
        meAvatar={meAvatar}
        tonightStatus={tonightStatus}
        onOpenTonightStatus={() => setShowTonightModal(true)}
        onOpenTarot={() => openPortalDirect('tarot')}
        onOpenEphemeris={() => openPortalDirect('ephemeris')}
        onOpenCodex={() => openPortalDirect('codex')}
        onOpenVespersArchive={() => setShowVespersArchive(true)}
        ritual={ritual}
        ritualDoneToday={ritualDoneToday}
        onPerformRitual={performRitual}
        crystals={crystals}
        trackers={trackers}
        onUpdateTracker={updateTracker}
        onOpenReflections={() => setShowReflections(true)}
        feedLoading={feedLoading}
        suggestedSouls={suggestedSouls}
        following={following}
        onFollow={toggleFollow}
        witching={!!living?.witching}
        vigil={vigil}
        settings={settings}
      />
    );
    if (tab === 'communities') return (
      <CommunitiesScreen
        onOpenCommunity={setCommunity}
        membership={communityMembership}
        memberCounts={communityCounts}
        onToggleMembership={toggleCommunityMembership}
      />
    );
    if (tab === 'map') {
      if (festivalEvent && exitedFestivalId !== festivalEvent.id) {
        return <FestivalMap event={festivalEvent} onExit={() => setExitedFestivalId(festivalEvent.id)} />;
      }
      // The real map renders in the PERSISTENT layer below (see mapVisited) so the
      // maplibre instance survives tab switches instead of rebuilding every visit.
      return null;
    }
    if (tab === 'events') return (
      <EventsScreen events={events} rsvp={eventRsvp} onToggleRsvp={toggleEventRsvp} onOpenEvent={(id) => setActiveEvent(id)} onCreateEvent={() => setShowCreateEvent(true)} />
    );
    if (tab === 'oddities') return (
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#C9A961] text-xl animate-pulse-slow" style={F.brand}>Coven</div>}>
        <OdditiesOverlay
          embedded
          listings={listings}
          shops={shops}
          meId={meId}
          onOpenOddity={(id) => setActiveOddity(id)}
          onCompose={(kind) => { setComposeKind(kind || 'sale'); setShowOddityCompose(true); }}
          onAddShop={addShop}
          onDeleteShop={removeShop}
          onBoostShop={(id) => { showToast('opening secure checkout…'); startBoostCheckout(id).catch(e => showToast(`boost unavailable — ${e.message}`, 'error')); }}
        />
      </Suspense>
    );
    if (tab === 'profile') return (
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#C9A961] text-xl animate-pulse-slow" style={F.brand}>Coven</div>}>
      <ProfileScreen
        profile={{ ...profile, status: tonightStatus?.text || null }}
        onUnravel={() => summonShock('egodeath')}
        graves={graves}
        anniversaries={anniversaries}
        trackers={trackers}
        onUpdateTracker={updateTracker}
        onOpenTonightStatus={() => setShowTonightModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        onEditProfile={() => setShowEditProfile(true)}
        onOpenMood={() => setShowMood(true)}
        onShowFollowers={openFollowers}
        onShowFollowing={openFollowing}
        joinedScenes={COMMUNITIES.filter(c => communityMembership[c.id])}
        onOpenScene={(id) => { setTab('communities'); setCommunity(id); }}
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
        dreamsCount={dreams.length}
        onOpenDreams={() => setShowDreams(true)}
        onOpenTickets={() => setShowMyTickets(true)}
        ritual={ritual}
        ritualDoneToday={ritualDoneToday}
        onPerformRitual={performRitual}
        crystals={crystals}
        onToggleCrystal={toggleCrystal}
        shrine={shrine}
        onSetShrine={setShrine}
        flameLitAt={flameLitAt}
        onTendFlame={() => setFlameLitAt(Date.now())}
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
      </Suspense>
    );
    return null;
  };

  // Living theme — a tint that follows the local hour (festTick re-renders us every 60s).
  const living = (settings.livingTheme !== false && !settings.parchmentMode) ? livingTheme() : null;
  const vigil = settings.vigilEnabled !== false && !settings.parchmentMode && isVigil();

  return (
    <div className={`phone-frame max-w-md mx-auto relative overflow-hidden h-[100dvh] text-[#F5F1E8] ${effectiveShockMode === 'scream' || effectiveShockMode === 'paralysis' ? 'shock-shake' : effectiveShockMode === 'glitch' ? 'shock-jitter' : ''}`}
      style={{ background: settings.parchmentMode ? '#EDE0C2' : '#0A0A0A' }}>
      {/* Shock mode — BACK layer: bold occult motifs render BEHIND the app content so it stays readable */}
      {!settings.parchmentMode && !isInsideOverlay && effectiveShockMode !== 'none' && (
        <Suspense fallback={null}><ShockOverlay mode={effectiveShockMode} layer="back" /></Suspense>
      )}
      {/* Living ambient glow — breathing ember/candle light for depth (behind mood washes) */}
      {settings.ambientGlow !== false && !isInsideOverlay && !settings.parchmentMode && <AmbientGlow />}
      {/* Restrained oxblood breath — a hint at top + bottom over a deep near-black base, so the
          gold hairlines + editorial type can breathe. Drama lives in the shock modes, not always-on. */}
      {!settings.parchmentMode && (
        <div className="absolute inset-0 pointer-events-none z-10" aria-hidden style={{
          background: 'radial-gradient(ellipse at 50% 4%, rgba(139,0,0,0.13), transparent 50%), radial-gradient(ellipse at 50% 112%, rgba(91,15,26,0.16), transparent 56%)',
          mixBlendMode: 'soft-light',
        }} />
      )}
      {/* Vignette — heavy crimson-black falloff at the edges (brutalist frame) */}
      {settings.vignette && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: settings.parchmentMode
            ? 'radial-gradient(ellipse at center, transparent 60%, rgba(58, 34, 12, 0.25) 100%)'
            : 'radial-gradient(ellipse at center, transparent 54%, rgba(14,2,7,0.45) 84%, rgba(0,0,0,0.78) 100%)'
        }} />
      )}

      {/* Weather mood — tint derived from the live local weather. A single soft-light layer was
          invisible over the near-black base, so (like the profile-mood wash below) we use a
          screen-blended sky glow — top-weighted, like real skylight — PLUS a faint flat tint, so
          the weather actually reads while staying restrained. */}
      {settings.weatherMood && weatherTint && !isInsideOverlay && !settings.parchmentMode && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-[2000ms]" style={{
            background: `radial-gradient(ellipse at 50% -8%, ${weatherTint.color}52, transparent 56%), radial-gradient(ellipse at 50% 108%, ${weatherTint.color}30, transparent 60%)`,
            mixBlendMode: 'screen',
          }} />
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            background: weatherTint.color,
            opacity: Math.min(0.1, (weatherTint.opacity || 0.3) * 0.32),
          }} />
        </>
      )}

      {/* Profile mood — your self-set mood washes the whole app in its colour (in love → crimson,
          grieving → cold slate, euphoric → violet…) so picking a mood actually changes the world.
          Two layers: a bright screen-blended glow (vivid moods pop) + a faint flat tint (so even the
          dark moods — numb, grieving — register), plus a glowing seam under the header you can't miss. */}
      {moodActive(profile?.mood) && profile.mood.color && !isInsideOverlay && !settings.parchmentMode && (
        <>
          <div className="absolute inset-0 pointer-events-none z-[11]" style={{
            background: `radial-gradient(ellipse at 50% -6%, ${profile.mood.color}5C, transparent 52%), radial-gradient(ellipse at 50% 106%, ${profile.mood.color}4E, transparent 58%)`,
            boxShadow: `inset 0 0 150px 30px ${profile.mood.color}38`,
            mixBlendMode: 'screen',
          }} />
          <div className="absolute inset-0 pointer-events-none z-[11]" style={{ background: profile.mood.color, opacity: 0.07 }} />
          <div className="absolute top-[60px] inset-x-0 h-[2px] pointer-events-none z-[31]" style={{ background: `linear-gradient(90deg, transparent, ${profile.mood.color}, transparent)`, boxShadow: `0 0 14px 1px ${profile.mood.color}` }} />
        </>
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

      {/* Living theme — time-of-day tint; deepest at the 3–4am witching hour */}
      {living && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-[3000ms]" style={{
          background: living.color,
          opacity: living.opacity,
          mixBlendMode: 'soft-light',
        }} />
      )}

      {/* Shock mode — FRONT layer: only translucent texture/chrome, on top (z-30, pointer-events-none) */}
      {!settings.parchmentMode && !isInsideOverlay && effectiveShockMode !== 'none' && (
        <Suspense fallback={null}><ShockOverlay mode={effectiveShockMode} layer="front" /></Suspense>
      )}
      {/* Grain — floored so the film texture stays visibly present (still slider-controlled above the floor) */}
      {settings.grainIntensity > 0 && (
        settings.grainStyle === 'print'
          ? <HalftoneOverlay opacity={Math.max(settings.grainIntensity, 0.12) * 1.6} />
          : <GrainOverlay opacity={Math.max(settings.grainIntensity, 0.12)} />
      )}

      {/* Fixed header (pinned to the viewport frame) */}
      <Header
        tab={tab}
        onDMs={() => setShowDMs(true)}
        onCompose={() => setShowCompose(true)}
        onLibrary={onLibraryTap}
        onLogo={onLogoTap}
        onSecret={() => setShowSigilDraw(true)}
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
        {/* Persistent map layer — warm-mounted shortly after launch, then only
            visibility-toggled so the maplibre instance (style, tiles, camera) survives tab
            switches. visibility (not display) keeps its real size, so tiles pre-render
            invisibly and the map tab opens fully drawn. */}
        {mapVisited && (
          <div className="absolute inset-0" style={(tab === 'map' && !(festivalEvent && exitedFestivalId !== festivalEvent.id)) ? undefined : { visibility: 'hidden', pointerEvents: 'none' }}>
            <FeatureBoundary label="tab-map">
              <MapScreen
                tonightStatus={tonightStatus}
                ghost={settings.ghostMode}
                pins={tonightPins.filter(p => p.userId !== meId && !blockedIds.has(p.userId))}
                nearby={nearby.filter(n => !blockedIds.has(n.userId))}
                events={eventsOnMap}
                onOpenUser={(h) => setActiveUserHandle(h)}
                onOpenTonightStatus={() => setShowTonightModal(true)}
                onOpenEvent={(id) => setActiveEvent(id)}
                onCreateEventAt={(c) => { setEventDraftCoords(c); setShowCreateEvent(true); }}
                festivalEvent={festivalEvent && exitedFestivalId === festivalEvent.id ? festivalEvent : null}
                onEnterFestival={() => setExitedFestivalId(null)}
              />
            </FeatureBoundary>
          </div>
        )}
        <div className="animate-screen-in" key={`${tab}-${community || ''}`}>
          <FeatureBoundary label={`tab-${tab}`}>
            {renderTab()}
          </FeatureBoundary>
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
        <FeatureBoundary label="dm">
        <ChatThread
          key={activeConversation}
          conversationId={activeConversation}
          conversation={conversations.find(c => c.id === activeConversation) || activeConvMeta}
          messages={messages[activeConversation] || []}
          initialDraft={dmPrefill}
          meHandle={meHandle}
          onSend={(body, audioUrl) => sendMessage(activeConversation, body, audioUrl)}
          onRetry={(messageId) => retryMessage(activeConversation, messageId)}
          onReact={(messageId, kind) => reactToMessage(activeConversation, messageId, kind)}
          onOpenPost={(id) => { setActiveConversation(null); setActiveConvMeta(null); setActivePostComments(id); }}
          onOpenUser={(handle) => { setActiveConversation(null); setActiveConvMeta(null); openUserProfile(handle); }}
          onLeaveGroup={(convId) => {
            leaveCrew(convId)
              .then(() => {
                setActiveConversation(null); setActiveConvMeta(null);
                setConversations(prev => prev.filter(c => c.id !== convId));
                listCrews().then(setCrews).catch(() => {});
                showToast('you slipped out of the circle.');
              })
              .catch(() => showToast("couldn't leave the circle — try again.", 'error'));
          }}
          onBack={() => { setActiveConversation(null); setActiveConvMeta(null); }}
        />
        </FeatureBoundary>
      )}
      {showCompose && (
        <ComposeOverlay
          meId={meId}
          initialCommunity={composeCommunity}
          onClose={() => { setShowCompose(false); setComposeCommunity(null); setComposeEventId(null); }}
          onPost={(data) => { addPost({ ...data, eventId: composeEventId }); setShowCompose(false); setComposeCommunity(null); setComposeEventId(null); }}
        />
      )}
      {activePostComments && (
        <CommentsOverlay
          post={posts.find(p => p.id === activePostComments)}
          onClose={() => setActivePostComments(null)}
          onComment={(body, parentId) => addComment(activePostComments, body, parentId)}
          onReact={(kind) => reactToPost(activePostComments, kind)}
          onReactComment={(commentId, kind) => reactToComment(activePostComments, commentId, kind)}
          onEditComment={(commentId, body) => editComment(activePostComments, commentId, body)}
          onDeleteComment={(commentId) => deleteComment(activePostComments, commentId)}
          isBookmarked={!!bookmarks[activePostComments]}
          onToggleBookmark={() => toggleBookmark(activePostComments)}
          onOpenUser={openUserProfile}
        />
      )}
      {activeUserHandle && (
        <UserProfileOverlay
          handle={activeUserHandle}
          posts={posts}
          mutedKeywords={mutedKeywords}
          meId={meId}
          onToast={showToast}
          isFollowing={!!following[activeUserHandle]}
          isMuted={!!muted[activeUserHandle]}
          onToggleFollow={() => toggleFollow(activeUserHandle)}
          onToggleMute={() => toggleMute(activeUserHandle)}
          onWhisper={() => { const h = activeUserHandle; setActiveUserHandle(null); openDMWithUser(h); }}
          onOpenComments={(id) => setActivePostComments(id)}
          onReact={reactToPost}
          onBlock={(profileId) => blockUserById(profileId, activeUserHandle)}
          onReport={(profileId) => setReportSheet({ kind: 'user', id: profileId })}
          onClose={() => setActiveUserHandle(null)}
          myspace={settings.myspaceProfile}
          onOpenUser={(h) => setActiveUserHandle(h)}
        />
      )}
      {showNotifs && (
        <NotificationsPanel
          notifications={notifications.filter(n => {
            const kinds = settings.notificationKinds;
            if (!kinds) return true;
            const cat = NOTIF_KIND_CATEGORY[n.kind];
            return cat ? kinds[cat] !== false : true; // unknown kinds always show
          })}
          onClose={() => setShowNotifs(false)}
          onMarkAllRead={markAllNotifsRead}
          onMarkRead={markNotifRead}
          onTap={handleNotificationTap}
          onClearAll={() => { setNotifications([]); clearNotifications(meId).catch((e) => { console.error('[notifications] clear failed', e); fetchNotifications().then(setNotifications).catch(() => {}); }); }}
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
          onSetShrineTheme={setShrineTheme}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {showMood && (
        <MoodModal
          current={profile?.mood}
          onSave={saveMood}
          onClose={() => setShowMood(false)}
        />
      )}
      {sharePostTarget && (
        <ShareToDMModal
          post={posts.find(p => p.id === sharePostTarget)}
          conversations={conversations}
          onPick={whisperPost}
          onAddToStory={() => { const p = posts.find(p => p.id === sharePostTarget); setSharePostTarget(null); setStoryAttachedPost(p || null); setShowStoryComposer(true); }}
          onClose={() => setSharePostTarget(null)}
        />
      )}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={activeStoryIndex}
          onReply={(authorHandle, body) => sendMessageToUser(authorHandle, body)}
          onReactStory={(storyId, kind) => {
            if (!meId) return undefined;
            return reactToStory(storyId, kind, meId).catch((e) => {
              showToast("couldn't react to the story — try again.", 'error');
              throw e; // let StoryViewer roll its optimistic glyph back
            });
          }}
          onDelete={removeStory}
          onSeen={(id) => setSeenStories(prev => (prev[id] ? prev : { ...prev, [id]: 1 }))}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
      {showStoryComposer && (
        <StoryComposer
          meId={meId}
          attachedPost={storyAttachedPost}
          onClose={() => { setShowStoryComposer(false); setStoryAttachedPost(null); }}
          onPost={(story) => { postStory(story, storyAttachedPost); setShowStoryComposer(false); setStoryAttachedPost(null); }}
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
      {activeEvent && (() => {
        const _ev = events.find(e => e.id === activeEvent);
        const _min = eventMinAge(_ev);
        if (_min && !ageOk(_min)) {
          return <AgeGate minAge={_min} label="this rite" onPass={setAgeDob} onClose={() => setActiveEvent(null)} />;
        }
        return (
        <EventDetail
          event={_ev}
          isGoing={!!eventRsvp[activeEvent]}
          onToggleRsvp={toggleEventRsvp}
          attendees={activeEventAttendees}
          meHandle={meHandle}
          onBuy={buyTicket}
          onManageTickets={(ev) => setTicketManagerEvent(ev)}
          onOpenUser={(h) => { setActiveEvent(null); setActiveUserHandle(h); }}
          onBack={() => setActiveEvent(null)}
          onDelete={removeEvent}
          waitlist={eventWaitlist}
          onJoinWaitlist={joinEventWaitlist}
          onLeaveWaitlist={leaveEventWaitlist}
          recaps={eventRecaps}
          onStartRecap={startEventRecap}
          onOpenRecap={openRecapPost}
        />
        );
      })()}
      {showCreateEvent && (
        <CreateEventModal onCreate={addEvent} initialCoords={eventDraftCoords}
          onClose={() => { setShowCreateEvent(false); setEventDraftCoords(null); }} />
      )}
      {showAdminPanel && (
        <AdminPanel meId={meId} onClose={() => setShowAdminPanel(false)} onToast={showToast}
          onOpenUser={(h) => { setShowAdminPanel(false); setActiveUserHandle(h); }} />
      )}
      {showMyspaceEditor && (
        <MySpaceEditor
          initial={myspaceCfg || {}}
          following={followingPeople}
          onSave={async (cfg) => {
            setMyspaceCfg(cfg);
            if (meId) await saveMyspace(meId, cfg);
            showToast('your old-web profile is saved.');
          }}
          onClose={() => setShowMyspaceEditor(false)}
        />
      )}
      {ticketManagerEvent && (
        <TicketManager
          event={ticketManagerEvent}
          onClose={() => setTicketManagerEvent(null)}
          onToast={showToast}
          onEditVenueMap={() => { const ev = ticketManagerEvent; setTicketManagerEvent(null); setVenueEditorEvent(ev); }}
        />
      )}
      {venueEditorEvent && (
        <VenueMapEditor
          event={venueEditorEvent}
          me={{ id: meId }}
          onClose={() => setVenueEditorEvent(null)}
          onSaved={() => { fetchEvents(meId).then(({ events: ev }) => setEvents(ev)).catch(() => {}); }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}
      {ticketSuccess && (
        <div className="animate-fade-in absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-8" onClick={() => setTicketSuccess(false)}>
          <div className="animate-card-flip bg-[#0F0F0F] border border-[#2A2A2A] p-8 text-center max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">🎟</div>
            <div className="text-[#C9A961] text-lg mb-1" style={F.display}>TICKET SECURED</div>
            <p className="text-[#A8A29E] text-sm" style={F.serif}>your spot is held. see you in the dark.</p>
            <button onClick={() => setTicketSuccess(false)} className="mt-5 text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>close</button>
          </div>
        </div>
      )}
      {showVespersArchive && (
        <Suspense fallback={null}>
          <VespersArchiveModal
            onClose={() => setShowVespersArchive(false)}
          />
        </Suspense>
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
      {showDreams && (
        <DreamJournalModal
          dreams={dreams}
          onAdd={addDream}
          onRemove={removeDream}
          onClose={() => setShowDreams(false)}
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
          onClose={() => setShowSearch(false)}
          onOpenUser={(handle) => { setActiveUserHandle(handle); setShowSearch(false); }}
          onOpenPost={(id) => { setActivePostComments(id); setShowSearch(false); }}
          onOpenCommunity={(id) => { setTab('communities'); setCommunity(id); setShowSearch(false); }}
          onOpenEvent={(id) => { setActiveEvent(id); setTab('events'); setShowSearch(false); }}
          onOpenCodex={() => { setPortalFromMenu(false); setActivePortal('codex'); setShowSearch(false); }}
        />
      )}
      {showSettings && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
        <SettingsScreen
          settings={settings}
          onChange={setSettings}
          onToggleSound={toggleSound}
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
          onEditMyspace={() => { setShowSettings(false); setShowMyspaceEditor(true); }}
          onOpenBlocked={() => setShowBlocked(true)}
          onOpenLegal={() => setShowLegal(true)}
          onDeleteAccount={() => setShowDeleteConfirm(true)}
          onOpenShockPicker={() => { setShowSettings(false); setShowShockPicker(true); }}
          onOpenAnalytics={() => { setShowSettings(false); setShowAnalytics(true); }}
          onOpenAdmin={isAdmin ? () => { setShowSettings(false); setShowAdminPanel(true); } : undefined}
        />
        </Suspense>
      )}
      {showAnalytics && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          <AnalyticsDashboard onClose={() => setShowAnalytics(false)} meHandle={meHandle} />
        </Suspense>
      )}
      {activeHashtag && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          <HashtagFeed
            tag={activeHashtag}
            meId={meId}
            onClose={() => setActiveHashtag(null)}
            onOpenHashtag={(t) => setActiveHashtag(t)}
            onOpenPost={(id) => { setActiveHashtag(null); setActivePostComments(id); }}
            onOpenUser={(h) => { setActiveHashtag(null); openUserProfile(h); }}
            onReact={reactToPost}
          />
        </Suspense>
      )}
      {showShockPicker && (
        <ShockModePicker
          current={settings.shockMode}
          unlocked={unlockedShock}
          onPick={(id) => { if (id === 'paralysis' || id === 'egodeath') primeHorror(); setSettings({ ...settings, shockMode: id }); }}
          onClose={() => setShowShockPicker(false)}
        />
      )}
      {/* the forbidden reveal — plays the intro, then hands you to the summoned mode + unlocks it */}
      {revealTarget && (
        <ForbiddenReveal
          target={revealTarget}
          name={meHandle}
          onComplete={(m) => {
            setRevealTarget(null);
            // A transient scare (paralysis) plays for ~10s then clears itself — it never becomes a
            // selectable theme. Other secret modes (egodeath) unlock + persist as before.
            if (SHOCK_MODES.find((x) => x.id === m)?.transient) {
              setTransientShock(m);
              clearTimeout(transientTimer.current);
              transientTimer.current = setTimeout(() => setTransientShock(null), 10000);
            } else {
              setSettings((s) => ({ ...s, shockMode: m }));
              setUnlockedShock((u) => (u.includes(m) ? u : [...u, m]));
            }
          }}
        />
      )}
      {showLegal && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          <LegalScreen onBack={() => setShowLegal(false)} />
        </Suspense>
      )}
      {showDeleteConfirm && (
        <DeleteAccountModal
          onConfirm={async () => { await deleteAccount(); signOut(); }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
      {reportSheet && (
        <ReportSheet
          onClose={() => setReportSheet(null)}
          onPick={(reason) => {
            reportTarget(reportSheet.kind, reportSheet.id, reason);
            const esc = (reason === 'illegal' || reason === 'copyright') ? reason : null;
            setReportSheet(null);
            if (esc) setLegalEscalation(esc);
          }}
        />
      )}
      {legalEscalation && (
        <div className="fixed inset-0 z-[62] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" onClick={() => setLegalEscalation(null)}>
          <div className="bg-[#0F0F0F] border border-[#5B0F1A]/40 w-full max-w-xs p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="text-[#C9A961] text-sm tracking-[0.2em] mb-2" style={F.display}>{legalEscalation === 'copyright' ? 'DMCA NOTICE' : 'URGENT REPORT'}</div>
            <p className="text-[#A8A29E] text-sm leading-relaxed mb-4" style={F.serif}>
              {legalEscalation === 'copyright'
                ? 'Thank you. To file a formal copyright takedown, email noahoja@gmail.com with the work, the infringing link, your contact info, and a good-faith statement.'
                : 'Thank you — we’ll act fast. For urgent or illegal content, email noahoja@gmail.com with a link. (We report content involving minors to NCMEC.)'}
            </p>
            <button onClick={() => setLegalEscalation(null)} className="w-full py-2.5 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-[10px] uppercase tracking-wider" style={F.ui}>done</button>
          </div>
        </div>
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

      {/* Coven portals — lazy-loaded, so one Suspense covers the whole block */}
      <FeatureBoundary label="portal">
      <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
      {activePortal === 'menu' && (
        <CovenMenu
          onClose={() => setActivePortal(null)}
          onOpen={(id) => { setPortalFromMenu(true); setActivePortal(id); }}
        />
      )}
      {activePortal === 'tarot' && (
        <TarotOverlay
          onClose={closePortal}
          history={cardHistory}
          onRecord={recordCardDraw}
          onLogDivination={logDivination}
          divinationLog={divinationLog}
          onShare={(pull) => {
            const body = `✦ today's pull: ${pull.card.name}${pull.reversed ? ' · reversed' : ''} — "${pull.reversed ? pull.card.reversed : pull.card.upright}"`;
            addPost({ body, community: 'general' });
            closePortal();
          }}
        />
      )}
      {activePortal === 'codex' && (
        <CodexOverlay onClose={closePortal} />
      )}
      {activePortal === 'ephemeris' && (
        <EphemerisOverlay onClose={closePortal} profile={profile} />
      )}
      {activePortal === 'sigils' && (
        <SigilOverlay onClose={closePortal} onSave={saveSigil} />
      )}
      {activePortal === 'pendulum' && (
        <PendulumOverlay onClose={closePortal} onLog={logDivination} />
      )}
      {activePortal === 'intention' && (
        <IntentionTimerOverlay
          intention={activeIntention}
          onStart={startIntention}
          onClear={clearIntention}
          onClose={closePortal}
        />
      )}
      {activePortal === 'souls' && (
        <SoulsOverlay
          meId={meId}
          following={following}
          onClose={closePortal}
          onOpenUser={(h) => { setActivePortal(null); setActiveUserHandle(h); }}
        />
      )}
      {activePortal === 'confessions' && (
        ageOk(18) ? (
          <ConfessionsOverlay onClose={closePortal}
            userConfessions={posts.filter(p => p.anonymous).map(p => ({
              id: p.id, body: p.body, time: p.time,
              reactions: p.reactions, myReactions: p.myReactions || {},
            }))}
            onConfess={(body) => addPost({ body, community: 'general', anonymous: true })}
            onReact={reactToPost}
            onReport={(id) => setReportSheet({ kind: 'post', id })}
          />
        ) : (
          <AgeGate minAge={18} label="confessions" onPass={setAgeDob} onClose={closePortal} />
        )
      )}
      {activeOddity && (
        <OddityDetail
          item={listings.find(l => l.id === activeOddity)}
          onWhisper={(h) => {
            const it = listings.find(l => l.id === activeOddity);
            const prefill = it ? `re: "${it.title}" — is this still available?` : '';
            setActiveOddity(null); setActivePortal(null); openDMWithUser(h, prefill);
          }}
          onOpenUser={(h) => { setActiveOddity(null); setActivePortal(null); if (h && h !== meHandle) setActiveUserHandle(h); }}
          onMarkSold={(id) => {
            setListings(prev => prev.filter(l => l.id !== id));
            markListingSold(id).then(() => showToast('marked sold.')).catch(() => { showToast("couldn't mark it sold — try again.", 'error'); fetchListings(meId).then(setListings).catch(() => {}); });
          }}
          onDelete={(id) => {
            setListings(prev => prev.filter(l => l.id !== id));
            deleteListing(id).then(() => showToast('listing removed.')).catch(() => { showToast("couldn't delete it — try again.", 'error'); fetchListings(meId).then(setListings).catch(() => {}); });
          }}
          onBack={() => setActiveOddity(null)}
        />
      )}
      {showOddityCompose && (
        <OddityCompose
          meId={meId}
          kind={composeKind}
          onClose={() => setShowOddityCompose(false)}
          onCreate={(data) => addOddity(data)}
        />
      )}
      </Suspense>
      </FeatureBoundary>
      {followList && (
        <FollowListOverlay
          initialTab={followList.tab}
          myId={meId}
          onClose={() => setFollowList(null)}
          onOpenUser={(h) => { setFollowList(null); if (h && h !== meHandle) setActiveUserHandle(h); }}
        />
      )}
      {!seenWelcome && meId && dbProfile && profile && (
        <Suspense fallback={null}>
          <WelcomeOverlay
            handle={meHandle}
            onClose={() => setSeenWelcome(true)}
            onDropStatus={() => { setSeenWelcome(true); setShowTonightModal(true); }}
            onFindSouls={() => { setSeenWelcome(true); openPortalDirect('souls'); }}
            onSpeak={() => { setSeenWelcome(true); setShowCompose(true); }}
          />
        </Suspense>
      )}
      {showSigilDraw && (
        <FeatureBoundary label="sigil">
        <Suspense fallback={<div className="absolute inset-0 z-[60] bg-[#050204] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          <SigilDrawOverlay
            unlocked={loreUnlocked}
            onUnlock={() => { setLoreUnlocked(true); showToast('the dark answered — a hidden leaf opens'); }}
            onClose={() => setShowSigilDraw(false)}
          />
        </Suspense>
        </FeatureBoundary>
      )}
      {settings.familiar !== false && !anyOverlayOpen && <FloatingCat active onSummon={summonShock} />}
      {/* the haunt — when a horror mode is on, it roams the app and strikes unpredictably. Held back
          during the reveal itself AND while any overlay/modal is open, so a jumpscare never covers
          what you're reading (a DM, settings, a post). The persistent egodeath theme is also calmed
          inside ShockHaunt (no full-screen lunges, longer gaps). */}
      {!settings.parchmentMode && <ShockHaunt mode={effectiveShockMode} name={meHandle} active={!revealTarget && !anyOverlayOpen} />}
      {/* theme chrome (tap sparks + mode switcher) hides during a transient scare so the
          10s paralysis takeover stays pure horror — only the overlay + haunt show */}
      {!transientShock && settings.shockMode !== 'none' && settings.reactiveTaps !== false && !anyOverlayOpen && !settings.parchmentMode && (
        <ShockSparks mode={settings.shockMode} />
      )}
      {!transientShock && settings.shockMode !== 'none' && settings.quickSwitch !== false && !anyOverlayOpen && !settings.parchmentMode && (
        <ShockQuickSwitch onNext={nextShock} onShuffle={shuffleShock} onPicker={() => setShowShockPicker(true)} />
      )}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
