import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth, type Permission } from './AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions
}) => {
  const { isAuthenticated, loading, permissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location.pathname]);

  const hasRequiredPermissions =
    !requiredPermissions ||
    requiredPermissions.every((p) => {
      return permissions.includes(p);
    });

  if (loading || !isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hasRequiredPermissions) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You do not have permission to view this page.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};
