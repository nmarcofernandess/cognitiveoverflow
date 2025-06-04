import React, { useEffect, useRef } from "react";

export const MatrixRain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const container = containerRef.current;
    const containerWidth = window.innerWidth;
    const columnWidth = 20; // Increased column width for better visibility
    const columns = Math.floor(containerWidth / columnWidth);
    
    // Clear existing columns
    container.innerHTML = '';
    
    // Create columns
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${i * columnWidth}px`;
      column.style.animationDelay = `${Math.random() * 3}s`;
      column.style.animationDuration = `${5 + Math.random() * 3}s`; // Slower animation for better visibility
      
      // Generate random characters for this column
      let columnText = '';
      for (let j = 0; j < 40; j++) {
        columnText += characters[Math.floor(Math.random() * characters.length)] + '\n';
      }
      column.textContent = columnText;
      
      container.appendChild(column);
    }
    
    // Update characters periodically
    const interval = setInterval(() => {
      const columns = container.querySelectorAll('.matrix-column');
      columns.forEach(column => {
        let newText = '';
        for (let j = 0; j < 40; j++) {
          newText += characters[Math.floor(Math.random() * characters.length)] + '\n';
        }
        column.textContent = newText;
      });
    }, 200);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newContainerWidth = window.innerWidth;
      const newColumns = Math.floor(newContainerWidth / columnWidth);
      
      // Only rebuild if column count changes significantly
      if (Math.abs(newColumns - columns) > 2) {
        clearInterval(interval);
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          // Recreate matrix rain with new dimensions
          setTimeout(() => {
            if (containerRef.current) {
              for (let i = 0; i < newColumns; i++) {
                const column = document.createElement('div');
                column.className = 'matrix-column';
                column.style.left = `${i * columnWidth}px`;
                column.style.animationDelay = `${Math.random() * 3}s`;
                column.style.animationDuration = `${5 + Math.random() * 3}s`; // Slower animation for better visibility
                
                let columnText = '';
                for (let j = 0; j < 40; j++) {
                  columnText += characters[Math.floor(Math.random() * characters.length)] + '\n';
                }
                column.textContent = columnText;
                
                containerRef.current.appendChild(column);
              }
            }
          }, 100);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div ref={containerRef} className="matrix-bg"></div>;
};