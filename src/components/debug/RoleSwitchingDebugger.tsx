import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  User, 
  Shield, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface RoleDebugLog {
  timestamp: string;
  event: string;
  userId?: string;
  email?: string;
  role?: string;
  path?: string;
  details?: any;
}

export const RoleSwitchingDebugger: React.FC<{ enabled?: boolean }> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const { profile, user, loading, forceRefreshProfile } = useAuth();
  const location = useLocation();
  const [debugLogs, setDebugLogs] = useState<RoleDebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Log role changes and authentication events
  useEffect(() => {
    if (!enabled) return;

    const logEvent = (event: string, details?: any) => {
      const log: RoleDebugLog = {
        timestamp: new Date().toISOString(),
        event,
        userId: profile?.id,
        email: profile?.email || user?.email,
        role: profile?.role,
        path: location.pathname,
        details
      };

      setDebugLogs(prev => [log, ...prev].slice(0, 50)); // Keep last 50 logs
      console.log('🐛 Role Debug:', log);
    };

    // Log when profile changes
    logEvent('Profile Updated', {
      hasProfile: !!profile,
      hasUser: !!user,
      isLoading: loading,
      profileData: profile ? {
        id: profile.id,
        role: profile.role,
        email: profile.email,
        organizationId: profile.organization_id
      } : null
    });

  }, [profile, user, loading, location.pathname, enabled]);

  // Check for potential role inconsistencies
  const checkRoleConsistency = () => {
    const issues: string[] = [];

    if (user && !profile) {
      issues.push('User exists but no profile loaded');
    }

    if (profile && user && profile.id !== user.id) {
      issues.push('Profile ID does not match user ID');
    }

    const cachedProfile = sessionStorage.getItem('user_profile');
    if (cachedProfile) {
      try {
        const cached = JSON.parse(cachedProfile);
        if (cached.id !== profile?.id) {
          issues.push('Cached profile ID mismatch');
        }
        if (cached.role !== profile?.role) {
          issues.push('Cached profile role mismatch');
        }
      } catch (e) {
        issues.push('Invalid cached profile data');
      }
    }

    return issues;
  };

  const roleConsistencyIssues = checkRoleConsistency();

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
        >
          <Bug className="w-4 h-4 mr-1" />
          Role Debug
          {roleConsistencyIssues.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {roleConsistencyIssues.length}
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="w-80 max-h-96 overflow-hidden bg-white shadow-lg border-2 border-red-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <Bug className="w-4 h-4 mr-2 text-red-600" />
                Role Switching Debug
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={forceRefreshProfile}
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 text-xs">
            {/* Current State */}
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3" />
                <span className="font-medium">Current State:</span>
              </div>
              <div className="ml-5 space-y-1">
                <div>Role: <Badge variant="outline">{profile?.role || 'None'}</Badge></div>
                <div>User ID: <span className="font-mono text-xs">{user?.id || 'None'}</span></div>
                <div>Email: {profile?.email || user?.email || 'None'}</div>
                <div>Path: {location.pathname}</div>
                <div>Loading: {loading ? '⏳' : '✅'}</div>
              </div>
            </div>

            {/* Role Consistency Issues */}
            {roleConsistencyIssues.length > 0 && (
              <div className="space-y-2 p-2 bg-red-50 rounded border border-red-200">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-medium">Issues Detected:</span>
                </div>
                <div className="ml-5 space-y-1">
                  {roleConsistencyIssues.map((issue, index) => (
                    <div key={index} className="text-red-600">• {issue}</div>
                  ))}
                </div>
              </div>
            )}

            {roleConsistencyIssues.length === 0 && (
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs">No role consistency issues</span>
              </div>
            )}

            {/* Recent Events */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Recent Events:</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {debugLogs.slice(0, 10).map((log, index) => (
                  <div key={index} className="text-xs p-1 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.event}</span>
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.role && <div>Role: {log.role}</div>}
                    {log.path && <div>Path: {log.path}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.clear();
                  setDebugLogs([]);
                }}
                className="w-full"
              >
                Clear Debug Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};