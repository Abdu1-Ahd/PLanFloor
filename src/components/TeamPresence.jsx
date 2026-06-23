import React from 'react';
import useLayoutStore from '../store/useLayoutStore';

const TeamPresence = () => {
  const { users } = useLayoutStore();

  return (
    <div className="team-presence">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="presence-avatar online"
          style={{ backgroundColor: user.color }}
          title="User Online"
        >
          {user.initial}
        </div>
      ))}
    </div>
  );
};

export default TeamPresence;
