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
import Collapse from '@mui/material/Collapse';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth, type MenuItem } from '@/components/auth/AuthContext';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  boxes: <Inventory2Icon />,
  categories: <CategoryIcon />,
  materials: <LayersIcon />,
  gsm: <LineWeightIcon />,
  queries: <QuestionAnswerIcon />,
  banners: <ViewCarouselIcon />,
  brands: <StorefrontIcon />,
};

function isPathActive(pathname: string, path: string): boolean {
  if (path === '/brands') {
    return pathname === '/brands' || /^\/brands\/[a-f\d]{24}$/i.test(pathname);
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isGroupActive(pathname: string, item: MenuItem): boolean {
  if (item.path && isPathActive(pathname, item.path)) return true;
  return item.children?.some((child) => child.path && isPathActive(pathname, child.path)) ?? false;
}

export const Sidebar: React.FC = () => {
  const { menu } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    menu.forEach((item) => {
      if (item.children?.length && isGroupActive(location.pathname, item)) {
        next[item.id] = true;
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [location.pathname, menu]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLeaf = (item: MenuItem, nested = false) => {
    if (!item.path) return null;
    const selected = isPathActive(location.pathname, item.path);

    return (
      <ListItemButton
        key={item.id}
        selected={selected}
        onClick={() => navigate(item.path!)}
        sx={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1.5 : nested ? 4 : 2,
          py: nested ? 0.75 : 1,
        }}
      >
        {item.icon && !nested && (
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 40,
              mr: collapsed ? 0 : 1.5,
              justifyContent: 'center',
            }}
          >
            {iconMap[item.icon] ?? null}
          </ListItemIcon>
        )}
        {!collapsed && (
          <ListItemText
            primary={item.label}
            slotProps={{
              primary: { sx: nested ? { fontSize: '0.875rem' } : undefined },
            }}
          />
        )}
      </ListItemButton>
    );
  };

  const renderItem = (item: MenuItem) => {
    if (item.children?.length) {
      const groupOpen = openGroups[item.id] ?? false;
      const groupActive = isGroupActive(location.pathname, item);

      return (
        <React.Fragment key={item.id}>
          <ListItemButton
            selected={groupActive && !groupOpen}
            onClick={() => {
              if (collapsed) {
                const firstChild = item.children?.find((c) => c.path);
                if (firstChild?.path) navigate(firstChild.path);
                return;
              }
              toggleGroup(item.id);
            }}
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1.5 : 2,
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  mr: collapsed ? 0 : 1.5,
                  justifyContent: 'center',
                }}
              >
                {iconMap[item.icon] ?? null}
              </ListItemIcon>
            )}
            {!collapsed && (
              <>
                <ListItemText primary={item.label} />
                {groupOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </>
            )}
          </ListItemButton>
          {!collapsed && (
            <Collapse in={groupOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => renderLeaf(child, true))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    return renderLeaf(item);
  };

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
        transition: 'width 0.2s ease',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
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
      <List sx={{ pt: 1 }}>{menu.map((item) => renderItem(item))}</List>
    </Box>
  );
};
