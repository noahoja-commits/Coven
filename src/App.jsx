import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './auth/AuthProvider';
import { isSupabaseConfigured } from './lib/supabase';
import { SignInScreen } from './components/auth/SignInScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { fetchFeed, createPost, deletePost as dbDeletePost, togglePostReaction, fetchComments, createComment, castPollVote, clearPollVote } from './lib/db/posts';
import { insertProfile, updateProfile, getProfileStats, getProfileByHandle, fetchProfiles } from './lib/db/profiles';
import { fetchFollowing, fetchFollowers, followUser, unfollowUser } from './lib/db/social';
import { FollowListOverlay } from './components/profile/FollowListOverlay';
import { joinCommunity, leaveCommunity, fetchCommunityMemberCounts } from './lib/db/communities';
import { fetchConversations, getOrCreateDM, createGroup, fetchMessages as fetchDMMessages, sendDM, markRead as dmMarkRead, setBuried as dmSetBuried, subscribeDMs, toggleDMReaction, subscribeDMReactions, sendPostToDM } from './lib/db/dm';
import { fetchActiveStories, postStory as dbPostStory, deleteStory, reactToStory } from './lib/db/stories';
import { fetchListings, createListing } from './lib/db/listings';
import { fetchShops, createShop, deleteShop as dbDeleteShop } from './lib/db/shops';
import { fetchPayoutStatus, startPayoutSetup, refreshPayoutStatus } from './lib/db/payouts';
import { listCrews, createCrew as dbCreateCrew, joinCrew as dbJoinCrew } from './lib/db/crews';
import { fetchProfileState, saveProfileState } from './lib/db/profileState';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications, subscribeNotifications, hydrateRealtime } from './lib/db/notifications';
import { fetchBlockedIds, blockUser as dbBlockUser, unblockUser as dbUnblockUser, reportContent } from './lib/db/moderation';
import { BlockedOverlay } from './components/settings/BlockedOverlay';
import { LegalScreen } from './components/legal/LegalScreen';
import { DeleteAccountModal } from './components/settings/DeleteAccountModal';
import { deleteAccount } from './lib/db/account';
import { ReportSheet } from './components/shared/ReportSheet';
import { enablePush, disablePush, pushStatus } from './lib/db/push';
import { setTonightPin, clearTonightPin, fetchTonightPins, subscribeTonightPins, setTonightGeo, clearTonightGeo, fetchNearby } from './lib/db/tonight';
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
import { GrainOverlay, AmbientGlow, HalftoneOverlay } from './components/shared/Visuals';
import { ShockOverlay, SHOCK_MODES } from './components/shared/ShockOverlay';
import { ShockModePicker } from './components/settings/ShockModePicker';
import { startAmbient, stopAmbient } from './lib/ambient';
import { fetchWeatherTint, getPosition } from './lib/weather';
import { InstallPrompt } from './components/shared/InstallPrompt';

import { HomeScreen } from './components/feed/HomeScreen';
import { CommunitiesScreen, CommunityDetail } from './components/communities/CommunitiesScreen';
import { MapScreen } from './components/map/MapScreen';
import { EventsScreen } from './components/events/EventsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { TonightStatusModal } from './components/profile/TonightStatusModal';
import { ProfileEditModal } from './components/profile/ProfileEditModal';
import { MoodModal } from './components/profile/MoodModal';
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
// Lazy — the Library carries the full text of every book; keep it out of the initial bundle.
const LibraryOverlay = lazy(() => import('./components/library/LibraryOverlay').then(m => ({ default: m.LibraryOverlay })));
const ReaderView = lazy(() => import('./components/library/ReaderView').then(m => ({ default: m.ReaderView })));
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
import { FashionScreen } from './components/fashion/FashionScreen';

import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { WelcomeOverlay } from './components/onboarding/WelcomeOverlay';
import { AgeGate } from './components/shared/AgeGate';
import { SettingsScreen, DEFAULT_SETTINGS } from './components/settings/SettingsScreen';

