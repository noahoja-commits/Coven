import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FONT_HREF } from './styles/fonts';
import { Header } from './components/shared/Header';
import { BottomNav } from './components/shared/BottomNav';
import { DMsOverlay } from './components/shared/DMsOverlay';
import { ChatThread } from './components/shared/ChatThread';
import { ComposeOverlay } from './components/shared/ComposeOverlay';
import { NotificationsPanel } from './components/shared/NotificationsPanel';
import { GrainOverlay } from './components/shared/Visuals';

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
import { CrewDetail } from './components/profile/CrewDetail';
import { CrewBrowse } from './components/profile/CrewBrowse';
import { AddGraveModal } from './components/profile/AddGraveModal';
import { AddAnniversaryModal } from './components/profile/AddAnniversaryModal';
import { EventDetail } from './components/events/EventDetail';
import { NowPlayingModal } from './components/profile/NowPlayingModal';
import { NewGroupDMModal } from './components/shared/NewGroupDMModal';
import { ReflectionsModal } from './components/profile/ReflectionsModal';

import { CovenMenu } from './components/coven/CovenMenu';
import { LibraryOverlay } from './components/library/LibraryOverlay';
import { ReaderView } from './components/library/ReaderView';
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
import { POSTS, CONVERSATIONS, MESSAGES } from './data/posts';
import { EVENTS } from './data/events';
import { NOTIFICATIONS } from './data/notifications';
import { CommentsOverlay } from './components/feed/CommentsOverlay';
import { QuoteModal } from './components/feed/QuoteModal';
import { VespersArchiveModal } from './components/feed/VespersArchiveModal';
import { DEFAULT_PROFILE, GRAVES, ANNIVERSARIES, DEFAULT_TRACKERS, TRACKER_CATEGORIES } from './data/profile';

