import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface ChartProps {
  data: DataPoint[];
  title: string;
  type: 'bar' | 'line' | 'pie' | 'progress';
  height?: number;
  showLegend?: boolean;
  className?: string;
}

const DataVisualization: React.FC<ChartProps> = ({
  data,
  title,
  type,
  height = 200,
  showLegend = true,
  className = ''
}) => {
  const { language } = useLanguage();
  const [animatedData, setAnimatedData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Animate data entry
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const renderBarChart = () => (
    <div className="space-y-3">
      {animatedData.map((item, index) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 font-medium">{item.label}</span>
            <span className="text-gray-600">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || colors[index % colors.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={animatedData.map((item, index) => {
            const x = (index / (animatedData.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return `${x},${y}`;
          }).join(' ')}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Data points */}
        {animatedData.map((item, index) => {
          const x = (index / (animatedData.length - 1)) * 100;
          const y = 100 - (item.value / maxValue) * 100;
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="#3B82F6"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((item, index) => (
          <span key={index} className="text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: height, height }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
            {animatedData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color || colors[index % colors.length]}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transformOrigin: '50% 50%'
                  }}
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">
                {language === 'en' ? 'Total' : 'စုစုပေါင်း'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressBars = () => (
    <div className="space-y-4">
      {animatedData.map((item, index) => (
        <div key={item.label} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">{item.label}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{item.value}%</span>
              {item.trend && (
                <div className={`flex items-center ${
                  item.trend === 'up' ? 'text-green-600' :
                  item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {item.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {item.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  {item.trend === 'stable' && <Activity className="h-4 w-4" />}
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${item.value}%`,
                backgroundColor: item.color || colors[index % colors.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {type === 'bar' && <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />}
          {type === 'line' && <Activity className="h-5 w-5 mr-2 text-blue-600" />}
          {type === 'pie' && <PieChart className="h-5 w-5 mr-2 text-blue-600" />}
          {type === 'progress' && <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />}
          {title}
        </h3>
        
        {completedCount === data.length && type === 'progress' && (
          <div className="flex items-center text-green-600">
            <Award className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">
              {language === 'en' ? 'Complete!' : 'ပြီးဆုံးပါပြီ!'}
            </span>
          </div>
        )}
      </div>

      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
      {type === 'progress' && renderProgressBars()}

      {/* Legend */}
      {showLegend && type !== 'progress' && (
        <div className="mt-6 flex flex-wrap gap-3">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataVisualization;