import React from 'react';
import { Box, Layers, Monitor } from 'lucide-react';
import useLayoutStore from '../store/useLayoutStore';
import { v4 as uuidv4 } from 'uuid';

const Toolbar = () => {
  const { addShape, triggerSync } = useLayoutStore();
  const assets = [
    { type: 'Shelf', width: 100, height: 50, icon: <Layers /> },
    { type: 'Display Case', width: 80, height: 80, icon: <Box /> },
    { type: 'Register', width: 60, height: 40, icon: <Monitor /> },
  ];

  const handleDragStart = (e, asset) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(asset));
  };

  const handleItemClick = (asset) => {
    // Add to center of the canvas roughly
    const newShape = {
      id: uuidv4(),
      x: (window.innerWidth - 250) / 2 - asset.width / 2,
      y: (window.innerHeight - 60) / 2 - asset.height / 2,
      width: asset.width,
      height: asset.height,
      label: asset.type,
      fill: '#FFFFFF',
    };
    addShape(newShape);
    triggerSync();
  };

  return (
    <div className="sidebar">
      <h2>Layout Assets</h2>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-10px' }}>
        Click or drag to add to the floor plan.
      </p>
      {assets.map((asset) => (
        <div
          key={asset.type}
          className="toolbar-item"
          draggable
          onDragStart={(e) => handleDragStart(e, asset)}
          onClick={() => handleItemClick(asset)}
        >
          <span style={{ marginRight: '8px', display: 'flex' }}>
            {asset.icon}
          </span>
          {asset.type}
        </div>
      ))}

      <div className="custom-asset-section">
        <h3 style={{ fontSize: '1rem', color: '#555', margin: '0 0 5px' }}>Custom Asset</h3>
        <input 
          type="text" 
          className="input" 
          style={{ width: '100%', height: '2.5em', margin: 0, padding: '0 10px', boxSizing: 'border-box' }}
          placeholder="Asset Name"
          id="customAssetName"
        />
        <button 
          className="btn1" 
          style={{ width: '100%', left: 0, margin: '10px 0 0', height: '2.5em' }}
          onClick={() => {
            const val = document.getElementById('customAssetName').value;
            if (val) {
              handleItemClick({ type: val, width: 80, height: 80 });
              document.getElementById('customAssetName').value = '';
            }
          }}
        >
          + Add Custom Asset
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
