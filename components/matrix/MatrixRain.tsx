import React, { useEffect, useRef } from "react";

export const MatrixRain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンあかさたなはまやらわがざだばぱいきしちにひみりゐぎじぢびぴうくすつぬふむゆるゔぐずづぶぷえけせてねへめれゑげぜでべぺおこそとのほも';
    const container = containerRef.current;
    
    // Function to create a column
    const createColumn = () => {
      const containerWidth = window.innerWidth;
      // Further increased spacing for more sophistication
      const columnWidth = 35;
      // Reduce columns even more but ensure good coverage
      const columns = Math.floor(containerWidth / columnWidth) * 0.6;
      
      // Clear container
      container.innerHTML = '';
      
      // Create columns with varying characteristics
      for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-rain-column';
        
        // More random positioning
        column.style.left = `${i * columnWidth + (Math.random() * 20 - 10)}px`; 
        
        // Much more variance in animation timing
        column.style.animationDelay = `${Math.random() * 8}s`; 
        column.style.animationDuration = `${10 + Math.random() * 15}s`; 
        
        // Greater variance in opacity for more depth
        column.style.opacity = `${0.2 + Math.random() * 0.4}`;
        
        // Vary font size slightly for added dimension
        const fontSize = 1.0 + (Math.random() * 0.4);
        column.style.fontSize = `${fontSize}rem`;
        
        // Characters with varying brightness - some stand out more
        let columnText = '';
        const charBrightness = Math.random() > 0.8; // 20% chance for a brighter column
        
        if (charBrightness) {
          column.classList.add('bright-column');
        }
        
        // Different length columns
        const columnLength = 30 + Math.floor(Math.random() * 20);
        
        for (let j = 0; j < columnLength; j++) {
          // First character is brighter for some columns
          if (j === 0 && Math.random() > 0.7) {
            columnText += `<span class="bright-char">${characters[Math.floor(Math.random() * characters.length)]}</span>\n`;
          } else {
            columnText += characters[Math.floor(Math.random() * characters.length)] + '\n';
          }
        }
        
        column.innerHTML = columnText;
        container.appendChild(column);
      }
    };
    
    // Initial creation
    createColumn();
    
    // Update characters periodically with different patterns
    const updateInterval = setInterval(() => {
      const columns = container.querySelectorAll('.matrix-rain-column');
      columns.forEach((column, index) => {
        // Different update patterns for different columns
        // Some update more frequently than others
        const updateChance = index % 3 === 0 ? 0.97 : 0.99;
        
        if (Math.random() > updateChance) {
          const columnLength = 30 + Math.floor(Math.random() * 20);
          let newText = '';
          
          for (let j = 0; j < columnLength; j++) {
            if (j === 0 && Math.random() > 0.7) {
              newText += `<span class="bright-char">${characters[Math.floor(Math.random() * characters.length)]}</span>\n`;
            } else {
              newText += characters[Math.floor(Math.random() * characters.length)] + '\n';
            }
          }
          
          column.innerHTML = newText;
        }
      });
    }, 800); // Even slower updates for subtlety
    
    // Handle window resize
    const handleResize = () => {
      createColumn();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div ref={containerRef} className="matrix-rain"></div>;
};