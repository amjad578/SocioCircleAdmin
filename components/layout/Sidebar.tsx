import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import { useAuth } from '@/components/auth/AuthContext';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  boxes: <Inventory2Icon />,
  categories: <CategoryIcon />,
  materials: <LayersIcon />,
  gsm: <LineWeightIcon />,
  queries: <QuestionAnswerIcon />,
  banners: <ViewCarouselIcon />
};

export const Sidebar: React.FC = () => {
  const { menu } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? 72 : 260,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        transition: 'width 0.2s ease'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64
        }}
      >
        {!collapsed && (
          <Box sx={{ fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>Studio Admin</Box>
        )}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconButton
            size="small"
            onClick={() => setCollapsed((prev) => !prev)}
            sx={{ ml: collapsed ? 0 : 1 }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menu.map((item) => {
          const selected = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <ListItemButton
              key={item.id}
              selected={selected}
              onClick={() => navigate(item.path)}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    mr: collapsed ? 0 : 1.5,
                    justifyContent: 'center'
                  }}
                >
                  {iconMap[item.icon] ?? null}
                </ListItemIcon>
              )}
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};