export default function App() {
  // === STATE ===
  const [tab, setTab] = useState('home');
  const [community, setCommunity] = useState(null);
  const [showDMs, setShowDMs] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTonightModal, setShowTonightModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [activeUserHandle, setActiveUserHandle] = useState(null);
  const [showStoryComposer, setShowStoryComposer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCrew, setActiveCrew] = useState(null);
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

  const [onboarded, setOnboarded] = useLocalStorage('onboarded', true);
  const [profile, setProfile] = useLocalStorage('profile', DEFAULT_PROFILE);
  const [tonightStatus, setTonightStatus] = useLocalStorage('tonightStatus', { text: DEFAULT_PROFILE.status, setAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  const [trackers, setTrackers] = useLocalStorage('trackers', DEFAULT_TRACKERS);
  const [notifications, setNotifications] = useLocalStorage('notifications', NOTIFICATIONS);
  const [settings, setSettings] = useLocalStorage('settings', DEFAULT_SETTINGS);

  // Live content state
  const [posts, setPosts] = useLocalStorage('posts', POSTS.map(p => ({
    ...p,
    myReactions: {},
    baseCommentCount: typeof p.comments === 'number' ? p.comments : 0,
    comments: [],
  })));
  const [conversations, setConversations] = useLocalStorage('conversations', CONVERSATIONS);
  const [messages, setMessages] = useLocalStorage('messages', MESSAGES);
  const [communityMembership, setCommunityMembership] = useLocalStorage('communityMembership', { general: true, goth: true });
  const [eventRsvp, setEventRsvp] = useLocalStorage('eventRsvp', {});
  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', {});
  const [graves, setGraves] = useLocalStorage('graves', GRAVES);
  const [sigils, setSigils] = useLocalStorage('sigils', []);
  const [following, setFollowing] = useLocalStorage('following', {});
  const [myStories, setMyStories] = useLocalStorage('myStories', []);
  const [userOddities, setUserOddities] = useLocalStorage('userOddities', []);
  const [crewMessages, setCrewMessages] = useLocalStorage('crewMessages', {});
  const [muted, setMuted] = useLocalStorage('muted', {});
  const [crewRequests, setCrewRequests] = useLocalStorage('crewRequests', {});
  const [anniversaries, setAnniversaries] = useLocalStorage('anniversaries', ANNIVERSARIES);
  const [cardHistory, setCardHistory] = useLocalStorage('cardHistory', {});
  const [marginalia, setMarginalia] = useLocalStorage('marginalia', {});
  const [postCandles, setPostCandles] = useLocalStorage('postCandles', {});
  const [nowPlaying, setNowPlaying] = useLocalStorage('nowPlaying', null);
  const [activityLog, setActivityLog] = useLocalStorage('activityLog', []);
  const [reflections, setReflections] = useLocalStorage('reflections', []);
  const [mutedKeywords, setMutedKeywords] = useLocalStorage('mutedKeywords', []);
  const [hiddenPosts, setHiddenPosts] = useLocalStorage('hiddenPosts', {});
  const [ritual, setRitual] = useLocalStorage('ritual', { streak: 0, lastDay: null });
  const [crystals, setCrystals] = useLocalStorage('crystals', []);
  const [pinnedPostId, setPinnedPostId] = useLocalStorage('pinnedPostId', null);
  const [shrineTheme, setShrineTheme] = useLocalStorage('shrineTheme', 'oxblood');
  const [feedSort, setFeedSort] = useLocalStorage('feedSort', 'latest');
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

  // Lock body scroll when a modal overlay is open
  useEffect(() => {
    const anyModal = showEditProfile || showTonightModal || showSettings || showNotifs
      || showCompose || showStoryComposer || showSearch || showVespersArchive
      || showAddGrave || showAddAnniv || showNewGroup || showReflections || showCrewBrowse
      || showNowPlaying || quoteTarget || activeStoryIndex !== null;
    document.body.style.overflow = anyModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showEditProfile, showTonightModal, showSettings, showNotifs, showCompose, showStoryComposer, showSearch, showVespersArchive, showAddGrave, showAddAnniv, showNewGroup, showReflections, showCrewBrowse, showNowPlaying, quoteTarget, activeStoryIndex]);

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
  const addNotification = (n) => setNotifications(prev => [{ id: `n${Date.now()}`, read: false, time: 'just now', ...n }, ...prev]);
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadDMs = conversations.reduce((s, c) => s + (c.buried ? 0 : (c.unread || 0)), 0);

  // === CONTENT HANDLERS ===
  const meHandle = profile?.name || 'you';
  const meAvatar = profile?.avatar || '✟';

  const addPost = ({ body, community, anonymous, poll }) => {
    const id = `p${Date.now()}`;
    const newPost = {
      id, kind: poll ? 'poll' : 'text',
      user: anonymous ? 'anonymous' : meHandle,
      avatar: anonymous ? '✟' : meAvatar,
      time: 'just now',
      community: community || 'general', body,
      reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 }, comments: [], myReactions: {},
      mine: true, anonymous: !!anonymous,
    };
    if (poll) {
      newPost.poll = {
        options: poll.map((label, i) => ({ id: `po${i}`, label, votes: 0 })),
        myVote: null,
      };
    }
    setPosts(prev => [newPost, ...prev]);
    logActivity({ kind: 'post', glyph: anonymous ? '✟' : '✦', label: anonymous ? 'confessed' : 'posted', detail: body.length > 60 ? body.slice(0, 60) + '…' : body, postId: id });
  };

  const voteOnPoll = (postId, optionId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll) return p;
      const wasOption = p.poll.myVote;
      if (wasOption === optionId) {
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
  };

  const reactToPost = (postId, kind) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const wasMine = !!(p.myReactions && p.myReactions[kind]);
      return {
        ...p,
        reactions: { ...p.reactions, [kind]: Math.max(0, (p.reactions?.[kind] || 0) + (wasMine ? -1 : 1)) },
        myReactions: { ...(p.myReactions || {}), [kind]: !wasMine },
      };
    }));
  };

  const addComment = (postId, body, parentId = null) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newComment = { id: `cm${Date.now()}`, user: meHandle, avatar: meAvatar, body, time: 'just now', mine: true, parentId, reactions: { heart: 0, skull: 0 }, myReactions: {} };
      return { ...p, comments: [...(p.comments || []), newComment] };
    }));
    const target = posts.find(p => p.id === postId);
    logActivity({ kind: 'comment', glyph: '✎', label: `commented on ${target?.user || 'a post'}`, detail: body.length > 60 ? body.slice(0, 60) + '…' : body, postId });
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
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const msg = { id: `m${Date.now()}`, from: 'me', body, time };
    setMessages(prev => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), msg] }));
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, last: body.length > 60 ? body.slice(0, 60) + '…' : body, time: 'just now', unread: 0 } : c
    ));
  };

  const openConversation = (id) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setActiveConversation(id);
  };

  const buryConversation = (id) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, buried: !c.buried } : c));
    if (activeConversation === id) setActiveConversation(null);
  };

  const toggleCommunityMembership = (id) => {
    const wasMember = !!communityMembership[id];
    setCommunityMembership(prev => ({ ...prev, [id]: !wasMember }));
    if (!wasMember) {
      const c = COMMUNITIES.find(x => x.id === id);
      addNotification({ kind: 'crew', avatar: c?.glyph || '✦', text: `you joined ${c?.name || id}` });
      logActivity({ kind: 'join', glyph: c?.glyph || '✦', label: `joined ${c?.name || id}` });
    }
  };

  const toggleEventRsvp = (id) => {
    const wasGoing = !!eventRsvp[id];
    setEventRsvp(prev => ({ ...prev, [id]: !wasGoing }));
    if (!wasGoing) {
      addNotification({ kind: 'event', avatar: '◈', text: `you said you're going` });
      logActivity({ kind: 'rsvp', glyph: '◈', label: 'rsvp’d to a rite', detail: id });
    }
  };

  const deletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const repostPost = (originalId, commentary = '') => {
    const original = posts.find(p => p.id === originalId);
    if (!original) return;
    const id = `p${Date.now()}`;
    setPosts(prev => [{
      id, kind: 'repost', user: meHandle, avatar: meAvatar, time: 'just now',
      community: original.community, body: commentary,
      reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 }, comments: [], myReactions: {},
      mine: true,
      quoted: { id: original.id, user: original.user, avatar: original.avatar, body: original.body, kind: original.kind, community: original.community },
    }, ...prev]);
    logActivity({ kind: 'repost', glyph: '↻', label: `reposted ${original.user}`, detail: commentary || original.body?.slice(0, 60) });
  };

  const toggleBookmark = (postId) => {
    setBookmarks(prev => {
      const next = { ...prev };
      if (next[postId]) delete next[postId];
      else next[postId] = Date.now();
      return next;
    });
  };

  const ensureConversationWith = (handle, avatar) => {
    let conv = conversations.find(c => c.user === handle && !c.group);
    if (!conv) {
      const id = `c${Date.now()}`;
      conv = { id, user: handle, avatar: avatar || '✦', last: '', time: 'now', unread: 0 };
      setConversations(prev => [conv, ...prev]);
      setMessages(prev => ({ ...prev, [id]: [] }));
    }
    return conv.id;
  };

  const openDMWithUser = (handle, avatar) => {
    const id = ensureConversationWith(handle, avatar);
    setShowDMs(false);
    setActiveConversation(id);
  };

  const sendMessageToUser = (handle, body) => {
    const id = ensureConversationWith(handle);
    sendMessage(id, body);
  };

  const createGroupConversation = ({ name, members }) => {
    const id = `c${Date.now()}`;
    const conv = {
      id, user: name, avatar: '✦', last: '',
      time: 'now', unread: 0, group: true, members,
    };
    setConversations(prev => [conv, ...prev]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    setShowDMs(false);
    setActiveConversation(id);
  };

  const lightCandle = (graveId) => {
    setGraves(prev => prev.map(g => g.id === graveId
      ? { ...g, candleLitAt: Date.now(), flowers: (g.flowers || 0) + 1, addedFlowers: [meHandle, ...(g.addedFlowers || [])] }
      : g
    ));
    addNotification({ kind: 'candle', avatar: '🕯', text: `you lit a candle` });
  };

  const saveSigil = (sigil) => {
    setSigils(prev => [{ id: `s${Date.now()}`, ...sigil, sealedAt: Date.now() }, ...prev]);
    logActivity({ kind: 'sigil', glyph: '⛧', label: 'sealed a sigil', detail: sigil.intention });
  };

  const openUserProfile = (handle) => {
    if (!handle || handle === meHandle) return;
    setActiveUserHandle(handle);
  };

  const toggleFollow = (handle) => {
    setFollowing(prev => {
      const next = { ...prev };
      if (next[handle]) delete next[handle];
      else {
        next[handle] = Date.now();
        addNotification({ kind: 'follow', user: handle, avatar: '✦', text: `you followed ${handle}` });
        logActivity({ kind: 'follow', glyph: '✦', label: `followed ${handle}`, handle });
      }
      return next;
    });
  };

  const postStory = (story) => {
    const entry = { id: `st${Date.now()}`, ...story, postedAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 24 };
    setMyStories(prev => [entry, ...prev.filter(s => s.expiresAt > Date.now())]);
  };

  const addOddity = (oddity) => {
    const entry = { id: `o${Date.now()}`, ...oddity, seller: meHandle, sellerAvatar: meAvatar, postedAt: Date.now() };
    setUserOddities(prev => [entry, ...prev]);
  };

  const sendCrewMessage = (crewId, body) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCrewMessages(prev => ({
      ...prev,
      [crewId]: [...(prev[crewId] || []), { id: `cm${Date.now()}`, from: 'me', body, time }],
    }));
  };

  const toggleMute = (handle) => {
    setMuted(prev => {
      const next = { ...prev };
      if (next[handle]) delete next[handle];
      else next[handle] = Date.now();
      return next;
    });
  };

  const requestJoinCrew = (crewId) => {
    setCrewRequests(prev => ({ ...prev, [crewId]: Date.now() }));
    addNotification({ kind: 'crew', avatar: '✦', text: `you requested to join` });
  };

  const addGrave = (grave) => {
    setGraves(prev => [{ id: `g${Date.now()}`, flowers: 0, addedFlowers: [], visibility: 'friends', ...grave }, ...prev]);
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
    return true;
  });

  const hidePost = (postId) => setHiddenPosts(prev => ({ ...prev, [postId]: Date.now() }));

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
    logActivity({ kind: 'ritual', glyph: '☩', label: `marked the ritual · day ${newStreak}` });
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
    setReflections(prev => [{ id: `rf${Date.now()}`, body, at: Date.now() }, ...prev]);
  };
  const removeReflection = (id) => {
    setReflections(prev => prev.filter(r => r.id !== id));
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
    if (n.kind === 'dm' || n.kind === 'crew') {
      const conv = conversations.find(c => c.user === n.user);
      if (conv) { setShowNotifs(false); setActiveConversation(conv.id); }
    } else if (n.kind === 'event') {
      setShowNotifs(false); setTab('events');
    } else if (n.kind === 'reaction' || n.kind === 'reply') {
      // Best-effort: drop on home
      setShowNotifs(false); setTab('home');
    }
  };

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
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        postCandles={postCandles}
        onToggleCandle={togglePostCandle}
        onOpenEvent={(ref) => {
          if (typeof ref === 'string') return setActiveEvent(ref);
          if (ref?.id) return setActiveEvent(ref.id);
          if (ref?.name) {
            const found = EVENTS.find(e => e.name.toLowerCase() === ref.name.toLowerCase());
            if (found) setActiveEvent(found.id);
          }
        }}
        onVotePoll={voteOnPoll}
        onOpenStory={(i) => setActiveStoryIndex(i)}
        onCreateStory={() => setShowStoryComposer(true)}
        myStories={myStories}
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
    if (tab === 'map') return (
      <MapScreen
        rsvp={eventRsvp}
        onToggleRsvp={toggleEventRsvp}
        tonightStatus={tonightStatus}
        onOpenTonightStatus={() => setShowTonightModal(true)}
      />
    );
    if (tab === 'events') return (
      <EventsScreen rsvp={eventRsvp} onToggleRsvp={toggleEventRsvp} onOpenEvent={(id) => setActiveEvent(id)} />
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
        onOpenCrew={(id) => setActiveCrew(id)}
        onBrowseCrews={() => setShowCrewBrowse(true)}
        onAddGrave={() => setShowAddGrave(true)}
        onAddAnniversary={() => setShowAddAnniv(true)}
        onOpenNowPlaying={() => setShowNowPlaying(true)}
        nowPlaying={nowPlaying}
        activityLog={activityLog}
        reflectionsCount={reflections.length}
        onOpenReflections={() => setShowReflections(true)}
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
          onSearch={() => setShowSearch(true)}
          communityName={community ? COMMUNITIES.find(c => c.id === community)?.name : null}
          unreadNotifications={unreadNotifs}
          unreadDMs={unreadDMs}
          parchment={settings.parchmentMode}
        />
        <div className="animate-screen-in" key={`${tab}-${community || ''}`}>
          {renderTab()}
        </div>
      </div>

      <BottomNav tab={tab} onChange={(t) => { setTab(t); setCommunity(null); }} parchment={settings.parchmentMode} />

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
          following={following}
          onCreate={createGroupConversation}
          onClose={() => setShowNewGroup(false)}
        />
      )}
      {activeConversation && (
        <ChatThread
          conversationId={activeConversation}
          conversation={conversations.find(c => c.id === activeConversation)}
          messages={messages[activeConversation] || []}
          onSend={(body) => sendMessage(activeConversation, body)}
          onBack={() => setActiveConversation(null)}
        />
      )}
      {showCompose && (
        <ComposeOverlay
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
          onClearAll={() => setNotifications([])}
        />
      )}
      {showTonightModal && (
        <TonightStatusModal
          current={tonightStatus}
          onSave={setTonightStatus}
          onClose={() => setShowTonightModal(false)}
        />
      )}
      {showEditProfile && (
        <ProfileEditModal
          profile={profile}
          onSave={setProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {activeStoryIndex !== null && (
        <StoryViewer
          startIndex={activeStoryIndex}
          myStories={myStories}
          meHandle={meHandle}
          meAvatar={meAvatar}
          onReply={(authorHandle, body) => sendMessageToUser(authorHandle, body)}
          onHighlight={highlightStory}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
      {showStoryComposer && (
        <StoryComposer
          onClose={() => setShowStoryComposer(false)}
          onPost={(story) => { postStory(story); setShowStoryComposer(false); }}
        />
      )}
      {activeCrew && (
        <CrewDetail
          crewId={activeCrew}
          messages={crewMessages[activeCrew] || []}
          onSend={(body) => sendCrewMessage(activeCrew, body)}
          onBack={() => setActiveCrew(null)}
        />
      )}
      {showCrewBrowse && (
        <CrewBrowse
          requests={crewRequests}
          onRequest={requestJoinCrew}
          onOpen={(id) => { setActiveCrew(id); setShowCrewBrowse(false); }}
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
          eventId={activeEvent}
          isGoing={!!eventRsvp[activeEvent]}
          onToggleRsvp={toggleEventRsvp}
          onOpenUser={(h) => { setActiveEvent(null); setActiveUserHandle(h); }}
          onBack={() => setActiveEvent(null)}
        />
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
          onLogout={() => { setOnboarded(false); setShowSettings(false); }}
          onRerunOnboarding={() => { setOnboarded(false); setShowSettings(false); }}
          mutedKeywords={mutedKeywords}
          onSetMutedKeywords={setMutedKeywords}
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
          userOddities={userOddities}
        />
      )}
      {activeOddity && (
        <OddityDetail id={activeOddity} onBack={() => setActiveOddity(null)} />
      )}
      {showOddityCompose && (
        <OddityCompose
          onClose={() => setShowOddityCompose(false)}
          onCreate={(data) => addOddity(data)}
        />
      )}
    </div>
  );
}
