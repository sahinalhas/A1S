import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from './api/core/client';
import { queryClient } from './query-client';
import { logger } from './utils/logger';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from './utils/helpers/safe-json';
import { invalidateAllSchoolQueries, clearAllSchoolCaches } from './school-context';
import { useIdleTimer } from '@/hooks/core/useIdleTimer';
import { IdleWarningModal } from '@/components/features/auth/IdleWarningModal';

// =================== TYPES ===================

export type UserRole = 'counselor' | 'teacher' | 'student' | 'parent';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  principal?: string;
  website?: string;
  socialMedia?: string;
  viceEducationDirector?: string;
  isDefault?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  selectedSchool: School | null;
  userSchools: School[];
  selectSchool: (school: School) => void;
  needsSchoolSelection: boolean;
  loadUserSchools: () => Promise<School[]>;
}

// =================== ROLE PERMISSIONS ===================

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  counselor: [
    'view_all_analytics',
    'export_filtered_data',
    'view_predictive_analysis',
    'view_comparative_reports',
    'view_progress_charts',
    'view_early_warnings',
    'manage_interventions',
    'view_student_details'
  ],
  teacher: [
    'view_class_analytics',
    'export_class_data',
    'view_progress_charts',
    'view_early_warnings',
    'view_own_students'
  ],
  student: [
    'view_own_progress',
    'view_own_sessions',
    'view_own_records'
  ],
  parent: [
    'view_child_progress',
    'view_child_sessions',
    'message_school'
  ]
};

// =================== STORAGE KEY ===================
const SELECTED_SCHOOL_KEY = 'rehber360_selected_school';

// =================== CONTEXT ===================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =================== HELPER: Resolve which school to use ===================
function resolveSchool(schools: School[]): { school: School | null; needsSelection: boolean } {
  if (schools.length === 0) {
    return { school: null, needsSelection: true };
  }

  if (schools.length === 1) {
    return { school: schools[0], needsSelection: false };
  }

  // Multiple schools - check localStorage first
  const storedSchool = safeLocalStorageGet<School | null>(SELECTED_SCHOOL_KEY, null);
  if (storedSchool) {
    const validSchool = schools.find(s => s.id === storedSchool.id);
    if (validSchool) {
      return { school: validSchool, needsSelection: false };
    }
  }

  // Check for default school
  const defaultSchool = schools.find(s => s.isDefault === 1);
  if (defaultSchool) {
    return { school: defaultSchool, needsSelection: false };
  }

  // No stored or default - user must choose
  return { school: null, needsSelection: true };
}

