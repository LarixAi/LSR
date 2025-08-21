import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Bus, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const MobileNavigationEnhanced: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      {/* Mobile Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center space-y-1"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/drivers')}
          className="flex flex-col items-center space-y-1"
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Drivers</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/vehicles')}
          className="flex flex-col items-center space-y-1"
        >
          <Bus className="w-5 h-5" />
          <span className="text-xs">Vehicles</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="flex flex-col items-center space-y-1"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-xs">Menu</span>
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-4">
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/settings');
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-red-600"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigationEnhanced;
