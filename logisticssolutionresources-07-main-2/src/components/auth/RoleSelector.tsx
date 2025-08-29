import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RoleSelectorProps {
  selectedRole: 'admin' | 'parent' | 'mechanic' | 'driver';
  onRoleChange: (role: 'admin' | 'parent' | 'mechanic' | 'driver') => void;
}

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  const isMobile = useIsMobile();

  const roles = [
    { value: 'admin', label: 'Admin', color: 'red' },
    { value: 'parent', label: 'Parent', color: 'blue' },
    { value: 'mechanic', label: 'Mechanic', color: 'orange' },
    { value: 'driver', label: 'Driver', color: 'green' }
  ] as const;

  const getButtonClasses = (role: typeof roles[number]) => {
    const isSelected = selectedRole === role.value;
    const baseClasses = `flex-1 px-3 py-3 text-xs font-medium rounded-md border transition-all duration-300 ${isMobile ? 'h-11' : 'h-10'}`;
    
    if (isSelected) {
      switch (role.color) {
        case 'red':
          return `${baseClasses} bg-red-500/20 text-red-400 border-red-500/50`;
        case 'blue':
          return `${baseClasses} bg-blue-500/20 text-blue-400 border-blue-500/50`;
        case 'orange':
          return `${baseClasses} bg-orange-500/20 text-orange-400 border-orange-500/50`;
        case 'green':
          return `${baseClasses} bg-green-500/20 text-green-400 border-green-500/50`;
        default:
          return `${baseClasses} bg-slate-600/50 text-slate-300 border-slate-500/50`;
      }
    } else {
      return `${baseClasses} bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-600/50 hover:text-slate-300`;
    }
  };

  if (isMobile) {
    return (
      <div className="w-full space-y-2">
        <p className="text-slate-300 text-xs mb-3 font-medium text-center">Select Account Type</p>
        <div className="space-y-2">
          {/* First Row: Admin & Parent */}
          <div className="flex space-x-2">
            <button
              onClick={() => onRoleChange('admin')}
              className={getButtonClasses(roles[0])}
            >
              Admin
            </button>
            <button
              onClick={() => onRoleChange('parent')}
              className={getButtonClasses(roles[1])}
            >
              Parent
            </button>
          </div>
          {/* Second Row: Mechanic & Driver */}
          <div className="flex space-x-2">
            <button
              onClick={() => onRoleChange('mechanic')}
              className={getButtonClasses(roles[2])}
            >
              Mechanic
            </button>
            <button
              onClick={() => onRoleChange('driver')}
              className={getButtonClasses(roles[3])}
            >
              Driver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-slate-300 text-sm mb-3 font-medium text-center">Select Account Type</p>
      <div className="grid grid-cols-4 gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg p-1">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => onRoleChange(role.value)}
            className={getButtonClasses(role)}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;