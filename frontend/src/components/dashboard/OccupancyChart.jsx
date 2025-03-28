
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

// TODO: Replace with SQL query to fetch real-time data
const generateDummyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map(hour => {
    // Create a pattern that peaks during morning and evening hours
    let baseOccupancy = 20; // base occupancy
    
    // Morning peak (7-9 AM)
    if (hour >= 7 && hour <= 9) {
      baseOccupancy += 40 + Math.random() * 20;
    }
    // Evening peak (5-7 PM)
    else if (hour >= 17 && hour <= 19) {
      baseOccupancy += 50 + Math.random() * 20;
    }
    // Midday (11 AM - 2 PM)
    else if (hour >= 11 && hour <= 14) {
      baseOccupancy += 30 + Math.random() * 15;
    }
    // Night time (low occupancy)
    else if (hour >= 22 || hour <= 5) {
      baseOccupancy = 10 + Math.random() * 10;
    }
    else {
      baseOccupancy += Math.random() * 25;
    }
    
    // Ensure we don't exceed 100%
    const occupancy = Math.min(Math.round(baseOccupancy), 100);
    
    return {
      hour: `${hour}:00`,
      occupancy,
      available: 100 - occupancy,
    };
  });
};

const OccupancyChart = ({ className }) => {
  const [data, setData] = useState(generateDummyData());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Format hour display
  const formatHour = (hour) => {
    const hourNum = parseInt(hour);
    if (hourNum === 0 || hourNum === 12) return '12';
    return String(hourNum % 12);
  };

  const formatTooltip = (value) => {
    return [`${value}%`, 'Occupancy'];
  };

  return (
    <div className={cn('w-full h-[300px]', className, isLoaded ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-500')}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="hour" 
            tickFormatter={formatHour}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--foreground))" 
            opacity={0.7}
          />
          <YAxis 
            unit="%" 
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--foreground))" 
            opacity={0.7}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              borderRadius: 'var(--radius)', 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="occupancy" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#occupancyGradient)" 
            strokeWidth={2}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyChart;
