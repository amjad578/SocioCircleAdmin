import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiLogin, apiChangePassword } from '@/lib/api';

export type Permission =
  | 'dashboard:view'
  | 'boxes:view'
  | 'boxes:create'
  | 'boxes:edit'
  | 'boxes:toggle'
  | 'queries:view'
  | 'queries:edit'
  | 'brands:view'
  | 'brands:edit';

export type MenuItem = {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  requiredPermission?: Permission;
  children?: MenuItem[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
};

export type LoginPayload = {
  email: string;
  password: string;
  redirectTo?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  menu: MenuItem[];
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  permissions: Permission[];
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'socio-admin-auth';

/** Build the sidebar menu based on admin role */
function buildMenu(_role: string): MenuItem[] {
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      requiredPermission: 'dashboard:view'
    },
    // Box Types (hidden — kept for future use)
    // {
    //   id: 'box-types',
    //   label: 'Box Types',
    //   path: '/box-types',
    //   icon: 'categories',
    //   requiredPermission: 'boxes:view'
    // },
    {
      id: 'queries',
      label: 'Queries',
      path: '/queries',
      icon: 'queries',
      requiredPermission: 'queries:view'
    },
    {
      id: 'brands',
      label: 'Brands',
      icon: 'brands',
      requiredPermission: 'brands:view',
      children: [
        { id: 'brands-all', label: 'All Brands', path: '/brands' },
        { id: 'brands-pending', label: 'Pending Brands', path: '/brands/pending' },
        { id: 'brands-approved', label: 'Approved Brands', path: '/brands/approved' },
        { id: 'brands-rejected', label: 'Rejected Brands', path: '/brands/rejected' },
      ],
    },
  ];
}

/** Map backend role to frontend permissions */
function getPermissionsForRole(role: string): Permission[] {
  if (role === 'super_admin') {
    return ['dashboard:view', 'boxes:view', 'boxes:create', 'boxes:edit', 'boxes:toggle', 'queries:view', 'queries:edit', 'brands:view', 'brands:edit'];
  }
  if (role === 'admin') {
    return ['dashboard:view', 'boxes:view', 'boxes:create', 'boxes:edit', 'boxes:toggle', 'queries:view', 'queries:edit', 'brands:view', 'brands:edit'];
  }
  // Default: read-only
  return ['dashboard:view', 'boxes:view', 'queries:view', 'brands:view'];
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    menu: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        const menu = parsed.user ? buildMenu(parsed.user.role) : [];
        setState({ ...parsed, menu, loading: false });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await apiLogin(payload.email, payload.password);
    const { token, name, email, role, _id } = result.data;
    const permissions = getPermissionsForRole(role);
    const user: User = {
      id: _id,
      name,
      email,
      role,
      permissions
    };
    const menu = buildMenu(role);
    const newState: AuthState = { user, token, loading: false, menu };
    setState(newState);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
    navigate(payload.redirectTo ?? '/dashboard', { replace: true });
  };

  const logout = () => {
    setState((prev) => ({ ...prev, user: null, token: null, menu: [] }));
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    navigate('/login', { replace: true });
  };

  const forgotPassword = async (_email: string): Promise<void> => {
    // Stub — the backend requires an email server setup
    await Promise.resolve();
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!state.user) {
      throw new Error('Not authenticated');
    }
    await apiChangePassword(oldPassword, newPassword);
  };

  const value: AuthContextValue = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.user && state.token),
      permissions: state.user?.permissions ?? [],
      login,
      logout,
      forgotPassword,
      changePassword
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
