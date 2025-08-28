
import type { Stop } from '../types';

export const useRouteStops = (
  stops: Stop[],
  updateField: (field: 'stops', value: Stop[]) => void
) => {
  const addStop = () => {
    const nextOrder = stops.length;
    const defaultRole: 'PA' | 'Student' = nextOrder === 0 ? 'PA' : 'Student';
    const newStops = [...stops, { 
      address: '', 
      time: '', 
      role: defaultRole,
      passengerName: '',
      pickupOrder: nextOrder
    }];
    updateField('stops', newStops);
  };

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index)
      .map((stop, i) => ({ ...stop, pickupOrder: i })); // Reorder after removal
    updateField('stops', newStops);
  };

  const updateStop = (index: number, field: keyof Stop, value: string | number) => {
    const newStops = stops.map((stop, i) => 
      i === index ? { ...stop, [field]: value } : stop
    );
    updateField('stops', newStops);
  };

  return {
    addStop,
    removeStop,
    updateStop,
  };
};
