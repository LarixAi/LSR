import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Truck, Users, Shield, Wrench } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RoleConfig {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  canSignup: boolean;
}

interface RoleHeaderProps {
  selectedRole: 'admin' | 'parent' | 'mechanic' | 'driver';
}

const getRoleConfig = (role: string): RoleConfig => {
  switch (role) {
    case 'admin':
      return {
        title: 'Administrator Access',
        description: 'Full system management and configuration controls',
        icon: Shield,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-900/20 to-red-800/20',
        borderColor: 'border-red-500/30',
        canSignup: true
      };
    case 'parent':
      return {
        title: 'Parent Portal',
        description: 'Track your children and manage transport bookings',
        icon: Users,
        gradient: 'from-blue-500 to-blue-600',
        bgGradient: 'from-blue-900/20 to-blue-800/20',
        borderColor: 'border-blue-500/30',
        canSignup: true
      };
    case 'mechanic':
      return {
        title: 'Mechanic Dashboard',
        description: 'Vehicle maintenance and repair management',
        icon: Wrench,
        gradient: 'from-orange-500 to-orange-600',
        bgGradient: 'from-orange-900/20 to-orange-800/20',
        borderColor: 'border-orange-500/30',
        canSignup: true
      };
    case 'driver':
      return {
        title: 'Driver Portal',
        description: 'Access routes, schedules, and vehicle information',
        icon: Truck,
        gradient: 'from-green-500 to-green-600',
        bgGradient: 'from-green-900/20 to-green-800/20',
        borderColor: 'border-green-500/30',
        canSignup: false
      };
    default:
      return {
        title: 'Access Portal',
        description: 'Select your role to continue',
        icon: Users,
        gradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-900/20 to-gray-800/20',
        borderColor: 'border-gray-500/30',
        canSignup: true
      };
  }
};

const RoleHeader = ({ selectedRole }: RoleHeaderProps) => {
  const isMobile = useIsMobile();
  const roleConfig = getRoleConfig(selectedRole);
  const IconComponent = roleConfig.icon;

  return (
    <div className={`p-4 rounded-lg bg-gradient-to-r ${roleConfig.bgGradient} border ${roleConfig.borderColor} transition-all duration-500 animate-fade-in`}>
      <div className={`flex items-center justify-center ${isMobile ? 'space-x-2 mb-2' : 'space-x-3 mb-3'}`}>
        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r ${roleConfig.gradient} rounded-lg flex items-center justify-center shadow-md`}>
          <IconComponent className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
        </div>
        <div className="text-left">
          <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white`}>
            {roleConfig.title}
          </CardTitle>
        </div>
      </div>
      <CardDescription className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed text-center`}>
        {roleConfig.description}
      </CardDescription>
    </div>
  );
};

export { getRoleConfig };
export default RoleHeader;