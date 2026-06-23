import React, { useState, useEffect } from 'react';
import useLayoutStore from '../store/useLayoutStore';

const ShapePropertiesForm = () => {
  const { shapes, selectedId, updateShape, clearCanvas } = useLayoutStore();
  const selectedShape = shapes.find((s) => s.id === selectedId);

  // Local state for the inputs
  const [formData, setFormData] = useState({
    w: '',
    h: '',
    x: '',
    y: '',
  });

  // Sync local state when selected shape changes
  useEffect(() => {
    if (selectedShape) {
      setFormData({
        w: Math.round(selectedShape.width).toString(),
        h: Math.round(selectedShape.height).toString(),
        x: Math.round(selectedShape.x).toString(),
        y: Math.round(selectedShape.y).toString(),
      });
    }
  }, [selectedShape]);

  if (!selectedShape) return null;

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = () => {
    const w = parseInt(formData.w, 10);
    const h = parseInt(formData.h, 10);
    const x = parseInt(formData.x, 10);
    const y = parseInt(formData.y, 10);

    if (!isNaN(w) && !isNaN(h) && !isNaN(x) && !isNaN(y)) {
      updateShape(selectedId, { width: w, height: h, x, y });
    }
  };

  return (
    <div className="form-container" style={{ top: '20px', right: '20px' }}>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <p className="heading">Fixture Settings</p>
        
        <div className="box">
          <div className="input-group">
            <label className="input-label">W</label>
            <input 
              className="input" 
              type="text" 
              maxLength="3" 
              title="Width"
              value={formData.w}
              onChange={(e) => handleChange(e, 'w')}
            />
          </div>
          <div className="input-group">
            <label className="input-label">H</label>
            <input 
              className="input" 
              type="text" 
              maxLength="3" 
              title="Height"
              value={formData.h}
              onChange={(e) => handleChange(e, 'h')}
            /> 
          </div>
          <div className="input-group">
            <label className="input-label">X</label>
            <input 
              className="input" 
              type="text" 
              maxLength="3" 
              title="X Coordinate"
              value={formData.x}
              onChange={(e) => handleChange(e, 'x')}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Y</label>
            <input 
              className="input" 
              type="text" 
              maxLength="3" 
              title="Y Coordinate"
              value={formData.y}
              onChange={(e) => handleChange(e, 'y')}
            />
          </div>
        </div>
        
        <button type="button" className="btn1" onClick={handleSave}>Save Layout</button>
        <button type="button" className="btn2" onClick={clearCanvas}>Clear Canvas</button>
      </form>
    </div>
  );
};

export default ShapePropertiesForm;
