/**
 * PlacementRectangle - A draggable, rotatable rectangle overlay for map placement
 * Uses Leaflet for map rendering with custom SVG rectangles
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RotateCw, Move } from 'lucide-react';

interface PlacementRectangleProps {
  id: string;
  label: string;
  widthFt: number;
  lengthFt: number;
  centerX: number;
  centerY: number;
  rotation: number;
  scale: number; // pixels per foot
  color: string;
  borderColor: string;
  onMove: (x: number, y: number) => void;
  onRotate: (degrees: number) => void;
  snapToAngle?: boolean;
  snapAngles?: number[];
  isActive?: boolean;
  onActivate?: () => void;
}

export function PlacementRectangle({
  id,
  label,
  widthFt,
  lengthFt,
  centerX,
  centerY,
  rotation,
  scale,
  color,
  borderColor,
  onMove,
  onRotate,
  snapToAngle = false,
  snapAngles = [0, 45, 90, 135, 180, 225, 270, 315],
  isActive = false,
  onActivate,
}: PlacementRectangleProps) {
  const rectRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotateStart, setRotateStart] = useState(0);

  // Convert feet to pixels
  const widthPx = widthFt * scale;
  const heightPx = lengthFt * scale;

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate?.();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStart({
      x: clientX - centerX,
      y: clientY - centerY,
    });
  }, [centerX, centerY, onActivate]);

  // Handle rotation start
  const handleRotateStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate?.();
    setIsRotating(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    setRotateStart(angle - rotation);
  }, [centerX, centerY, rotation, onActivate]);

  // Handle mouse/touch move
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isRotating) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      if (isDragging) {
        onMove(clientX - dragStart.x, clientY - dragStart.y);
      }
      
      if (isRotating) {
        let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        angle = angle - rotateStart;
        
        // Normalize to 0-360
        while (angle < 0) angle += 360;
        while (angle >= 360) angle -= 360;
        
        // Snap to angles if enabled
        if (snapToAngle) {
          const closest = snapAngles.reduce((prev, curr) =>
            Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
          );
          if (Math.abs(closest - angle) < 10) {
            angle = closest;
          }
        }
        
        onRotate(angle);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsRotating(false);
    };

    if (isDragging || isRotating) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isRotating, dragStart, rotateStart, centerY, onMove, onRotate, snapToAngle, snapAngles]);

  return (
    <div
      ref={rectRef}
      className={cn(
        "absolute cursor-move select-none touch-none",
        isActive && "z-50"
      )}
      style={{
        left: centerX - widthPx / 2,
        top: centerY - heightPx / 2,
        width: widthPx,
        height: heightPx,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Rectangle body */}
      <div
        className={cn(
          "w-full h-full border-2 rounded-sm transition-shadow",
          isActive && "ring-2 ring-offset-2 ring-primary shadow-lg"
        )}
        style={{
          backgroundColor: color,
          borderColor: borderColor,
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-xs font-semibold px-1 py-0.5 rounded bg-white/90 text-gray-800 whitespace-nowrap"
            style={{ transform: `rotate(-${rotation}deg)` }}
          >
            {label}
          </span>
        </div>
        
        {/* Dimensions label */}
        <div 
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 whitespace-nowrap bg-white/80 px-1 rounded"
          style={{ transform: `rotate(-${rotation}deg)` }}
        >
          {lengthFt}ft x {widthFt}ft
        </div>
      </div>
      
      {/* Rotate handle */}
      {isActive && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90"
          onMouseDown={handleRotateStart}
          onTouchStart={handleRotateStart}
          style={{ transform: `rotate(-${rotation}deg)` }}
        >
          <RotateCw className="w-3 h-3" />
        </div>
      )}
      
      {/* Move indicator */}
      {isActive && (
        <div 
          className="absolute top-1 right-1"
          style={{ transform: `rotate(-${rotation}deg)` }}
        >
          <Move className="w-3 h-3 text-gray-600" />
        </div>
      )}
    </div>
  );
}
