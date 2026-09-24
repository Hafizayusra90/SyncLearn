import React, { useRef, useEffect, useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { socket } from './socket';
import './WhiteboardCanvas.css';

// Tool types
const TOOLS = {
  PEN: 'pen',
  ERASER: 'eraser',
  LINE: 'line',
  RECT: 'rect',
  LASER: 'laser'
};

const COLORS = ['#6366f1', '#a78bfa', '#38bdf8', '#4ade80', '#f59e0b', '#f87171', '#ffffff', '#000000'];

function WhiteboardCanvas({ roomId, user }) {
  const canvasRef     = useRef(null);
  const isDrawingRef  = useRef(false);
  const prevCoord     = useRef({ x: 0, y: 0 });
  const snapshotRef   = useRef(null); // for shape preview

  // Undo / Redo stacks
  const undoStackRef  = useRef([]);
  const redoStackRef  = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [tool, setTool]           = useState(TOOLS.PEN);
  const [color, setColor]         = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);

  // Dual Mode (Typing Pad + Whiteboard Canvas)
  const [isDualMode, setIsDualMode] = useState(true);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isTypingToolsOpen, setIsTypingToolsOpen] = useState(false);
  const [isBulletMenuOpen, setIsBulletMenuOpen] = useState(false);
  const [typedNotes, setTypedNotes] = useState("Welcome students to today's live session!");
  const [typingFontSize, setTypingFontSize] = useState(20);
  const [typingTextColor, setTypingTextColor] = useState('#ffffff');
  const [isTypingSyncing, setIsTypingSyncing] = useState(false);

  const handleTeacherNoteChange = (newText) => {
    setTypedNotes(newText);
    socket.emit('whiteboard-typing-sync', {
      roomId,
      notes: newText,
      fontSize: typingFontSize,
      textColor: typingTextColor
    });
  };

  const handleInsertBullet = (bulletChar) => {
    const nextVal = typedNotes.trim() ? typedNotes + `\n${bulletChar} ` : `${bulletChar} `;
    setTypedNotes(nextVal);
    setIsBulletMenuOpen(false);
    socket.emit('whiteboard-typing-sync', {
      roomId,
      notes: nextVal,
      fontSize: typingFontSize,
      textColor: typingTextColor
    });
  };

  const handleFontSizeChange = (size) => {
    setTypingFontSize(size);
    socket.emit('whiteboard-typing-sync', {
      roomId,
      notes: typedNotes,
      fontSize: size,
      textColor: typingTextColor
    });
  };

  const handleTextColorChange = (c) => {
    setTypingTextColor(c);
    socket.emit('whiteboard-typing-sync', {
      roomId,
      notes: typedNotes,
      fontSize: typingFontSize,
      textColor: c
    });
  };

  const handleClearNotes = () => {
    setTypedNotes('');
    socket.emit('whiteboard-typing-sync', {
      roomId,
      notes: '',
      fontSize: typingFontSize,
      textColor: typingTextColor
    });
  };

  // Laser Pointer State
  const [localLaser, setLocalLaser]   = useState({ active: false, x: 0, y: 0 });
  const [remoteLaser, setRemoteLaser] = useState({ active: false, x: 0, y: 0, senderName: '' });
  const remoteLaserTimeoutRef         = useRef(null);

  // Toast inside Whiteboard
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef(null);

  const isInstructor = user?.role === 'instructor';

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 2600);
  };

  const getCtx = () => canvasRef.current?.getContext('2d');

  // Push current canvas state to undo stack
  const pushUndoState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL();
      undoStackRef.current.push(dataUrl);
      if (undoStackRef.current.length > 30) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
    } catch (err) {
      console.warn('Failed to push undo state:', err);
    }
  }, []);

  // Restore snapshot onto canvas
  const restoreSnapshot = useCallback((snapshotUrl, broadcast = false) => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !snapshotUrl) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = snapshotUrl;

    if (broadcast) {
      socket.emit('whiteboard-restore-snapshot', { roomId, snapshot: snapshotUrl });
    }
  }, [roomId]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current state to redo
    const current = canvas.toDataURL();
    redoStackRef.current.push(current);

    const prevSnapshot = undoStackRef.current.pop();
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);

    restoreSnapshot(prevSnapshot, true);
    showToast('↩️ Undo');
  }, [restoreSnapshot]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const current = canvas.toDataURL();
    undoStackRef.current.push(current);

    const nextSnapshot = redoStackRef.current.pop();
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);

    restoreSnapshot(nextSnapshot, true);
    showToast('↪️ Redo');
  }, [restoreSnapshot]);

  // Stamp Keyboard Notes onto the Whiteboard Canvas & Broadcast to all students
  const handleStampNotesToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !typedNotes.trim()) return;

    pushUndoState();

    const startX = 40;
    const startY = 70;
    const lines = typedNotes.split('\n');
    const lineHeight = typingFontSize * 1.5;

    ctx.save();
    ctx.font = `${typingFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    // Calculate bounding box
    let maxW = 0;
    lines.forEach(l => {
      const metrics = ctx.measureText(l);
      if (metrics.width > maxW) maxW = metrics.width;
    });

    const pad = 20;
    const cardW = Math.min(Math.max(maxW + pad * 2, 320), canvas.width - startX - 20);
    const cardH = lines.length * lineHeight + pad * 2;

    // Draw lecture card backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
    ctx.lineWidth = 2;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(startX, startY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(startX, startY, cardW, cardH);
      ctx.strokeRect(startX, startY, cardW, cardH);
    }

    // Top decorative bar
    ctx.fillStyle = '#6366f1';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(startX, startY, cardW, 6, [12, 12, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(startX, startY, cardW, 6);
    }

    // Draw each line with syntax styling
    lines.forEach((line, i) => {
      const lineY = startY + pad + 10 + i * lineHeight;
      if (line.startsWith('#')) {
        ctx.fillStyle = '#38bdf8'; // Cyan title
        ctx.font = `bold ${typingFontSize + 4}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(line.replace(/^#+\s*/, ''), startX + pad, lineY);
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        ctx.fillStyle = '#c7d2fe'; // Soft indigo bullet
        ctx.font = `${typingFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(line, startX + pad, lineY);
      } else if (line.toLowerCase().startsWith('formula:') || line.toLowerCase().startsWith('def:') || line.toLowerCase().startsWith('note:')) {
        ctx.fillStyle = '#4ade80'; // Emerald formula
        ctx.font = `600 ${typingFontSize}px "Courier New", Courier, monospace`;
        ctx.fillText(line, startX + pad, lineY);
      } else {
        ctx.fillStyle = typingTextColor;
        ctx.font = `${typingFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(line, startX + pad, lineY);
      }
    });

    ctx.restore();

    // Broadcast canvas update to all students
    const snapshotUrl = canvas.toDataURL();
    socket.emit('whiteboard-restore-snapshot', { roomId, snapshot: snapshotUrl });
    showToast('📌 Notes stamped onto Whiteboard for students!');
  }, [typedNotes, typingFontSize, typingTextColor, roomId, pushUndoState]);

  // Resize handler using ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const parent = canvas.parentElement;
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dataURL = canvas.toDataURL();
      canvas.width  = rect.width;
      canvas.height = rect.height;

      const img = new Image();
      img.onload = () => getCtx()?.drawImage(img, 0, 0);
      img.src = dataURL;
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas.parentElement);

    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Socket listeners
  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;

    const handleDrawStroke = (data) => {
      const c = canvasRef.current;
      if (!c || !ctx) return;

      const prevX = data.normPrevX != null ? data.normPrevX * c.width : data.prevX;
      const prevY = data.normPrevY != null ? data.normPrevY * c.height : data.prevY;
      const x = data.normX != null ? data.normX * c.width : data.x;
      const y = data.normY != null ? data.normY * c.height : data.y;

      ctx.strokeStyle = data.color || '#6366f1';
      ctx.lineWidth   = data.lineWidth || 3;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.globalCompositeOperation = data.tool === TOOLS.ERASER ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    };

    const handleDrawShape = (data) => {
      if (!data.snapshot) return;
      const img = new Image();
      img.onload = () => {
        const c = canvasRef.current;
        const cx = c?.getContext('2d');
        if (!cx || !c) return;
        cx.clearRect(0, 0, c.width, c.height);
        cx.drawImage(img, 0, 0);
        cx.strokeStyle = data.color;
        cx.lineWidth   = data.lineWidth;
        cx.lineCap     = 'round';
        if (data.tool === TOOLS.LINE) {
          cx.beginPath(); cx.moveTo(data.startX, data.startY); cx.lineTo(data.endX, data.endY); cx.stroke();
        } else if (data.tool === TOOLS.RECT) {
          cx.strokeRect(data.startX, data.startY, data.endX - data.startX, data.endY - data.startY);
        }
      };
      img.src = data.snapshot;
    };

    const handleClear = () => {
      const c = canvasRef.current;
      getCtx()?.clearRect(0, 0, c.width, c.height);
    };

    const handleRestoreRemote = (data) => {
      if (data?.snapshot) {
        restoreSnapshot(data.snapshot, false);
      }
      if (data?.notes !== undefined) {
        setTypedNotes(data.notes);
        if (data.fontSize) setTypingFontSize(data.fontSize);
        if (data.textColor) setTypingTextColor(data.textColor);
      }
    };

    const handleTypingSync = (data) => {
      if (data?.notes !== undefined) {
        setTypedNotes(data.notes);
        if (data.fontSize) setTypingFontSize(data.fontSize);
        if (data.textColor) setTypingTextColor(data.textColor);
      }
    };

    const handleRemoteLaser = (data) => {
      if (data?.active) {
        setRemoteLaser(data);
        if (remoteLaserTimeoutRef.current) clearTimeout(remoteLaserTimeoutRef.current);
        remoteLaserTimeoutRef.current = setTimeout(() => {
          setRemoteLaser(prev => ({ ...prev, active: false }));
        }, 3000);
      } else {
        setRemoteLaser(prev => ({ ...prev, active: false }));
      }
    };

    const handleSendCanvasState = (data) => {
      if (isInstructor && canvasRef.current) {
        try {
          const snapshot = canvasRef.current.toDataURL();
          socket.emit('canvas-state-response', {
            targetSocketId: data?.targetSocketId,
            snapshot,
            notes: typedNotes,
            fontSize: typingFontSize,
            textColor: typingTextColor
          });
        } catch (e) {
          console.warn('Failed to send canvas state snapshot:', e);
        }
      }
    };

    socket.on('draw-stroke',  handleDrawStroke);
    socket.on('draw-shape',   handleDrawShape);
    socket.on('clear-canvas', handleClear);
    socket.on('whiteboard-restore-snapshot', handleRestoreRemote);
    socket.on('whiteboard-laser', handleRemoteLaser);
    socket.on('whiteboard-typing-sync', handleTypingSync);
    socket.on('send-canvas-state', handleSendCanvasState);

    // If student, request current canvas state from instructor with retries
    let t1, t2;
    if (!isInstructor && roomId) {
      socket.emit('request-canvas-state', { roomId });
      t1 = setTimeout(() => socket.emit('request-canvas-state', { roomId }), 600);
      t2 = setTimeout(() => socket.emit('request-canvas-state', { roomId }), 1800);
    }

    const handleReconnect = () => {
      if (!isInstructor && roomId) {
        socket.emit('request-canvas-state', { roomId });
      }
    };
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('draw-stroke',  handleDrawStroke);
      socket.off('draw-shape',   handleDrawShape);
      socket.off('clear-canvas', handleClear);
      socket.off('whiteboard-restore-snapshot', handleRestoreRemote);
      socket.off('whiteboard-laser', handleRemoteLaser);
      socket.off('whiteboard-typing-sync', handleTypingSync);
      socket.off('send-canvas-state', handleSendCanvasState);
      socket.off('connect', handleReconnect);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (remoteLaserTimeoutRef.current) clearTimeout(remoteLaserTimeoutRef.current);
    };
  }, [restoreSnapshot, isInstructor, roomId]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    // Only instructor can write on whiteboard
    if (!isInstructor) return;

    const { x, y } = getPos(e);

    if (tool === TOOLS.LASER) {
      setLocalLaser({ active: true, x, y });
      socket.emit('whiteboard-laser', {
        roomId,
        active: true,
        x, y,
        senderName: user?.name || (isInstructor ? 'Instructor' : 'Presenter')
      });
      return;
    }

    // Save snapshot to undo stack before new stroke begins
    pushUndoState();

    prevCoord.current = { x, y };
    isDrawingRef.current = true;

    // Snapshot for shape preview
    if (tool === TOOLS.LINE || tool === TOOLS.RECT) {
      snapshotRef.current = canvasRef.current.toDataURL();
    }
    const ctx = getCtx();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    const { x, y } = getPos(e);

    // Laser pointer movement (doesn't require mouse down)
    if (tool === TOOLS.LASER) {
      setLocalLaser({ active: true, x, y });
      socket.emit('whiteboard-laser', {
        roomId,
        active: true,
        x, y,
        senderName: user?.name || (isInstructor ? 'Instructor' : 'Presenter')
      });
      return;
    }

    if (!isDrawingRef.current) return;
    const ctx = getCtx();
    const canvas = canvasRef.current;

    if (tool === TOOLS.PEN || tool === TOOLS.ERASER) {
      ctx.globalCompositeOperation = tool === TOOLS.ERASER ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth   = tool === TOOLS.ERASER ? lineWidth * 4 : lineWidth;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      ctx.moveTo(prevCoord.current.x, prevCoord.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      socket.emit('draw-stroke', {
        roomId,
        prevX: prevCoord.current.x, prevY: prevCoord.current.y,
        x, y,
        normPrevX: canvas && canvas.width ? prevCoord.current.x / canvas.width : undefined,
        normPrevY: canvas && canvas.height ? prevCoord.current.y / canvas.height : undefined,
        normX: canvas && canvas.width ? x / canvas.width : undefined,
        normY: canvas && canvas.height ? y / canvas.height : undefined,
        color,
        lineWidth: tool === TOOLS.ERASER ? lineWidth * 4 : Number(lineWidth),
        tool,
      });
      prevCoord.current = { x, y };

    } else if (tool === TOOLS.LINE || tool === TOOLS.RECT) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth   = Number(lineWidth);
        ctx.lineCap     = 'round';
        if (tool === TOOLS.LINE) {
          ctx.beginPath(); ctx.moveTo(prevCoord.current.x, prevCoord.current.y); ctx.lineTo(x, y); ctx.stroke();
        } else {
          ctx.strokeRect(prevCoord.current.x, prevCoord.current.y, x - prevCoord.current.x, y - prevCoord.current.y);
        }
      };
      img.src = snapshotRef.current;
    }
  };

  const stopDrawing = (e) => {
    if (tool === TOOLS.LASER) {
      return; // Laser stays tracked on hover
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tool === TOOLS.LINE || tool === TOOLS.RECT) {
      const { x, y } = getPos(e);
      socket.emit('draw-shape', {
        roomId, tool, color,
        lineWidth: Number(lineWidth),
        startX: prevCoord.current.x, startY: prevCoord.current.y,
        endX: x, endY: y,
        snapshot: snapshotRef.current,
      });
      snapshotRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (tool === TOOLS.LASER) {
      setLocalLaser(prev => ({ ...prev, active: false }));
      socket.emit('whiteboard-laser', { roomId, active: false });
    } else {
      isDrawingRef.current = false;
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pushUndoState();
    getCtx()?.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas', { roomId });
    showToast('🗑️ Canvas cleared');
  };

  // ─── Export Handlers ───
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create offscreen canvas with solid dark background
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const oCtx = offscreen.getContext('2d');

    // Draw background
    oCtx.fillStyle = '#0a0f1e';
    oCtx.fillRect(0, 0, offscreen.width, offscreen.height);

    // Draw whiteboard drawing
    oCtx.drawImage(canvas, 0, 0);

    // SyncLearn watermark & timestamp
    oCtx.font = 'bold 13px system-ui, sans-serif';
    oCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    oCtx.fillText(`SyncLearn Whiteboard • Room: ${roomId || 'Live'} • ${new Date().toLocaleDateString()}`, 16, offscreen.height - 16);

    const link = document.createElement('a');
    link.download = `synclearn-whiteboard-${roomId || 'session'}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
    showToast('📸 Downloaded as PNG!');
  };

  const handleExportPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const oCtx = offscreen.getContext('2d');

      oCtx.fillStyle = '#0a0f1e';
      oCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      oCtx.drawImage(canvas, 0, 0);

      oCtx.font = 'bold 13px system-ui, sans-serif';
      oCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      oCtx.fillText(`SyncLearn Whiteboard • Room: ${roomId || 'Live'} • ${new Date().toLocaleString()}`, 16, offscreen.height - 16);

      const imgData = offscreen.toDataURL('image/png');
      const isLandscape = canvas.width >= canvas.height;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`synclearn-whiteboard-${roomId || 'session'}.pdf`);
      showToast('📄 Downloaded as PDF!');
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('⚠️ PDF export error');
    }
  };

  // Export Typed Notes Directly to PDF Document
  const handleExportNotesPDF = () => {
    if (!typedNotes || !typedNotes.trim()) {
      showToast('⚠️ No notes to export');
      return;
    }
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const maxLineWidth = pageWidth - (margin * 2);

      // Top banner
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, 28, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('SyncLearn - Teacher Lecture Notes', margin, 13);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text(`Room: ${roomId || 'Live Room'}   |   Date: ${new Date().toLocaleString()}`, margin, 21);

      // Body Notes
      let yPos = 38;
      const lineHeight = 6.5;

      const paragraphs = typedNotes.split('\n');

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const para = paragraphs[pIdx];
        if (!para.trim()) {
          yPos += 4;
          continue;
        }

        const isHeading = para.startsWith('#') || para.startsWith('Topic:') || para.startsWith('Chapter:');
        const isBullet = para.startsWith('•') || para.startsWith('◆') || para.startsWith('➜') || para.startsWith('✔') || para.startsWith('★') || /^\d+\./.test(para);

        if (isHeading) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          pdf.setTextColor(99, 102, 241); // indigo
        } else if (isBullet) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(30, 41, 59);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(30, 41, 59);
        }

        const wrappedLines = pdf.splitTextToSize(para, maxLineWidth);
        for (let l = 0; l < wrappedLines.length; l++) {
          if (yPos + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin + 5;
          }
          pdf.text(wrappedLines[l], margin, yPos);
          yPos += lineHeight;
        }
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${i} of ${totalPages}  •  SyncLearn Classroom Notes`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }

      pdf.save(`Lecture_Notes_${roomId || 'SyncLearn'}_${Date.now()}.pdf`);
      showToast('📄 Notes saved as PDF!');
    } catch (err) {
      console.error('Notes PDF export failed:', err);
      showToast('⚠️ Notes PDF error');
    }
  };

  return (
    <div className="whiteboard-wrapper">
      {/* ─── Main Workspace: Dual Split (Typing Pad on Left, Canvas on Right) ─── */}
      <div className={`wb-split-workspace ${isDualMode ? 'dual-active' : ''}`}>
        {/* Left Pane: Keyboard Typing Studio */}
        {isDualMode && (
          <aside className="wb-typing-panel">
            {isInstructor ? (
              <>
                <div className="wb-typing-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>⌨️</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                        Lecture Typing Pad
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Type notes with keyboard & send to canvas
                      </span>
                    </div>
                  </div>

                  {/* Save / Export Notes as PDF Button */}
                  <button
                    type="button"
                    className="wb-export-notes-btn"
                    onClick={handleExportNotesPDF}
                    title="Save typed lecture notes directly as PDF document"
                  >
                    <span>📥 Export PDF</span>
                  </button>
                </div>

                {/* Collapsible Formatting Tools Heading / Button */}
                <button
                  type="button"
                  className={`wb-typing-tools-btn ${isTypingToolsOpen ? 'open' : ''}`}
                  onClick={() => setIsTypingToolsOpen(prev => !prev)}
                  title="Click to show/hide text formatting and presets"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.95rem' }}>🛠️</span>
                    <span className="typing-tools-label">Tools</span>
                  </div>
                  <span className="typing-tools-arrow">{isTypingToolsOpen ? '▲' : '▼'}</span>
                </button>

                {/* When Clicked, Show All Presets and Controls */}
                {isTypingToolsOpen && (
                  <div className="wb-typing-tools-drawer">
                    {/* Quick Format Presets */}
                    <div className="wb-typing-presets">
                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => handleTeacherNoteChange(typedNotes ? typedNotes + '\n# Topic: ' : '# Topic: ')}
                        title="Insert Topic Heading"
                      >
                        🏷️ Heading
                      </button>

                      {/* Bullets Dropdown Menu */}
                      <div className="preset-dropdown-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          type="button"
                          className={`preset-chip ${isBulletMenuOpen ? 'active' : ''}`}
                          onClick={() => setIsBulletMenuOpen(!isBulletMenuOpen)}
                          title="Choose from different bullet styles"
                        >
                          • Bullets ▾
                        </button>
                        {isBulletMenuOpen && (
                          <div className="bullet-dropdown-menu" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: 4,
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            zIndex: 50,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                            minWidth: '130px'
                          }}>
                            {[
                              { icon: '•', label: '• Circle Bullet' },
                              { icon: '◆', label: '◆ Diamond' },
                              { icon: '➜', label: '➜ Arrow' },
                              { icon: '✔', label: '✔ Checkmark' },
                              { icon: '★', label: '★ Star' },
                              { icon: '1.', label: '1. Numbered' }
                            ].map(b => (
                              <button
                                key={b.icon}
                                type="button"
                                onClick={() => handleInsertBullet(b.icon)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#cbd5e1',
                                  padding: '5px 8px',
                                  textAlign: 'left',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  borderRadius: '4px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="preset-chip"
                        onClick={() => handleTeacherNoteChange(typedNotes ? typedNotes + '\nNote: ' : 'Note: ')}
                        title="Insert Important Note"
                      >
                        💡 Note
                      </button>
                    </div>

                    {/* Typing Controls Row */}
                    <div className="wb-typing-controls">
                      <div className="control-group">
                        <label>Text Size:</label>
                        <select
                          value={typingFontSize}
                          onChange={e => handleFontSizeChange(Number(e.target.value))}
                          className="typing-select"
                        >
                          <option value={16}>Small (16px)</option>
                          <option value={20}>Medium (20px)</option>
                          <option value={26}>Large (26px)</option>
                          <option value={32}>X-Large (32px)</option>
                        </select>
                      </div>

                      <div className="control-group">
                        <label>Color:</label>
                        <input
                          type="color"
                          value={typingTextColor}
                          onChange={e => handleTextColorChange(e.target.value)}
                          className="typing-color-picker"
                          title="Pick Text Color"
                        />
                      </div>

                      <button
                        type="button"
                        className="typing-clear-btn"
                        onClick={handleClearNotes}
                        title="Clear Typed Text"
                      >
                        ✕ Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Multi-line Keyboard Typing Input */}
                <textarea
                  className="wb-typing-textarea"
                  value={typedNotes}
                  onChange={e => handleTeacherNoteChange(e.target.value)}
                  placeholder="Teacher can write lecture notes, code, or formulas here using keyboard..."
                  rows={8}
                />

                {/* Action Bar */}
                <div className="wb-typing-footer">
                  <button
                    type="button"
                    className="btn-stamp-board"
                    onClick={handleStampNotesToCanvas}
                    disabled={!typedNotes.trim()}
                    title="Render this typed note cleanly onto the whiteboard canvas for all students"
                  >
                    <span>📌 Send / Stamp to Whiteboard</span>
                  </button>
                  <span className="wb-typing-hint">
                    💡 Tip: Click "Send / Stamp" to render formatted notes directly on the board.
                  </span>
                </div>
              </>
            ) : (
              /* Student Read-Only View of Teacher's Notes */
              <div className="wb-student-notes-wrap">
                <div className="wb-typing-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>👨‍🏫</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                        Teacher's Lecture Notes
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                        Live Synced with Teacher
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="wb-export-notes-btn"
                    onClick={handleExportNotesPDF}
                    title="Save teacher's lecture notes directly as PDF document"
                  >
                    <span>📥 Export PDF</span>
                  </button>
                </div>

                <div className="wb-student-notes-card">
                  <pre className="wb-student-notes-body" style={{
                    fontSize: `${typingFontSize}px`,
                    color: typingTextColor,
                    margin: 0
                  }}>
                    {typedNotes || "Teacher has not typed notes yet. As the teacher types, notes will appear here live."}
                  </pre>
                </div>

                <div className="wb-student-notes-footer">
                  <span>👀 Read-only lecture notes viewer synced live</span>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Right Pane: Interactive Whiteboard Canvas with Scoped Floating Toolbar */}
        <div className="wb-canvas-viewport">
          {/* ─── Top Floating Bars (Scoped ONLY inside Canvas Viewport) ─── */}
          <div className="wb-top-container">
            <div className="wb-top-left-group">
              {/* Whiteboard Title Badge */}
              <div className="wb-brand-title">
                <span className="wb-brand-icon">🎨</span>
                <span className="wb-brand-text">Whiteboard</span>
              </div>

              {isInstructor ? (
                <div className="wb-tools-dropdown-container">
                  {/* Clean "Tools ∨" Button Matching Reference Image */}
                  <button
                    type="button"
                    className={`wb-tools-trigger-btn ${isToolsMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsToolsMenuOpen(prev => !prev)}
                    title="Whiteboard Tools"
                  >
                    <span className="wb-tools-text">Tools</span>
                    <span className="wb-tools-chevron">∨</span>
                  </button>

                {/* Floating Dropdown Card Containing All Whiteboard Controls */}
                {isToolsMenuOpen && (
                  <div className="wb-tools-dropdown-panel">
                    <div className="wb-panel-header">
                      <span>🎨 Whiteboard Tools</span>
                      <button
                        type="button"
                        className="wb-panel-close-btn"
                        onClick={() => setIsToolsMenuOpen(false)}
                      >
                        ✕
                      </button>
                    </div>

                    {/* 1. Drawing Tools */}
                    <div className="wb-panel-section">
                      <div className="wb-section-title">Draw Tools</div>
                      <div className="wb-tools-grid">
                        <button
                          type="button"
                          className={`wb-panel-btn ${tool === TOOLS.PEN ? 'active' : ''}`}
                          onClick={() => setTool(TOOLS.PEN)}
                        >
                          ✏️ Pen
                        </button>
                        <button
                          type="button"
                          className={`wb-panel-btn ${tool === TOOLS.ERASER ? 'active' : ''}`}
                          onClick={() => setTool(TOOLS.ERASER)}
                        >
                          🧹 Erase
                        </button>
                        <button
                          type="button"
                          className={`wb-panel-btn ${tool === TOOLS.LINE ? 'active' : ''}`}
                          onClick={() => setTool(TOOLS.LINE)}
                        >
                          📏 Line
                        </button>
                        <button
                          type="button"
                          className={`wb-panel-btn ${tool === TOOLS.RECT ? 'active' : ''}`}
                          onClick={() => setTool(TOOLS.RECT)}
                        >
                          ⬜ Rect
                        </button>
                        <button
                          type="button"
                          className={`wb-panel-btn ${tool === TOOLS.LASER ? 'laser-active' : ''}`}
                          onClick={() => setTool(t => t === TOOLS.LASER ? TOOLS.PEN : TOOLS.LASER)}
                        >
                          🔴 Laser
                        </button>
                      </div>
                    </div>

                    {/* 2. Color Palette & Thickness */}
                    <div className="wb-panel-section">
                      <div className="wb-section-title">Colors & Stroke</div>
                      <div className="wb-colors-row">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`wb-color-circle ${color === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => {
                              if (tool === TOOLS.ERASER || tool === TOOLS.LASER) setTool(TOOLS.PEN);
                              setColor(c);
                            }}
                            title={c}
                          />
                        ))}
                        <input
                          type="color"
                          value={color}
                          onChange={e => {
                            if (tool === TOOLS.ERASER || tool === TOOLS.LASER) setTool(TOOLS.PEN);
                            setColor(e.target.value);
                          }}
                          className="wb-color-picker-input"
                          title="Custom Color"
                        />
                      </div>

                      {/* Stroke Width Slider */}
                      <div className="wb-slider-row">
                        <span className="wb-slider-label">Width: <strong>{lineWidth}px</strong></span>
                        <input
                          type="range"
                          min="1"
                          max="16"
                          value={lineWidth}
                          onChange={e => setLineWidth(Number(e.target.value))}
                          className="wb-width-slider"
                        />
                      </div>
                    </div>

                    {/* 3. History & Canvas Actions */}
                    <div className="wb-panel-section">
                      <div className="wb-section-title">Actions & View</div>
                      <div className="wb-actions-grid">
                        <button
                          type="button"
                          className="wb-panel-btn"
                          onClick={handleUndo}
                          disabled={!canUndo}
                          title="Undo (Ctrl+Z)"
                        >
                          ↩️ Undo
                        </button>
                        <button
                          type="button"
                          className="wb-panel-btn"
                          onClick={handleRedo}
                          disabled={!canRedo}
                          title="Redo (Ctrl+Y)"
                        >
                          ↪️ Redo
                        </button>
                        <button
                          type="button"
                          className="wb-panel-btn wb-btn-danger"
                          onClick={clearBoard}
                          title="Clear Canvas"
                        >
                          🗑️ Clear
                        </button>
                        <button
                          type="button"
                          className={`wb-panel-btn ${isDualMode ? 'active' : ''}`}
                          onClick={() => setIsDualMode(prev => !prev)}
                          title="Toggle Dual View (Typing Pad + Canvas)"
                        >
                          ⌨️ {isDualMode ? 'Dual View' : 'Full Canvas'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="wb-student-sync-pill">
                <span className="wb-pulse-dot"></span>
                <span>Teacher Synced (Live)</span>
              </div>
            )}
            </div>

            {/* Right Action Bar (Download) */}
            <div className="wb-actions-bar">
              <button
                type="button"
                className="wb-btn btn-export"
                onClick={handleExportPNG}
                title="Download Whiteboard as PNG Image"
              >
                📸 PNG
              </button>
              <button
                type="button"
                className="wb-btn btn-export"
                onClick={handleExportPDF}
                title="Download Whiteboard as PDF Document"
              >
                📄 PDF
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={handleMouseLeave}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              display: 'block',
              background: '#0a0f1e',
              width: '100%',
              height: '100%',
              cursor: !isInstructor ? 'default' : tool === TOOLS.ERASER ? 'cell' : tool === TOOLS.LASER ? 'none' : 'crosshair',
              touchAction: 'none',
            }}
          />

      {/* ─── Local Laser Pointer Indicator ─── */}
      {tool === TOOLS.LASER && localLaser.active && (
        <div
          style={{
            position: 'absolute',
            left: localLaser.x,
            top: localLaser.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div className="laser-pointer-dot" />
          <span className="laser-pointer-label">
            🔴 {user?.name || (isInstructor ? 'Instructor' : 'You')}
          </span>
        </div>
      )}

      {/* ─── Remote Laser Pointer Indicator ─── */}
      {remoteLaser.active && (
        <div
          style={{
            position: 'absolute',
            left: remoteLaser.x,
            top: remoteLaser.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left 0.05s ease-out, top 0.05s ease-out',
          }}
        >
          <div className="laser-pointer-dot" />
          <span className="laser-pointer-label">
            🔴 {remoteLaser.senderName || 'Instructor'}
          </span>
        </div>
      )}

        {/* ─── Floating Toast Feedback ─── */}
        {toastMessage && (
          <div className="wb-toast">
            {toastMessage}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default WhiteboardCanvas;