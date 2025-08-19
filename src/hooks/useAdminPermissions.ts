import { useAuth } from '@/contexts/AuthContext';

export const useAdminPermissions = () => {
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'admin';
  const isCouncil = profile?.role === 'council';
  const isSuperAdmin = profile?.role === 'super_admin';
  const canManagePasswords = isAdmin || isCouncil || isSuperAdmin;
  const organizationId = profile?.organization_id;

  return {
    isAdmin,
    isCouncil,
    isSuperAdmin,
    canManagePasswords,
    organizationId,
    profile
  };
};
