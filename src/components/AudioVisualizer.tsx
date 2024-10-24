import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  data: Uint8Array;
}

export default function AudioVisualizer({ data }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#EF4444'; // Red-500

    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * height;
      const x = i * barWidth;
      const y = height - barHeight;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className="w-full h-[60px] rounded-lg bg-gray-50"
    />
  );
}