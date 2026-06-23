import React from 'react';

const SyncIndicator = ({ isLive, isSyncing }) => {
  return (
    <div className="sync-status">
      <span className="sync-status-text">
        {isLive ? (isSyncing ? 'Syncing...' : 'Live Connected') : 'Disconnected'}
      </span>
      {isSyncing && (
        <div className="loader2">
          <div className="load21"></div>
          <div className="load22"></div>
          <div className="load23"></div>
          <div className="load24"></div>
          <div className="load25"></div>
        </div>
      )}
    </div>
  );
};

export default SyncIndicator;
