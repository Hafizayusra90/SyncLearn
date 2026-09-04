import React, { useRef, useEffect, useState } from 'react';
import { socket } from './socket';

function WhiteboardCanvas({ roomId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const prevCoord = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    function handleDrawStroke({ prevX, prevY, currentX, currentY, color, lineWidth }) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    }

    function handleClearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    socket.on('draw-stroke', handleDrawStroke);
    socket.on('clear-canvas', handleClearCanvas);

    return () => {
      socket.off('draw-stroke', handleDrawStroke);
      socket.off('clear-canvas', handleClearCanvas);
    };
  }, []);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    prevCoord.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(prevCoord.current.x, prevCoord.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    socket.emit('draw-stroke', {
      roomId,
      prevX: prevCoord.current.x,
      prevY: prevCoord.current.y,
      currentX,
      currentY,
      color,
      lineWidth,
    });

    prevCoord.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas', { roomId });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        gap: '10px',
        background: '#1e293b',
        padding: '8px 12px',
        borderRadius: '8px'
      }}>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          title="Color Picker"
        />
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={lineWidth} 
          onChange={(e) => setLineWidth(e.target.value)} 
          title="Stroke Width"
        />
        <button 
          onClick={clearBoard}
          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ display: 'block', background: '#0f172a', width: '100%', height: '100%', cursor: 'crosshair' }}
      />
    </div>
  );
}

export default WhiteboardCanvas;