import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Post, User, Comment as CommentType, UserStory } from './types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Feed from './components/Feed';
import { mockStories, cityCoordinates } from './constants';

type View = 'feed' | 'post' | 'profile';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Record<string, CommentType[]>>({});
  const [stories, setStories] = useState<UserStory[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Carga posts y usuarios desde Firebase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const usersSnapshot = await getDocs(collection(db, 'users'));

        const fetchedUsers: User[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(fetchedUsers);

        const fetchedPosts: Post[] = postsSnapshot.docs.map(doc => {
          const data = doc.data();
          const timestampString = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
          return {
            id: doc.id,
            userId: data.userId || 'u-default',
            title: data.title || 'Título desconocido',
            description: data.description || 'Sin descripción',
            city: data.city || 'Desconocida',
            mediaUrl: data.mediaUrl || 'https://via.placeholder.com/600x400',
            mediaType: data.mediaType || 'image',
            timestamp: timestampString,
            likes: data.likes || 0,
            liked: data.liked || false,
            commentCount: data.commentCount || 0,
          } as Post;
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts/users:", error);
      }
    };

    fetchPosts();

    // Load mock stories
    const storiesByUser = mockStories.reduce<Record<string, UserStory>>((acc, story) => {
      if (!acc[story.userId]) acc[story.userId] = { userId: story.userId, stories: [] };
      acc[story.userId].stories.push(story);
      acc[story.userId].stories.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return acc;
    }, {});
    setStories(Object.values(storiesByUser));
  }, []);

  // Ordenar posts (más recientes por defecto)
  const filteredPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [posts]);

  const handlePostSelect = (postId: string) => {};
  const handleUserSelect = (userId: string) => {};
  const loadMorePosts = () => {};

  return (
    <div ref={feedRef} className="min-h-screen bg-gray-50 p-4">
      <Feed
        posts={filteredPosts}
        users={users}
        onPostSelect={handlePostSelect}
        onUserSelect={handleUserSelect}
        onLike={() => {}}
        loadMorePosts={loadMorePosts}
        hasMore={false}
        isSearchActive={false}
      />
    </div>
  );
};

export default App;