// =================== PROVIDER ===================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [userSchools, setUserSchools] = useState<School[]>([]);
  const [needsSchoolSelection, setNeedsSchoolSelection] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // Logout function (defined early for idle timer)
  const logout = useCallback(async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      logger.error('Failed to logout', 'Auth', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setSelectedSchool(null);
      setUserSchools([]);
      setNeedsSchoolSelection(false);
      setShowIdleWarning(false);
      safeLocalStorageRemove(SELECTED_SCHOOL_KEY);
      clearAllSchoolCaches(queryClient);
    }
  }, []);

  // Idle timer - only active when authenticated
  const { isWarning, resetTimer, formattedTime } = useIdleTimer({
    timeout: 60 * 60 * 1000, // 60 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    onIdle: () => {
      logger.info('User idle timeout - logging out', 'Auth');
      logout();
    },
    onWarning: () => {
      if (isAuthenticated) {
        setShowIdleWarning(true);
      }
    },
  });

  // Update warning modal state
  useEffect(() => {
    if (isWarning && isAuthenticated) {
      setShowIdleWarning(true);
    } else {
      setShowIdleWarning(false);
    }
  }, [isWarning, isAuthenticated]);

  // Load user schools from API
  const loadUserSchools = useCallback(async (): Promise<School[]> => {
    try {
      const response = await fetch('/api/schools/my-schools', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.schools) {
          setUserSchools(result.schools);
          return result.schools;
        }
      }
      return [];
    } catch (error) {
      logger.error('Failed to load user schools', 'Auth', error);
      return [];
    }
  }, []);

  // Select a school - simple and direct
  const selectSchool = useCallback((school: School) => {
    const previousSchoolId = selectedSchool?.id;
    const isSchoolSwitch = previousSchoolId && previousSchoolId !== school.id;

    setSelectedSchool(school);
    setNeedsSchoolSelection(false);
    safeLocalStorageSet(SELECTED_SCHOOL_KEY, school);

    // Invalidate and refetch all queries when switching schools
    if (isSchoolSwitch) {
      logger.info('School switched, invalidating all queries', 'Auth', {
        from: previousSchoolId,
        to: school.id
      });
      invalidateAllSchoolQueries(queryClient);
    }
  }, [selectedSchool?.id]);

  // Apply school resolution result
  const applySchoolResolution = useCallback((schools: School[]) => {
    const { school, needsSelection } = resolveSchool(schools);

    if (school) {
      setSelectedSchool(school);
      safeLocalStorageSet(SELECTED_SCHOOL_KEY, school);
    } else {
      safeLocalStorageRemove(SELECTED_SCHOOL_KEY);
    }

    setNeedsSchoolSelection(needsSelection);
  }, []);

  // Auth interceptor for API calls
  useEffect(() => {
    const authInterceptor = (config: RequestInit) => {
      const headers = new Headers(config.headers);
      if (user?.id) {
        headers.set('x-user-id', user.id);
      }
      return { ...config, headers };
    };

    apiClient.getInterceptors().addRequestInterceptor(authInterceptor);
    return () => {
      apiClient.getInterceptors().removeRequestInterceptor(authInterceptor);
    };
  }, [user?.id]);

  // Load session on mount - single source of truth for initialization
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/users/current', {
          credentials: 'include'
        });

        if (!mounted) return;

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            const userWithPermissions = {
              ...result.user,
              permissions: ROLE_PERMISSIONS[result.user.role as UserRole] || []
            };

            setUser(userWithPermissions);
            setIsAuthenticated(true);

            // Load and resolve schools
            const schools = await loadUserSchools();
            if (mounted) {
              applySchoolResolution(schools);
            }
          }
        }
      } catch (error) {
        logger.error('Failed to load session', 'Auth', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => { mounted = false; };
  }, [loadUserSchools, applySchoolResolution]);

  // Validate selected school when userSchools changes
  useEffect(() => {
    if (!isAuthenticated || isLoading || userSchools.length === 0) return;

    // If selected school is no longer valid, re-resolve
    if (selectedSchool && !userSchools.some(s => s.id === selectedSchool.id)) {
      logger.warn('Selected school no longer valid, re-resolving', 'Auth');
      applySchoolResolution(userSchools);
    }
  }, [isAuthenticated, isLoading, selectedSchool, userSchools, applySchoolResolution]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.user) {
        const userWithPermissions = {
          ...result.user,
          permissions: ROLE_PERMISSIONS[result.user.role as UserRole] || []
        };

        setUser(userWithPermissions);
        setIsAuthenticated(true);

        // Load and resolve schools
        const schools = await loadUserSchools();
        applySchoolResolution(schools);

        return true;
      }

      return false;
    } catch (error) {
      logger.error('Login error', 'Auth', error);
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  const handleIdleContinue = () => {
    setShowIdleWarning(false);
    resetTimer();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    selectedSchool,
    userSchools,
    selectSchool,
    needsSchoolSelection,
    loadUserSchools,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading && (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-primary">Rehber360</div>
            <div className="rounded-full h-8 w-8 border-b-2 border-primary mx-auto animate-spin"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      )}
      {!isLoading && children}

      {/* Idle Warning Modal */}
      {isAuthenticated && (
        <IdleWarningModal
          open={showIdleWarning}
          remainingTime={formattedTime}
          onContinue={handleIdleContinue}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
}

// =================== PERMISSION COMPONENTS ===================

interface PermissionGuardProps {
  permission?: string;
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// =================== PRIVATE ROUTE GUARD ===================

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, needsSchoolSelection, selectedSchool } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to school selection only if explicitly needed
  if (needsSchoolSelection && !selectedSchool) {
    return <Navigate to="/okul-sec" replace />;
  }

  return <>{children}</>;
}

// =================== ROLE-BASED RESTRICTIONS ===================

export function getRoleBasedStudentFilter(userRole: UserRole, userId: string): (studentId: string) => boolean {
  switch (userRole) {
    case 'counselor':
      return () => true;
    case 'teacher':
      return () => true;
    case 'student':
      return (studentId: string) => studentId === userId;
    case 'parent':
      return () => false;
    default:
      return () => false;
  }
}

export function getExportPermissions(userRole: UserRole): {
  canExportAll: boolean;
  canExportFiltered: boolean;
  allowedFormats: ('json' | 'csv')[];
  maxRecords?: number;
} {
  switch (userRole) {
    case 'counselor':
      return {
        canExportAll: false,
        canExportFiltered: true,
        allowedFormats: ['json', 'csv'],
        maxRecords: 1000,
      };
    case 'teacher':
      return {
        canExportAll: false,
        canExportFiltered: true,
        allowedFormats: ['csv'],
        maxRecords: 100,
      };
    case 'student':
    case 'parent':
    default:
      return {
        canExportAll: false,
        canExportFiltered: false,
        allowedFormats: [],
      };
  }
}
