import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      {maxValue === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">Không có dữ liệu để hiển thị.</div>
      ) : (
        <div className="flex items-end justify-around h-48 p-4 space-x-4 border-l border-b border-gray-200 dark:border-gray-700">
          {data.map(item => (
            <div key={item.label} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary hover:bg-primary-dark rounded-t-md transition-all duration-300"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
                title={`${item.label}: ${item.value}`}
              >
              </div>
              <span className="mt-2 text-xs text-center text-gray-600 dark:text-gray-300 break-words">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};