import { COMMUNITIES } from './data/communities';
import { fetchEvents, createEvent, toggleEventRsvp as dbToggleRsvp, fetchEventAttendees, deleteEvent as dbDeleteEvent, joinWaitlist, leaveWaitlist, fetchWaitlist } from './lib/db/events';
import { CommentsOverlay } from './components/feed/CommentsOverlay';
import { QuoteModal } from './components/feed/QuoteModal';
import { VespersArchiveModal } from './components/feed/VespersArchiveModal';
import { TRACKER_CATEGORIES } from './data/profile';
import { livingTheme, meetsAge, isVigil } from './data/helpers';
import { earnedAchievements } from './data/achievements';
import { inQuietHours } from './lib/quietHours';
import { FloatingCat } from './components/shared/FloatingCat';
import { ShockQuickSwitch } from './components/shared/ShockQuickSwitch';
import { ShockSparks } from './components/shared/ShockSparks';

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
  const [dmPrefill, setDmPrefill] = useState(''); // seeds the chat draft (e.g. an oddity inquiry)
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [pushState, setPushState] = useState('off');
  const [weatherTint, setWeatherTint] = useState(null); // {color,opacity} when Weather mood is on
  const [showTonightModal, setShowTonightModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
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
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [showVespersArchive, setShowVespersArchive] = useState(false);

  const [activePortal, setActivePortal] = useState(null); // 'menu' | 'library' | 'oddities' | etc.
  // Tracks whether the current portal was opened from the star→menu (so closing returns
  // to the menu) vs. directly from the home screen / logo (so closing returns to home).
  const [portalFromMenu, setPortalFromMenu] = useState(false);
  const [activeText, setActiveText] = useState(null); // library reader
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

  // Live content state (Supabase-backed)
  const [posts, setPosts] = useState([]);
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
  const [eventRsvp, setEventRsvp] = useState({});
  const [events, setEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
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
  const [marginalia, setMarginalia] = useLocalStorage('marginalia', {});
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

  // Load fonts
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

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
    };
    document.body.classList.remove('shock-type-grenze', 'shock-type-pirata', 'shock-type-metal', 'shock-type-unifraktur', 'shock-type-rocker');
    const fc = SHOCK_FONT[settings.shockMode];
    if (fc && !settings.parchmentMode) document.body.classList.add(fc);
    // Some modes recolour the WHOLE app via a reliable element filter on .phone-frame (backdrop-filter
    // wouldn't override the red base): insomnia=electric blue, requiem=stark B&W, mist=sepia.
    const SHOCK_DUO = { insomnia: 'shock-duo-blue', requiem: 'shock-duo-bw', mist: 'shock-duo-sepia' };
    document.body.classList.remove('shock-duo-blue', 'shock-duo-bw', 'shock-duo-sepia');
    const dc = SHOCK_DUO[settings.shockMode];
    if (dc && !settings.parchmentMode) document.body.classList.add(dc);
  }, [settings.parchmentMode, settings.mediaTreatment, settings.shockMode]);

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
    const anyModal = showEditProfile || showMood || showTonightModal || showSettings || showNotifs
      || showCompose || showStoryComposer || showSearch || showVespersArchive
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
    fetchConversations().then(c => { if (active) setConversations(c); }).catch(e => console.error('[load] conversations failed:', e));
    fetchActiveStories(meId).then(s => { if (active) setStories(s); }).catch(() => {});
    fetchListings(meId).then(l => { if (active) setListings(l); }).catch(() => {});
    fetchShops(meId).then(s => { if (active) setShops(s); }).catch(() => {});
    fetchPayoutStatus(meId).then(p => { if (active) setPayoutStatus(p); }).catch(() => {});
    listCrews().then(c => { if (active) setCrews(c); }).catch(() => {});
    fetchMyTicketEventIds().then(ids => { if (active) setMyTicketEventIds(ids); }).catch(() => {});
    fetchNotifications().then(n => { if (active) setNotifications(n); }).catch(e => console.error('[load] notifications failed:', e));
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
        if (cs.shrine !== undefined) setShrine(cs.shrine);
        if (cs.flameLitAt !== undefined) setFlameLitAt(cs.flameLitAt);
        if (cs.ageDob !== undefined && cs.ageDob) setAgeDob(cs.ageDob);
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
    setFeedLoading(true);
    fetchFeed(meId, { scope: feedScope }).then(rows => {
      if (!active) return;
      setPosts(rows);
      setFeedHasMore(rows.length >= 20);
    }).catch(e => console.error('[load] feed failed:', e))
      .finally(() => { if (active) setFeedLoading(false); });
    return () => { active = false; };
  }, [meId, dbProfile, feedScope]);

  // Real per-scene feed: when a scene is open, fetch its own posts (not just whatever
  // happens to be in the loaded global feed). Falls back to null (→ client filter) on error.
  useEffect(() => {
    if (!community || !meId) { setCommunityPosts(null); return; }
    let active = true;
    setCommunityPosts(null);
    fetchFeed(meId, { scope: 'everyone', community, limit: 40 })
      .then(rows => { if (active) setCommunityPosts(rows); })
      .catch(e => { console.error('[load] scene feed failed:', e); });
    return () => { active = false; };
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
      marginalia, postCandles, nowPlaying, activityLog, mutedKeywords, hiddenPosts,
      ritual, crystals, pinnedPostId, shrineTheme, divinationLog, storyHighlights, shrine, flameLitAt,
      ageDob,
    };
    const t = setTimeout(() => { saveProfileState(meId, 'clientSync', blob).catch(() => {}); }, 800);
    return () => clearTimeout(t);
  }, [meId, tonightStatus, communityMembership, bookmarks, muted, anniversaries, cardHistory,
      marginalia, postCandles, nowPlaying, activityLog, mutedKeywords, hiddenPosts,
      ritual, crystals, pinnedPostId, shrineTheme, divinationLog, storyHighlights, shrine, flameLitAt, ageDob]);

  // Latest quiet-hours setting for the realtime closure below (avoids a stale capture).
  const quietHoursRef = useRef(settings.quietHours);
  quietHoursRef.current = settings.quietHours;

  // Live notifications: a new row (follow/react/comment/dm) → refetch so the
  // bell updates in real time, with the actor's profile joined in.
  useEffect(() => {
    if (!meId || !dbProfile) return;
    const unsub = subscribeNotifications((row) => {
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
  }, [meId, dbProfile]);

  // Returning from Stripe (ticket checkout / Connect onboarding) — webhooks are async, and on a
  // COLD load meId is null on first paint. So parse the URL params ONCE on mount (the params get
  // cleared here), stash the payment-return intent, and run the meId-gated refreshes in the effect
  // below once auth has rehydrated — otherwise a cold return from Stripe silently skips the refresh.
  const [pendingTicketRefresh, setPendingTicketRefresh] = useState(false);
  const [pendingConnectRefresh, setPendingConnectRefresh] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('ticket');
    const connect = params.get('connect');
    // Deep links: a shared link can open specific content on load.
    const u = params.get('u');
    const ev = params.get('event');
    const od = params.get('oddity');
    const po = params.get('post');
    if (!t && !connect && !u && !ev && !od && !po) return;
    history.replaceState(null, '', window.location.pathname);
    if (u) setActiveUserHandle(u.toLowerCase().replace(/[^a-z0-9_.]/g, ''));
    if (ev) { setActiveEvent(ev); setTab('events'); }
    if (od) { setActiveOddity(od); setActivePortal('oddities'); setPortalFromMenu(false); }
    if (po) setActivePostComments(po);
    if (t === 'success') { setTicketSuccess(true); setPendingTicketRefresh(true); }
    if (connect === 'done') setPendingConnectRefresh(true);
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
  }, [meId, pendingTicketRefresh, pendingConnectRefresh]);

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
  // Ghost mode keeps you off the map entirely (status stays local/profile-only).
  // Await the write before refetching so a clear can't race the refetch and
  // re-surface a pin that's mid-delete.
  const saveTonightStatus = async (status) => {
    setTonightStatus(status);
    const sharing = !!(status && status.text && status.share && !settings.ghostMode);
    try {
      if (!status || !status.text || settings.ghostMode) {
        await clearTonightPin();
      } else {
        await setTonightPin({ text: status.text, neighborhood: status.neighborhood, expiresAt: status.expiresAt });
      }
    } catch { /* ignore network errors */ }
    // Real GPS proximity (opt-in): store precise coords (owner-locked) or clear them.
    try {
      if (sharing) {
        const { latitude, longitude } = await getPosition();
        await setTonightGeo({ lat: latitude, lng: longitude, fuzzM: status.fuzzM });
        fetchNearby(latitude, longitude).then(setNearby).catch(() => {});
      } else {
        await clearTonightGeo();
        setNearby([]);
      }
    } catch {
      clearTonightGeo().catch(() => {}); // never leave stale coords broadcasting
      setNearby([]);
      if (sharing) showToast("couldn't read your location — sharing off.", 'error');
    }
    fetchTonightPins().then(setTonightPins).catch(() => {});
  };

  // Going ghost must immediately pull any existing pin AND precise coords from the shared map.
  useEffect(() => {
    if (!settings.ghostMode) return;
    clearTonightPin().then(() => fetchTonightPins().then(setTonightPins)).catch(() => {});
    clearTonightGeo().catch(() => {});
    setNearby([]);
  }, [settings.ghostMode]);

  // Refresh privacy-fuzzed proximity only when the map is open and you're sharing (lazy —
  // never prompts for location on a normal page load).
  useEffect(() => {
    if (tab !== 'map' || !meId || !tonightStatus?.share || settings.ghostMode) return undefined;
    let active = true;
    getPosition()
      .then(({ latitude, longitude }) => fetchNearby(latitude, longitude))
      .then(list => { if (active) setNearby(list); })
      .catch(() => { if (active) setNearby([]); });
    return () => { active = false; };
  }, [tab, meId, tonightStatus?.share, settings.ghostMode]);

  // Load an event's attendees + waitlist state when its detail opens.
  useEffect(() => {
    if (!activeEvent) { setActiveEventAttendees([]); setEventWaitlist({ count: 0, mine: false }); return; }
    let active = true;
    fetchEventAttendees(activeEvent)
      .then(a => { if (active) setActiveEventAttendees(a.map(x => ({ userId: x.user_id, handle: x.handle, avatar: x.avatar, isMutual: !!x.is_mutual }))); })
      .catch(() => {});
    fetchWaitlist(activeEvent, meId)
      .then(w => { if (active) setEventWaitlist(w); })
      .catch(() => { if (active) setEventWaitlist({ count: 0, mine: false }); });
    return () => { active = false; };
  }, [activeEvent, meId]);

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
    // Optimistic count bump + server-backed membership row (migration 0031).
    setCommunityCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + (wasMember ? -1 : 1)) }));
    (wasMember ? leaveCommunity(id) : joinCommunity(id)).catch(() => {});
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
    try {
      const saved = await createEvent(data, { id: meId, handle: meHandle, avatar: meAvatar });
      setEvents(prev => [saved, ...prev]);
      logActivity({ kind: 'event', glyph: '◈', label: 'summoned a rite', detail: data.name });
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

  const postStory = async (story) => {
    if (!meId) return;
    try {
      const saved = await dbPostStory(story, { id: meId, handle: meHandle, avatar: meAvatar });
      setStories(prev => [...prev, saved]);
    } catch { /* ignore */ }
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
    await dbUnblockUser(profileId);
    setBlockedIds(prev => { const n = new Set(prev); n.delete(profileId); return n; });
    fetchFeed(meId, { scope: feedScope }).then(setPosts).catch(() => {});
  };
  const reportTarget = async (kind, targetId, reason = '') => {
    if (!meId || !targetId) return;
    try { await reportContent(kind, targetId, reason); addNotification({ kind: 'follow', avatar: '⚑', text: 'reported — thank you' }); }
    catch { /* ignore */ }
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
    } else if ((n.kind === 'react' || n.kind === 'comment' || n.kind === 'mention') && n.postId) {
      setActivePostComments(n.postId);
    } else if (n.kind === 'event' || n.kind === 'rsvp') {
      setTab('events');
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
    ticketManagerEvent || showCreateEvent || showEditProfile || showMood || sharePostTarget || showSettings || showBlocked || showLegal || showDeleteConfirm || reportSheet || legalEscalation ||
    showMyTickets || showReflections || showDreams || showNowPlaying || showAddGrave || showAddAnniv ||
    showVespersArchive || showNewGroup || showTonightModal || quoteTarget || showOddityCompose ||
    activeOddity || activeText || activePostComments || followList || activeConversation || activeUserHandle ||
    showSearch || showCrewBrowse || activeEvent || showCompose || showNotifs || showDMs || activePortal ||
    showShockPicker
  );
  // Close the single top-most overlay (z-order priority). Returns true if it closed one.
  const closeTopOverlay = () => {
    if (showSigilDraw) { setShowSigilDraw(false); return true; }
    if (ticketSuccess) { setTicketSuccess(false); return true; }
    if (activeStoryIndex !== null) { setActiveStoryIndex(null); return true; }
    if (showStoryComposer) { setShowStoryComposer(false); return true; }
    if (venueEditorEvent) { setVenueEditorEvent(null); return true; }
    if (ticketManagerEvent) { setTicketManagerEvent(null); return true; }
    if (showCreateEvent) { setShowCreateEvent(false); return true; }
    if (showEditProfile) { setShowEditProfile(false); return true; }
    if (showMood) { setShowMood(false); return true; }
    if (sharePostTarget) { setSharePostTarget(null); return true; }
    if (showSettings) { setShowSettings(false); return true; }
    if (legalEscalation) { setLegalEscalation(null); return true; }
    if (reportSheet) { setReportSheet(null); return true; }
    if (showDeleteConfirm) { setShowDeleteConfirm(false); return true; }
    if (showLegal) { setShowLegal(false); return true; }
    if (showBlocked) { setShowBlocked(false); return true; }
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
    if (activeText) { setActiveText(null); return true; }
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
  const ACTIVE_SHOCK_IDS = SHOCK_MODES.map((m) => m.id).filter((id) => id !== 'none');
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
    return <ResetPasswordScreen />;
  }
  if (!session) {
    return <SignInScreen />;
  }
  if (!dbProfile) {
    return (
      <div className="phone-frame max-w-md mx-auto bg-black text-[#F5F1E8] relative overflow-hidden min-h-[100dvh]">
        <OnboardingFlow onComplete={handleOnboard} onSignOut={signOut} />
      </div>
    );
  }

  // Profile context for header
  const isInsideOverlay = activePortal || activeOddity || showOddityCompose || activeText;
  const onLibraryTap = () => {            // ✦ star → the portals menu
    if (activePortal) return;
    setActivePortal('menu');
  };
  const onLogoTap = () => {               // Coven wordmark → straight into The Library
    if (activePortal) return;
    setPortalFromMenu(false);             // opened directly → close returns to home
    setActivePortal('library');
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
        onReact={reactToPost}
        onOpenComments={(id) => setActivePostComments(id)}
        onOpenCommunity={setCommunity}
        onOpenUser={openUserProfile}
        onDeletePost={deletePost}
        onHidePost={hidePost}
        onQuotePost={(id) => setQuoteTarget(id)}
        onWhisperPost={(id) => setSharePostTarget(id)}
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
        onCreateStory={() => setShowStoryComposer(true)}
        stories={stories}
        meHandle={meHandle}
        meAvatar={meAvatar}
        tonightStatus={tonightStatus}
        onOpenTonightStatus={() => setShowTonightModal(true)}
        onOpenTarot={() => openPortalDirect('tarot')}
        onOpenEphemeris={() => openPortalDirect('ephemeris')}
        onOpenLibrary={(id) => { setPortalFromMenu(false); setActivePortal('library'); setActiveText(id); }}
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
      return (
        <MapScreen
          tonightStatus={tonightStatus}
          ghost={settings.ghostMode}
          pins={tonightPins.filter(p => p.userId !== meId && !blockedIds.has(p.userId))}
          nearby={nearby.filter(n => !blockedIds.has(n.userId))}
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
    if (tab === 'fits') return <FashionScreen shops={shops} meId={meId} onAddStore={addShop} onDeleteStore={removeShop} />;
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
    );
    return null;
  };

  // Living theme — a tint that follows the local hour (festTick re-renders us every 60s).
  const living = (settings.livingTheme !== false && !settings.parchmentMode) ? livingTheme() : null;
  const vigil = settings.vigilEnabled !== false && !settings.parchmentMode && isVigil();

  return (
    <div className={`phone-frame max-w-md mx-auto relative overflow-hidden h-[100dvh] text-[#F5F1E8] ${settings.shockMode === 'scream' ? 'shock-shake' : settings.shockMode === 'glitch' ? 'shock-jitter' : ''}`}
      style={{ background: settings.parchmentMode ? '#EDE0C2' : '#0A0A0A' }}>
      {/* Shock mode — BACK layer: bold occult motifs render BEHIND the app content so it stays readable */}
      {!settings.parchmentMode && !isInsideOverlay && <ShockOverlay mode={settings.shockMode} layer="back" />}
      {/* Living ambient glow — breathing ember/candle light for depth (behind mood washes) */}
      {settings.ambientGlow !== false && !isInsideOverlay && !settings.parchmentMode && <AmbientGlow />}
      {/* Always-on blood wash — drenches the whole frame in oxblood so the app reads RED, not grey */}
      {!settings.parchmentMode && (
        <div className="absolute inset-0 pointer-events-none z-10" aria-hidden style={{
          background: 'radial-gradient(ellipse at 50% 8%, rgba(139,0,0,0.30), transparent 55%), radial-gradient(ellipse at 50% 108%, rgba(91,15,26,0.42), transparent 60%)',
          mixBlendMode: 'soft-light',
        }} />
      )}
      {/* Vignette — heavy crimson-black falloff at the edges (brutalist frame) */}
      {settings.vignette && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: settings.parchmentMode
            ? 'radial-gradient(ellipse at center, transparent 60%, rgba(58, 34, 12, 0.25) 100%)'
            : 'radial-gradient(ellipse at center, transparent 48%, rgba(40,0,6,0.5) 82%, rgba(0,0,0,0.8) 100%)'
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

      {/* Living theme — time-of-day tint; deepest at the 3–4am witching hour */}
      {living && !isInsideOverlay && (
        <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-[3000ms]" style={{
          background: living.color,
          opacity: living.opacity,
          mixBlendMode: 'soft-light',
        }} />
      )}

      {/* Shock mode — FRONT layer: only translucent texture/chrome, on top (z-30, pointer-events-none) */}
      {!settings.parchmentMode && !isInsideOverlay && <ShockOverlay mode={settings.shockMode} layer="front" />}
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
          key={activeConversation}
          conversationId={activeConversation}
          conversation={conversations.find(c => c.id === activeConversation) || activeConvMeta}
          messages={messages[activeConversation] || []}
          initialDraft={dmPrefill}
          onSend={(body) => sendMessage(activeConversation, body)}
          onRetry={(messageId) => retryMessage(activeConversation, messageId)}
          onReact={(messageId, kind) => reactToMessage(activeConversation, messageId, kind)}
          onOpenPost={(id) => { setActiveConversation(null); setActiveConvMeta(null); setActivePostComments(id); }}
          onBack={() => { setActiveConversation(null); setActiveConvMeta(null); }}
        />
      )}
      {showCompose && (
        <ComposeOverlay
          meId={meId}
          initialCommunity={composeCommunity}
          onClose={() => { setShowCompose(false); setComposeCommunity(null); }}
          onPost={(data) => { addPost(data); setShowCompose(false); setComposeCommunity(null); }}
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
          mutedKeywords={mutedKeywords}
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
          onClose={() => setSharePostTarget(null)}
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
        />
        );
      })()}
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
        <VespersArchiveModal
          onClose={() => setShowVespersArchive(false)}
          onOpenLibrary={(id) => { setPortalFromMenu(false); setActivePortal('library'); setActiveText(id); setShowVespersArchive(false); }}
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
          posts={posts}
          events={events}
          onClose={() => setShowSearch(false)}
          onOpenPost={(id) => { setActivePostComments(id); setShowSearch(false); }}
          onOpenUser={(handle) => { setActiveUserHandle(handle); setShowSearch(false); }}
          onOpenCommunity={(id) => { setTab('communities'); setCommunity(id); setShowSearch(false); }}
          onOpenEvent={() => { setTab('events'); setShowSearch(false); }}
          onOpenCodex={() => { setPortalFromMenu(false); setActivePortal('codex'); setShowSearch(false); }}
          onOpenLibrary={(id) => { setPortalFromMenu(false); setActivePortal('library'); setActiveText(id); setShowSearch(false); }}
        />
      )}
      {showSettings && (
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
          onOpenBlocked={() => setShowBlocked(true)}
          onOpenLegal={() => setShowLegal(true)}
          onDeleteAccount={() => setShowDeleteConfirm(true)}
          onOpenShockPicker={() => { setShowSettings(false); setShowShockPicker(true); }}
        />
      )}
      {showShockPicker && (
        <ShockModePicker
          current={settings.shockMode}
          onPick={(id) => setSettings({ ...settings, shockMode: id })}
          onClose={() => setShowShockPicker(false)}
        />
      )}
      {showLegal && (
        <LegalScreen onBack={() => setShowLegal(false)} />
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
      <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
      {activePortal === 'menu' && (
        <CovenMenu
          onClose={() => setActivePortal(null)}
          onOpen={(id) => { setPortalFromMenu(true); setActivePortal(id); }}
        />
      )}
      {(activePortal === 'library' || activeText) && (
        <Suspense fallback={<div className="absolute inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          {activePortal === 'library' && !activeText && (
            <LibraryOverlay
              onClose={closePortal}
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
      {activePortal === 'oddities' && !activeOddity && !showOddityCompose && (
        <OdditiesOverlay
          onClose={closePortal}
          onOpenOddity={(id) => setActiveOddity(id)}
          onCompose={(kind) => { setComposeKind(kind || 'sale'); setShowOddityCompose(true); }}
          listings={listings}
          shops={shops}
          meId={meId}
          onAddShop={addShop}
          onDeleteShop={removeShop}
        />
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
      {followList && (
        <FollowListOverlay
          initialTab={followList.tab}
          myId={meId}
          onClose={() => setFollowList(null)}
          onOpenUser={(h) => { setFollowList(null); if (h && h !== meHandle) setActiveUserHandle(h); }}
        />
      )}
      {!seenWelcome && meId && dbProfile && profile && (
        <WelcomeOverlay
          handle={meHandle}
          onClose={() => setSeenWelcome(true)}
          onDropStatus={() => { setSeenWelcome(true); setShowTonightModal(true); }}
          onFindSouls={() => { setSeenWelcome(true); openPortalDirect('souls'); }}
          onSpeak={() => { setSeenWelcome(true); setShowCompose(true); }}
        />
      )}
      {showSigilDraw && (
        <Suspense fallback={<div className="absolute inset-0 z-[60] bg-[#050204] flex items-center justify-center text-[#C9A961] text-2xl animate-pulse-slow" style={F.brand}>Coven</div>}>
          <SigilDrawOverlay
            unlocked={loreUnlocked}
            onUnlock={() => { setLoreUnlocked(true); showToast('the dark answered — a hidden leaf opens'); }}
            onClose={() => setShowSigilDraw(false)}
          />
        </Suspense>
      )}
      {settings.familiar !== false && !anyOverlayOpen && <FloatingCat active />}
      {settings.shockMode !== 'none' && settings.reactiveTaps !== false && !anyOverlayOpen && !settings.parchmentMode && (
        <ShockSparks mode={settings.shockMode} />
      )}
      {settings.shockMode !== 'none' && settings.quickSwitch !== false && !anyOverlayOpen && !settings.parchmentMode && (
        <ShockQuickSwitch onNext={nextShock} onShuffle={shuffleShock} onPicker={() => setShowShockPicker(true)} />
      )}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
