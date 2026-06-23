import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import useLayoutStore from '../store/useLayoutStore';

const Shape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Group
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale to 1 and change width/height instead
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      >
        <Rect
          width={shapeProps.width}
          height={shapeProps.height}
          fill={shapeProps.fill || '#FFFFFF'}
          stroke={isSelected ? '#27374D' : '#526D82'}
          strokeWidth={isSelected ? 4 : 2}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={10}
          shadowOffsetX={4}
          shadowOffsetY={4}
          cornerRadius={5}
        />
        <Text
          text={shapeProps.label}
          width={shapeProps.width}
          height={shapeProps.height}
          align="center"
          verticalAlign="middle"
          fontFamily="Inter"
          fontSize={14}
          fill="#333"
          fontStyle="bold"
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          borderStroke="#27374D"
          anchorStroke="#526D82"
          anchorFill="#FFFFFF"
          anchorSize={10}
          rotationSnaps={[0, 90, 180, 270]}
        />
      )}
    </React.Fragment>
  );
};

const DrawingBoard = () => {
  const containerRef = useRef(null);
  const { shapes, selectedId, addShape, updateShape, selectShape, triggerSync } = useLayoutStore();

  const handleDrop = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const stage = containerRef.current.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    const assetData = e.dataTransfer.getData('text/plain');
    if (!assetData) return;
    
    const asset = JSON.parse(assetData);

    const newShape = {
      id: uuidv4(),
      x: pointerPosition.x - asset.width / 2,
      y: pointerPosition.y - asset.height / 2,
      width: asset.width,
      height: asset.height,
      rotation: 0,
      label: asset.type,
      fill: '#FFFFFF',
    };

    addShape(newShape);
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <div 
      className="canvas-area"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        width={window.innerWidth - 250}
        height={window.innerHeight - 60}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        ref={containerRef}
      >
        <Layer>
          {shapes.map((shape) => {
            return (
              <Shape
                key={shape.id}
                shapeProps={shape}
                isSelected={shape.id === selectedId}
                onSelect={() => selectShape(shape.id)}
                onChange={(newAttrs) => {
                  updateShape(shape.id, newAttrs);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingBoard;
