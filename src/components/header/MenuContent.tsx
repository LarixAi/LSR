
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Car, FileText, Briefcase, Clock, MapPin, Shield, Home, Calendar, AlertCircle, UserCheck, Settings, User, Route } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MenuContentProps {
  onItemClick: () => void;
}

const MenuContent = ({ onItemClick }: MenuContentProps) => {
  const { profile } = useAuth();
  
  const showLicenseManagement = profile?.role === 'admin' || profile?.role === 'council' || profile?.role === 'compliance_officer';
  const showAdminFeatures = profile?.role === 'admin' || profile?.role === 'council';
  const isDriver = profile?.role === 'driver';

  const commonItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Jobs', url: '/jobs', icon: Briefcase },
    { title: 'Time Management', url: '/time-management', icon: Clock },
  ];

  const adminItems = [
    { title: 'Document Management', url: '/documents', icon: FileText },
    { title: 'Drivers', url: '/drivers', icon: Users },
    { title: 'Vehicle Management', url: '/vehicles', icon: Car },
    { title: 'School Routes', url: '/routes', icon: Route },
    { title: 'Admin Schedule', url: '/admin-schedule', icon: Calendar },
    { title: 'Subscriptions', url: '/subscriptions', icon: UserCheck },
    { title: 'Incidents', url: '/incidents', icon: AlertCircle },
  ];

  const driverItems = [
    { title: 'Driver Dashboard', url: '/driver-dashboard', icon: User },
    { title: 'My Documents', url: '/driver-documents', icon: FileText },
    { title: 'My Jobs', url: '/driver-jobs', icon: Briefcase },
    { title: 'Schedule', url: '/driver-schedule', icon: Clock },
    { title: 'Vehicle Checks', url: '/vehicles', icon: Car },
    { title: 'My School Routes', url: '/routes', icon: Route },
  ];

  return (
    <div className="space-y-2">
      {/* Common Navigation */}
      <div className="px-3 py-2 text-sm font-semibold text-gray-600">Main</div>
      {commonItems.map((item) => (
        <Link 
          key={item.title}
          to={item.url} 
          className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={onItemClick}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.title}</span>
        </Link>
      ))}

      {/* Admin Features */}
      {showAdminFeatures && (
        <>
          <div className="px-3 py-2 text-sm font-semibold text-gray-600">Management</div>
          {adminItems.map((item) => (
            <Link 
              key={item.title}
              to={item.url} 
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={onItemClick}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </>
      )}

      {/* Driver Features */}
      {isDriver && (
        <>
          <div className="px-3 py-2 text-sm font-semibold text-gray-600">Driver</div>
          {driverItems.map((item) => (
            <Link 
              key={item.title}
              to={item.url} 
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={onItemClick}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </>
      )}

      {/* License Management */}
      {showLicenseManagement && (
        <>
          <div className="px-3 py-2 text-sm font-semibold text-gray-600">Compliance</div>
          <Link 
            to="/license-management" 
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={onItemClick}
          >
            <Shield className="w-4 h-4" />
            <span>License Management</span>
          </Link>
        </>
      )}

      {/* Settings */}
      <div className="px-3 py-2 text-sm font-semibold text-gray-600">Account</div>
      <Link 
        to="/profile" 
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        onClick={onItemClick}
      >
        <UserCheck className="w-4 h-4" />
        <span>Profile</span>
      </Link>
      <Link 
        to="/settings" 
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        onClick={onItemClick}
      >
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </Link>
    </div>
  );
};

export default MenuContent;
