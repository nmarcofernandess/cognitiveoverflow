import React, { useEffect, useRef } from "react";

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mixing English, Japanese, and symbols
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    const drops: number[] = [];
    const speeds: number[] = [];
    const brightChars: number[] = [];
    
    // Initialize drops with random positions and speeds
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random heights above screen
      speeds[i] = Math.random() * 0.5 + 0.5; // Variable falling speeds
      brightChars[i] = Math.random() * 10; // Random bright character position
    }

    function draw() {
      if (!ctx || !canvas) return;
      
      // Fade effect - creates the trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Generate random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Variable brightness - some characters are brighter (white/light green)
        if (Math.abs(drops[i] - brightChars[i]) < 2) {
          // Bright leading character
          ctx.fillStyle = '#ffffff';
        } else if (Math.abs(drops[i] - brightChars[i]) < 5) {
          // Medium brightness
          ctx.fillStyle = '#00ff00';
        } else {
          // Standard green
          ctx.fillStyle = '#008000';
        }
        
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop when it goes off screen or randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = Math.random() * 0.5 + 0.5; // New random speed
          brightChars[i] = Math.random() * 10; // New bright position
        }
        
        // Move drop down with variable speed
        drops[i] += speeds[i];
      }
    }

    const interval = setInterval(draw, 35);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ opacity: 0.4 }}
    />
  );
};