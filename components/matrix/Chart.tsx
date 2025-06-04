import React from "react";

type ChartType = "pie" | "bar" | "line";

interface ChartProps {
  type: ChartType;
  data: any[];
}

export const Chart: React.FC<ChartProps> = ({ type, data }) => {
  if (type === "pie") {
    return <PieChart data={data} />;
  } else if (type === "bar") {
    return <BarChart data={data} />;
  } else if (type === "line") {
    return <LineChart data={data} />;
  }
  return null;
};

const PieChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Calculate the total value
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  // Calculate the cumulative angle for each segment
  let cumulativePercent = 0;
  const segments = data.map(item => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    
    return {
      ...item,
      percent,
      startPercent,
      endPercent: cumulativePercent
    };
  });

  return (
    <div className="pie-chart">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="transparent" stroke="#333" strokeWidth="0.5" />
        {segments.map((segment, index) => {
          const startAngle = (segment.startPercent / 100) * 360;
          const endAngle = (segment.endPercent / 100) * 360;
          
          // Convert angles to radians
          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);
          
          // Calculate the path
          const x1 = 50 + 45 * Math.cos(startRad);
          const y1 = 50 + 45 * Math.sin(startRad);
          const x2 = 50 + 45 * Math.cos(endRad);
          const y2 = 50 + 45 * Math.sin(endRad);
          
          // Determine if the arc is larger than 180 degrees
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');
          
          return (
            <path 
              key={index} 
              d={pathData} 
              fill={segment.color || `hsl(${index * 360 / data.length}, 70%, 60%)`} 
              stroke="#333" 
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span className="color-box" style={{ backgroundColor: item.color || `hsl(${index * 360 / data.length}, 70%, 60%)` }}></span>
            <span>{item.name}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Find the maximum value to scale the bars
  const maxValue = Math.max(...data.map(item => item.value)) * 1.1;
  
  return (
    <div className="bar-chart">
      <svg viewBox={`0 0 ${data.length * 60} 100`}>
        {/* X and Y axes */}
        <line x1="0" y1="80" x2={data.length * 60} y2="80" stroke="#666" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="0" y2="80" stroke="#666" strokeWidth="0.5" />
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 80;
          const barWidth = 40;
          const x = index * 60 + 10;
          const y = 80 - barHeight;
          
          return (
            <rect 
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.color || "#3a97ff"}
              stroke="#333"
              strokeWidth="0.5"
            />
          );
        })}
        
        {/* X axis labels */}
        {data.map((item, index) => (
          <text 
            key={index}
            x={index * 60 + 30}
            y={95}
            textAnchor="middle"
            fill="white"
            fontSize="8"
          >
            {item.name || item.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const LineChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Find the min and max values to scale the chart
  const values = data.map(item => item.value);
  const maxValue = Math.max(...values) * 1.1;
  const minValue = Math.min(...values) * 0.9;
  
  const width = data.length * 60;
  
  // Generate the line path
  const points = data.map((item, index) => {
    const x = index * (width / (data.length - 1));
    // Scale the y value between 0 and 70 (leaving space for labels)
    const y = 70 - ((item.value - minValue) / (maxValue - minValue) * 70);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} 100`}>
        {/* X and Y axes */}
        <line x1="0" y1="70" x2={width} y2="70" stroke="#666" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="0" y2="70" stroke="#666" strokeWidth="0.5" />
        
        {/* Line */}
        <polyline 
          points={points}
          fill="none"
          stroke="#00ff00"
          strokeWidth="1.5"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = index * (width / (data.length - 1));
          const y = 70 - ((item.value - minValue) / (maxValue - minValue) * 70);
          
          return (
            <circle 
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="white"
              stroke="#00ff00"
              strokeWidth="0.5"
            />
          );
        })}
        
        {/* X axis labels */}
        {data.map((item, index) => {
          const x = index * (width / (data.length - 1));
          
          return (
            <text 
              key={index}
              x={x}
              y={85}
              textAnchor="middle"
              fill="white"
              fontSize="6"
              transform={`rotate(45, ${x}, 85)`}
            >
              {item.period || item.label || item.name}
            </text>
          );
        })}
        
        {/* Y axis labels */}
        <text x="5" y="5" fill="white" fontSize="6">
          {maxValue.toFixed(1)}
        </text>
        <text x="5" y="70" fill="white" fontSize="6">
          {minValue.toFixed(1)}
        </text>
      </svg>
    </div>
  );
};