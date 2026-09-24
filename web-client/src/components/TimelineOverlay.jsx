import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const TimelineOverlay = ({ currentTime, duration, roomId }) => {
  const [annotations, setAnnotations] = useState([]);
  const [hoveredId, setHoveredId]     = useState(null);

  // Listen for remote annotations
  useEffect(() => {
    const handler = (data) => {
      setAnnotations(prev => {
        // Avoid duplicates
        if (prev.find(a => a.id === data.id)) return prev;
        return [...prev, data];
      });
    };
    socket.on('pin-annotation', handler);
    return () => socket.off('pin-annotation', handler);
  }, []);

  const addAnnotation = () => {
    const ann = {
      id: Date.now(),
      timestamp: currentTime,
      text: `Doubt at ${currentTime.toFixed(1)}s`,
    };
    setAnnotations(prev => [...prev, ann]);
    // Broadcast to peers
    socket.emit('pin-annotation', { roomId, ...ann });
  };

  const removeAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ position: 'absolute', bottom: 52, left: 0, width: '100%', padding: '0 12px', pointerEvents: 'none', zIndex: 10 }}>
      {/* Pin markers on timeline */}
      <div style={{ position: 'relative', width: '100%', height: 26 }}>
        {annotations.map(ann => {
          const leftPct = duration > 0 ? (ann.timestamp / duration) * 100 : 0;
          const isHovered = hoveredId === ann.id;
          return (
            <div
              key={ann.id}
              onMouseEnter={() => setHoveredId(ann.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => removeAnnotation(ann.id)}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                bottom: 0,
                fontSize: 18,
                pointerEvents: 'auto',
                cursor: 'pointer',
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
                transition: 'transform 0.15s',
                zIndex: isHovered ? 20 : 10,
                ...(isHovered ? { transform: 'translateX(-50%) scale(1.3)' } : {}),
              }}
            >
              📍
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '120%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(6px)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  border: '1px solid rgba(99,102,241,0.4)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {ann.text} · click to remove
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pin Button */}
      <div style={{ pointerEvents: 'auto', marginTop: 4, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={addAnnotation}
          style={{
            background: 'rgba(239,68,68,0.85)',
            color: 'white',
            border: '1px solid rgba(239,68,68,0.6)',
            padding: '4px 14px',
            borderRadius: 99,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.75rem',
            backdropFilter: 'blur(4px)',
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'all 0.15s',
          }}
        >
          📌 Pin Doubt Here ({annotations.length})
        </button>
      </div>
    </div>
  );
};

export default TimelineOverlay;
