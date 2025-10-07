
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Post, User, Comment as CommentType, FilterOptions, UserStory, SortBy, TopContributor, TrendingLocation, LegalContentType, GeolocationStatus } from './types';
import { mockPosts, mockUsers, mockComments, mockStories, cityCoordinates } from './constants';
import { legalTexts } from './legalTexts';
import Header from './components/Header';
import Feed from './components/Feed';
import PostDetail from './components/PostDetail';
import Profile from './components/Profile';
import UploadModal from './components/UploadModal';
import StoriesTray from './components/StoriesTray';
import StoryViewer from './components/StoryViewer';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import HeroSection from './components/HeroSection';
import FeedFilters from './components/FeedFilters';
import CallToActionUpload from './components/CallToActionUpload';
//import GamificationSidebar from './components/GamificationSidebar';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
//import GeolocationModal from './components/GeolocationModal';
//import FiestaFinder from './components/FiestaFinder';
//import { generateDescription, searchPostsWithAI } from './services/geminiService';
import { Plus } from 'lucide-react';
import { useDebounce } from './hooks/useDebounce';

type View = 'feed' | 'post' | 'profile';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users] = useState<User[]>(mockUsers);
  const [comments, setComments] = useState<Record<string, CommentType[]>>(mockComments);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isFiestaFinderOpen, setFiestaFinderOpen] = useState(false);

  // Block State
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  // Legal Modal State
  const [legalModalContent, setLegalModalContent] = useState<LegalContentType | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    mediaType: 'all',
  });
  
  // Story viewer state
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const [currentStoryUserIndex, setCurrentStoryUserIndex] = useState<number | null>(null);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());
  
  // Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>(null);
  
  const feedRef = useRef<HTMLDivElement>(null);


  // Simulate initial data fetch
  useEffect(() => {
    setPosts(mockPosts);
    
    // Process mock stories into a grouped format
    const storiesByUser = mockStories.reduce<Record<string, UserStory>>((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = { userId: story.userId, stories: [] };
      }
      acc[story.userId].stories.push(story);
      // Sort stories by timestamp
      acc[story.userId].stories.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return acc;
    }, {});
    setStories(Object.values(storiesByUser));

  }, []);

  // Effect for AI-powered search
  useEffect(() => {
    if (debouncedSearchQuery) {
      const performSearch = async () => {
        setIsSearching(true);
        try {
          // Pass full posts and users for context
          const results = await searchPostsWithAI(debouncedSearchQuery, posts, users);
          setSearchResults(results);
        } catch (error) {
          console.error("Error performing AI search:", error);
          setSearchResults([]); // Set to empty array on error
        } finally {
          setIsSearching(false);
        }
      };
      performSearch();
    } else {
      setSearchResults(null); // Clear search results when query is empty
    }
  }, [debouncedSearchQuery, posts, users]);


  const handleOpenStoryViewer = (userId: string) => {
    const visibleStories = stories.filter(s => !blockedUsers.has(s.userId));
    const userIndex = visibleStories.findIndex(s => s.userId === userId);
    if (userIndex !== -1) {
      setCurrentStoryUserIndex(userIndex);
      setStoryViewerOpen(true);
    }
  };

  const handleCloseStoryViewer = () => {
    setStoryViewerOpen(false);
    setCurrentStoryUserIndex(null);
  };

  const handleStorySeen = (storyId: string) => {
    setSeenStories(prev => new Set(prev).add(storyId));
  };


  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId);
    setView('post');
  };

  const handleUserSelect = (userId: string) => {
    if (!userId) return;
    setSelectedUserId(userId);
    setView('profile');
  };

  const handleCloseDetail = () => {
    setSelectedPostId(null);
    setSelectedUserId(null);
    setView('feed');
  };

  const handleLike = (postId: string) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: CommentType = {
      id: `c${Date.now()}`,
      postId,
      userId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
  };

  const handleUpload = async (formData: { title: string; description: string; city: string; file: File }) => {
    if (!currentUser) return;
    let finalDescription = formData.description;
    if (!finalDescription) {
      try {
        finalDescription = await generateDescription(formData.title, formData.city);
      } catch (error) {
        console.error("Failed to generate description:", error);
        finalDescription = "¡Un recuerdo maravilloso de la fiesta!"; // Fallback
      }
    }
    
    const newPost: Post = {
      id: `p${Date.now()}`,
      userId: currentUser.id,
      title: formData.title,
      description: finalDescription,
      city: formData.city,
      mediaUrl: URL.createObjectURL(formData.file),
      mediaType: formData.file.type.startsWith('video') ? 'video' : 'image',
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
      commentCount: 0,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setUploadModalOpen(false);
  };
  
  const loadMorePosts = useCallback(() => {
    // This logic might need adjustment if we paginate the full mockPosts list
    // For now, it's disabled as we load all posts initially
  }, []);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleScrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // --- Auth Handlers ---
  const handleLogin = () => {
    // Simulate login
    setCurrentUser(mockUsers[0]);
    setLoginModalOpen(false);
  };

  const handleSignUp = () => {
    // Simulate signup and login
    setCurrentUser(mockUsers[0]);
    setSignUpModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleCloseDetail(); // Go back to feed on logout
  };

  // --- Block Handlers ---
  const handleBlockUser = (userIdToBlock: string) => {
      if (!currentUser || userIdToBlock === currentUser.id) return;
      if (window.confirm('¿Seguro que quieres bloquear a este usuario? No verás su contenido.')) {
        setBlockedUsers(prev => new Set(prev).add(userIdToBlock));
      }
  };

  const handleUnblockUser = (userIdToUnblock: string) => {
    if (window.confirm('¿Seguro que quieres desbloquear a este usuario?')) {
      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userIdToUnblock);
        return newSet;
      });
    }
  };
  
  const handleLocationSelect = (city: string | null) => {
    setSelectedLocation(city);
  };
  
  const handleSortChange = (newSortBy: SortBy) => {
    if (newSortBy === 'nearby') {
      setGeolocationStatus('requesting');
    } else {
      setSortBy(newSortBy);
      setUserLocation(null); // Clear location when switching to other filters
    }
  };

  const handleAllowGeolocation = () => {
    setGeolocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setSortBy('nearby');
        setGeolocationStatus(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeolocationStatus('denied');
        } else {
          setGeolocationStatus('error');
        }
      }
    );
  };

  const handleManualLocationSearch = (city: string) => {
    const cityData = cityCoordinates[city];
    if (cityData) {
      setUserLocation(cityData);
      setSortBy('nearby');
      setGeolocationStatus(null);
    } else {
      alert("No se encontraron las coordenadas para esa ciudad. Intenta con otra.");
    }
  };


  // --- Legal Modal Handlers ---
  const handleOpenLegalModal = (type: LegalContentType) => {
    setLegalModalContent(type);
  };

  const handleCloseLegalModal = () => {
    setLegalModalContent(null);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.startDate || filters.endDate) count++;
    if (filters.mediaType !== 'all') count++;
    return count;
  }, [filters]);

  const filteredPosts = useMemo(() => {
    const baseFiltered = posts.filter(post => {
      // Block filter
      if (blockedUsers.has(post.userId)) return false;

      const user = users.find(u => u.id === post.userId);
      if (user && blockedUsers.has(user.id)) return false;

      // Location filter
      const matchesLocation = !selectedLocation || post.city === selectedLocation;
      
      // AI search filter
      const matchesSearch = searchResults === null || searchResults.includes(post.id);

      // Media type filter
      const matchesMediaType =
        filters.mediaType === 'all' || post.mediaType === filters.mediaType;

      // Date range filter
      const postDate = new Date(post.timestamp);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const matchesDate =
        (!startDate || postDate >= startDate) &&
        (!endDate || postDate <= endDate);
        
      return matchesLocation && matchesSearch && matchesMediaType && matchesDate;
    });

    if (sortBy === 'popular') {
      return [...baseFiltered].sort((a, b) => {
        const popularityA = a.likes + (comments[a.id]?.length || 0);
        const popularityB = b.likes + (comments[b.id]?.length || 0);
        return popularityB - popularityA;
      });
    }
    
    if (sortBy === 'nearby' && userLocation) {
      return [...baseFiltered].sort((a, b) => {
        const coordsA = cityCoordinates[a.city];
        const coordsB = cityCoordinates[b.city];
        if (!coordsA) return 1;
        if (!coordsB) return -1;
        
        const distanceA = getDistance(userLocation.lat, userLocation.lon, coordsA.lat, coordsA.lon);
        const distanceB = getDistance(userLocation.lat, userLocation.lon, coordsB.lat, coordsB.lon);
        return distanceA - distanceB;
      });
    }

    return [...baseFiltered].sort((a, b) => {
      const dateB = new Date(b.timestamp).getTime();
      const dateA = new Date(a.timestamp).getTime();
      return dateB - dateA;
    });

  }, [posts, users, searchResults, filters, blockedUsers, sortBy, selectedLocation, comments, userLocation]);
  
  const visibleStories = useMemo(() => stories.filter(s => !blockedUsers.has(s.userId)), [stories, blockedUsers]);
  
  // Gamification calculations
  const trendingLocations = useMemo<TrendingLocation[]>(() => {
    const cityCounts = posts.reduce<Record<string, number>>((acc, post) => {
      acc[post.city] = (acc[post.city] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city, postCount]) => ({ city, postCount }));
  }, [posts]);

  const topContributors = useMemo<TopContributor[]>(() => {
    // Replaced .flat() with .reduce() for better type inference and compatibility.
    const allComments = Object.values(comments).reduce<CommentType[]>((acc, val) => acc.concat(val), []);
    return users
      .map(user => {
        const postCount = posts.filter(p => p.userId === user.id).length;
        const commentCount = allComments.filter(c => c.userId === user.id).length;
        const score = (postCount * 2) + commentCount;
        return { user, score };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [posts, comments, users]);


  const selectedPost = posts.find(p => p.id === selectedPostId);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const isSearchActive = searchQuery.length > 0 || activeFilterCount > 0 || selectedLocation !== null;

  const paddingTopClass = 'pt-24 sm:pt-28';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue to-vibrant-purple text-white font-sans flex flex-col">
      <Header 
        currentUser={currentUser}
        onSearch={setSearchQuery}
        isSearching={isSearching}
        onProfileClick={() => handleUserSelect(currentUser!.id)} 
        onHomeClick={handleCloseDetail}
        onApplyFilters={handleApplyFilters}
        activeFilterCount={activeFilterCount}
        onLoginClick={() => setLoginModalOpen(true)}
        onSignUpClick={() => setSignUpModalOpen(true)}
        onLogoutClick={handleLogout}
        onFiestaFinderClick={() => setFiestaFinderOpen(true)}
      />
      <main className={`container mx-auto px-4 ${paddingTopClass} flex-grow`}>
        {view === 'feed' && (
          <>
            {!currentUser && (
                <>
                    <HeroSection onSignUpClick={() => setSignUpModalOpen(true)} onScrollToFeed={handleScrollToFeed} />
                    <CallToActionUpload onSignUpClick={() => setSignUpModalOpen(true)} />
                </>
            )}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                 {currentUser && (
                  <StoriesTray
                    storiesByUser={visibleStories}
                    users={users}
                    onStorySelect={handleOpenStoryViewer}
                    seenStories={seenStories}
                  />
                )}

                <div ref={feedRef} className="space-y-6">
                  <FeedFilters sortBy={sortBy} onSortChange={handleSortChange} />
                  <Feed 
                    posts={filteredPosts} 
                    users={users} 
                    onPostSelect={handlePostSelect} 
                    onUserSelect={handleUserSelect}
                    onLike={handleLike}
                    loadMorePosts={loadMorePosts}
                    hasMore={false}
                    isSearchActive={isSearchActive}
                  />
                </div>
              </div>
              
              <aside className="hidden lg:block lg:col-span-4">
                <GamificationSidebar 
                  topContributors={topContributors}
                  trendingLocations={trendingLocations}
                  onUserSelect={handleUserSelect}
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </aside>
            </div>
          </>
        )}
        {view === 'post' && selectedPost && (
          <PostDetail
            post={selectedPost}
            user={users.find(u => u.id === selectedPost.userId)!}
            comments={(comments[selectedPost.id] || []).filter(c => !blockedUsers.has(c.userId))}
            users={users}
            onClose={handleCloseDetail}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onUserSelect={handleUserSelect}
            currentUser={currentUser}
            onBlockUser={handleBlockUser}
          />
        )}
        {view === 'profile' && selectedUser && (
          <Profile 
            user={selectedUser} 
            posts={posts.filter(p => p.userId === selectedUser.id)} 
            onPostSelect={handlePostSelect}
            onBack={handleCloseDetail}
            currentUser={currentUser}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
          />
        )}
      </main>
      
      {isStoryViewerOpen && currentStoryUserIndex !== null && (
        <StoryViewer
            storiesByUser={visibleStories}
            users={users}
            initialUserIndex={currentStoryUserIndex}
            onClose={handleCloseStoryViewer}
            onStorySeen={handleStorySeen}
        />
      )}
      
      //{isFiestaFinderOpen && <FiestaFinder onClose={() => setFiestaFinderOpen(false)} />}
      
      //{geolocationStatus && (
        //<GeolocationModal 
          //status={geolocationStatus}
          //onClose={() => setGeolocationStatus(null)}
          //onAllow={handleAllowGeolocation}
          //onManualSearch={handleManualLocationSearch}
          //cities={Object.keys(cityCoordinates)}
        ///>
       //)}
  
  <>
      {isUploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} onUpload={handleUpload} />}
      {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} onLogin={handleLogin} onSwitchToSignUp={() => { setLoginModalOpen(false); setSignUpModalOpen(true); }} />}
      {isSignUpModalOpen && <SignUpModal onClose={() => setSignUpModalOpen(false)} onSignUp={handleSignUp} onSwitchToLogin={() => { setSignUpModalOpen(false); setLoginModalOpen(true); }} />}
      
      {legalModalContent && (
        <LegalModal 
            title={legalModalContent}
            content={legalTexts[legalModalContent]}
            onClose={handleCloseLegalModal}
       />
      )}

      {currentUser && (
        <button
          onClick={() => setUploadModalOpen(true)}
          className="fixed bottom-6 right-6 bg-festive-orange text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-transform transform hover:scale-110 z-30"
          aria-label="Subir nueva publicación"
        >
          <Plus size={28} />
        </button>
      )}
      
      
      <Footer onLegalLinkClick={handleOpenLegalModal} />
    </>
    </div>
    )
   }
export default App;
