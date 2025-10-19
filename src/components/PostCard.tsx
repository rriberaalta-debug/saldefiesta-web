import React from 'react';
import { Post, User } from '../types';
import { Heart, MessageSquare } from 'lucide-react';

interface PostCardProps {
  post: Post;
  user: User;
  onPostSelect: (postId: string) => void;
  onUserSelect: (userId: string) => void;
  onLike: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, onPostSelect, onUserSelect, onLike }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagen del post */}
      <div
        className="w-full h-60 bg-gray-100 cursor-pointer"
        style={{ backgroundImage: `url(${post.mediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        onClick={() => onPostSelect(post.id)}
      />

      {/* Contenido */}
      <div className="p-4">
        {/* Usuario */}
        <div className="flex items-center mb-2 cursor-pointer" onClick={() => onUserSelect(user.id)}>
          <img src={user.profilePic || 'https://via.placeholder.com/40'} alt={user.username} className="w-10 h-10 rounded-full mr-3" />
          <span className="font-semibold">{user.username}</span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold mb-1 cursor-pointer" onClick={() => onPostSelect(post.id)}>
          {post.title}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-3">{post.description}</p>

        {/* Info adicional: likes y comentarios */}
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center space-x-4">
            <button onClick={() => onLike(post.id)} className="flex items-center space-x-1 hover:text-red-500">
              <Heart size={16} className={post.liked ? 'text-red-500' : ''} />
              <span>{post.likes}</span>
            </button>

            <div className="flex items-center space-x-1">
              <MessageSquare size={16} />
              <span>{post.commentCount}</span>
            </div>
          </div>
          <span className="text-gray-400 text-xs">{post.city}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
