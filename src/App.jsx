import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './auth/AuthProvider';
import { isSupabaseConfigured } from './lib/supabase';
import { SignInScreen } from './components/auth/SignInScreen';
import { fetchFeed, createPost, deletePost as dbDeletePost, togglePostReaction, fetchComments, createComment } from './lib/db/posts';
import { insertProfile, updateProfile, getSystemAccountIds, getProfileStats, getProfileByHandle } from './lib/db/profiles';
import { fetchFollowing, followUser, unfollowUser, followSystemAccounts } from './lib/db/social';
import { fetchConversations, getOrCreateDM, createGroup, fetchMessages as fetchDMMessages, sendDM, markRead as dmMarkRead, setBuried as dmSetBuried, subscribeDMs } from './lib/db/dm';
import { fetchActiveStories, postStory as dbPostStory, deleteStory } from './lib/db/stories';
import { fetchListings, createListing } from './lib/db/listings';
import { FONT_HREF, F } from './styles/fonts';
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
import { CreateEventModal } from './components/events/CreateEventModal';
import { TicketManager } from './components/events/TicketManager';
import { startCheckout } from './lib/db/tickets';
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
import { fetchEvents, createEvent, toggleEventRsvp as dbToggleRsvp, fetchEventAttendees } from './lib/db/events';
import { NOTIFICATIONS } from './data/notifications';
import { CommentsOverlay } from './components/feed/CommentsOverlay';
import { QuoteModal } from './components/feed/QuoteModal';
import { VespersArchiveModal } from './components/feed/VespersArchiveModal';
import { DEFAULT_PROFILE, GRAVES, ANNIVERSARIES, DEFAULT_TRACKERS, TRACKER_CATEGORIES } from './data/profile';

