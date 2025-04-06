import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Dashboard, People, Assignment, MonetizationOn, AccountBalance } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const sidebarItems = [
    { text: 'Dashboard', path: '/', icon: <Dashboard /> },
    { text: 'Employees', path: '/employees', icon: <People /> },
    { text: 'Projects', path: '/projects', icon: <Assignment /> },
    { text: 'Income', path: '/income', icon: <MonetizationOn /> },
    { text: 'Expenses', path: '/expenses', icon: <AccountBalance /> },
  ];

  const sidebarContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {sidebarItems.map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              sx={{
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? '#f58220' : '#eee',
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  '& .MuiSvgIcon-root': {
                    color: location.pathname === item.path ? 'white' : 'inherit',
                  },
                },
                backgroundColor: location.pathname === item.path ? '#f58220' : 'transparent',
                color: location.pathname === item.path ? 'white' : 'inherit',
                '& .MuiSvgIcon-root': {
                  color: location.pathname === item.path ? 'white' : 'inherit',
                },
                mb: 1,
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant={isMobile ? 'temporary' : 'persistent'}
      sx={{
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 251,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
