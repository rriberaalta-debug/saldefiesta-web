import React, { useEffect, useState } from "react";
import { getPosts } from "../services/firestorePosts";

interface Post {
  id: string;
  text: string;
  imageUrl?: string;
  userEmail?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const data = await getPosts();
      setPosts(data);
    };
    loadPosts();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      {posts.length === 0 ? (
        <p className="text-center text-white">Aún no hay publicaciones 🕺</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl p-4 shadow-md text-gray-800"
          >
            <p className="font-semibold">{post.userEmail || "Usuario anónimo"}</p>
            <p className="mt-2">{post.text}</p>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Imagen de la publicación"
                className="mt-3 rounded-lg w-full"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              {post.createdAt
                ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                : ""}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