export default function App() {
  // === AUTH ===
  const { loading: authLoading, session, userId, dbProfile, signOut, refreshProfile } = useAuth();
  const meId = userId;
  const followIdByHandle = useRef({});

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

  const [profile, setProfile] = useState(null); // mapped from the Supabase profile row
  const [tonightStatus, setTonightStatus] = useLocalStorage('tonightStatus', { text: DEFAULT_PROFILE.status, setAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  const [trackers, setTrackers] = useLocalStorage('trackers', DEFAULT_TRACKERS);
  const [notifications, setNotifications] = useLocalStorage('notifications', NOTIFICATIONS);
  const [settings, setSettings] = useLocalStorage('settings', DEFAULT_SETTINGS);

  // Live content state (Supabase-backed)
  const [posts, setPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [followingPeople, setFollowingPeople] = useState([]);
  const activeConversationRef = useRef(null);
  const [communityMembership, setCommunityMembership] = useLocalStorage('communityMembership', { general: true, goth: true });
  const [eventRsvp, setEventRsvp] = useState({});
  const [events, setEvents] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [activeEventAttendees, setActiveEventAttendees] = useState([]);
  const [ticketManagerEvent, setTicketManagerEvent] = useState(null);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', {});
  const [graves, setGraves] = useLocalStorage('graves', GRAVES);
  const [sigils, setSigils] = useLocalStorage('sigils', []);
  const [following, setFollowing] = useState({}); // {handle: ts}, backed by follows table
  const [stories, setStories] = useState([]);
  const [listings, setListings] = useState([]);
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

  // Map the Supabase profile row -> the UI profile shape, then load real counts.
  useEffect(() => {
    if (!dbProfile) { setProfile(null); return; }
    setProfile({
      id: dbProfile.id,
      name: dbProfile.handle,
      avatar: dbProfile.avatar,
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
    fetchFeed(meId).then(rows => { if (active) setPosts(rows); }).catch(() => {});
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
    return () => { active = false; };
  }, [meId, dbProfile]);

  // Live DMs: keep the inbox + the open thread fresh as messages arrive.
  useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);
  useEffect(() => {
    if (!meId || !dbProfile) return;
    const unsub = subscribeDMs((row) => {
      fetchConversations().then(setConversations).catch(() => {});
      const openId = activeConversationRef.current;
      if (openId && row.conversation_id === openId) {
        fetchDMMessages(openId, meId).then(msgs => setMessages(prev => ({ ...prev, [openId]: msgs }))).catch(() => {});
        dmMarkRead(openId, meId).catch(() => {});
      }
    });
    return unsub;
  }, [meId, dbProfile]);

  // Returning from Stripe Checkout: confirm + refresh sold counts (webhook is async).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('ticket');
    if (!t) return;
    history.replaceState(null, '', window.location.pathname);
    if (t === 'success') {
      setTicketSuccess(true);
      if (meId) setTimeout(() => {
        fetchEvents(meId).then(({ events, rsvp }) => { setEvents(events); setEventRsvp(rsvp); }).catch(() => {});
      }, 2500);
    }
  }, [meId]);

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

  const addPost = async ({ body, community, anonymous, poll }) => {
    if (!meId) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId, kind: poll ? 'poll' : 'text',
      user: anonymous ? 'anonymous' : meHandle,
      avatar: anonymous ? '✟' : meAvatar,
      time: 'just now',
      community: community || 'general', body,
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
    logActivity({ kind: 'post', glyph: anonymous ? '✟' : '✦', label: anonymous ? 'confessed' : 'posted', detail: body.length > 60 ? body.slice(0, 60) + '…' : body, postId: tempId });
    try {
      const saved = await createPost({ body, community, anonymous, poll }, { id: meId, handle: meHandle, avatar: meAvatar });
      setPosts(prev => prev.map(p => (p.id === tempId ? saved : p)));
    } catch (e) {
      setPosts(prev => prev.filter(p => p.id !== tempId));
    }
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
    logActivity({ kind: 'comment', glyph: '✎', label: `commented on ${target?.user || 'a post'}`, detail: body.length > 60 ? body.slice(0, 60) + '…' : body, postId });
    createComment({ postId, body, parentId }, { id: meId, handle: meHandle, avatar: meAvatar })
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
      .catch(() => setMessages(prev => ({ ...prev, [conversationId]: (prev[conversationId] || []).filter(m => m.id !== tempId) })));
  };

  const openConversation = (id) => {
    setActiveConversation(id);
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
    if (meId) dmSetBuried(id, meId, next).catch(() => {});
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
    setEventRsvp(prev => {
      const next = { ...prev };
      if (wasGoing) delete next[id]; else next[id] = true;
      return next;
    });
    if (!wasGoing) {
      addNotification({ kind: 'event', avatar: '◈', text: `you said you're going` });
      logActivity({ kind: 'rsvp', glyph: '◈', label: 'rsvp’d to a rite', detail: id });
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
    logActivity({ kind: 'event', glyph: '◈', label: 'hosted a rite', detail: data.name });
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
    logActivity({ kind: 'repost', glyph: '↻', label: `reposted ${original.user}`, detail: commentary || original.body?.slice(0, 60) });
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
    openConversation(convId);
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
    if (!handle || handle === meHandle) return;
    const wasFollowing = !!following[handle];
    setFollowing(prev => {
      const next = { ...prev };
      if (wasFollowing) delete next[handle];
      else {
        next[handle] = Date.now();
        addNotification({ kind: 'follow', user: handle, avatar: '✦', text: `you followed ${handle}` });
        logActivity({ kind: 'follow', glyph: '✦', label: `followed ${handle}`, handle });
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
    try {
      const sys = await getSystemAccountIds();
      await followSystemAccounts(userId, sys);
    } catch { /* non-fatal */ }
    await refreshProfile();
  };

  const saveProfile = async (next) => {
    setProfile(next); // optimistic
    if (!meId) return;
    try {
      await updateProfile(meId, {
        handle: next.name,
        avatar: next.avatar,
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
    if (tab === 'map') return (
      <MapScreen
        events={events}
        rsvp={eventRsvp}
        onToggleRsvp={toggleEventRsvp}
        tonightStatus={tonightStatus}
        onOpenTonightStatus={() => setShowTonightModal(true)}
      />
    );
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
          people={followingPeople}
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
          onSave={saveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={activeStoryIndex}
          onReply={(authorHandle, body) => sendMessageToUser(authorHandle, body)}
          onDelete={removeStory}
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
        <TicketManager event={ticketManagerEvent} onClose={() => setTicketManagerEvent(null)} />
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
          onClose={() => setShowOddityCompose(false)}
          onCreate={(data) => addOddity(data)}
        />
      )}
    </div>
  );
}
