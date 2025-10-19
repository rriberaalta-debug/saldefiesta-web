import React from 'react';
import { UserStory } from '../types';

interface StoriesTrayProps {
  stories: UserStory[];
  onOpenStory: (userId: string) => void;
}

const StoriesTray: React.FC<StoriesTrayProps> = ({ stories = [], onOpenStory }) => {
  if (!stories || stories.length === 0) {
    return <div>No hay historias disponibles</div>;
  }

  return (
    <div style={{ display: 'flex', overflowX: 'auto', padding: '10px' }}>
      {stories.map((userStory, idx) => (
        <div key={userStory.userId} style={{ marginRight: '10px', cursor: 'pointer' }} onClick={() => onOpenStory(userStory.userId)}>
          <img
            src={userStory.stories[0]?.thumbnailUrl || 'https://via.placeholder.com/80'}
            alt="Historia"
            style={{ borderRadius: '50%', width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <div style={{ textAlign: 'center' }}>{userStory.userId}</div>
        </div>
      ))}
    </div>
  );
};

export default StoriesTray;
