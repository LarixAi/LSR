
import React from 'react';
import { Timer, MapPin } from 'lucide-react';

interface InspectionTimerProps {
  startTime: Date | null;
  walkAroundTime: number;
  inspectionStarted: boolean;
}

const InspectionTimer: React.FC<InspectionTimerProps> = ({
  startTime,
  walkAroundTime,
  inspectionStarted
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!startTime || !inspectionStarted) return null;

  return (
    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
      <div className="flex items-center gap-1">
        <Timer className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
        <span className="font-medium text-green-600 whitespace-nowrap">
          {formatTime(walkAroundTime)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
        <span className="text-xs text-blue-600 whitespace-nowrap">Tracking</span>
      </div>
    </div>
  );
};

export default InspectionTimer;
