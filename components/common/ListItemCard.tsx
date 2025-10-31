import React from 'react';

interface ListItemCardProps {
  title: React.ReactNode;
  details: { label: string; value: React.ReactNode }[];
  status?: { text: string; colorClasses: string };
  actions?: React.ReactNode;
}

export const ListItemCard: React.FC<ListItemCardProps> = ({ title, details, status, actions }) => {
  return (
    <div className="card-base p-4 space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 text-lg font-semibold">{title}</div>
        {status && (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${status.colorClasses} whitespace-nowrap`}>
            {status.text}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {details.map((detail, index) => (
          <div key={index} className="truncate">
            <p className="text-gray-500 dark:text-gray-400 text-xs">{detail.label}</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{detail.value}</p>
          </div>
        ))}
      </div>

      {actions && (
        <div className="flex justify-end items-center gap-2 border-t dark:border-gray-700 pt-3">
          {actions}
        </div>
      )}
    </div>
  );
};