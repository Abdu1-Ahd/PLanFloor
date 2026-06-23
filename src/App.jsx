import React from 'react';
import DrawingBoard from './components/DrawingBoard';
import Toolbar from './components/Toolbar';
import SyncIndicator from './components/SyncIndicator';
import ShapePropertiesForm from './components/ShapePropertiesForm';
import Lobby from './components/Lobby';
import TeamPresence from './components/TeamPresence';
import useLayoutStore from './store/useLayoutStore';

const App = () => {
  const { isLiveConnected, isSyncing, roomCode, storeName } = useLayoutStore();

  if (!isLiveConnected) {
    return <Lobby />;
  }

  return (
    <div className="app-container">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1>{storeName || 'LayoutLive'}</h1>
          <div className="room-info">
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Room Code</span>
            <span className="room-code">{roomCode}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamPresence />
          <SyncIndicator isLive={isLiveConnected} isSyncing={isSyncing} />
        </div>
      </div>
      <div className="main-content">
        <Toolbar />
        <DrawingBoard />
        <ShapePropertiesForm />
      </div>
    </div>
  );
};

export default App;
