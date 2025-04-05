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
  useTheme
} from '@mui/material';
import { Dashboard, People, MonetizationOn, Computer, AttachMoney } from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Import icons - MUI doesn't export icons in the main package
// If you don't have @mui/icons-material installed, you'll need to install it:
// npm install @mui/icons-material

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const sidebarItems = [
    { text: 'Dashboard', path: '/', icon: <Dashboard /> },
    { text: 'HR', path: '/hr', icon: <People /> },
    { text: 'Sales', path: '/sales', icon: <MonetizationOn /> },
    { text: 'Finance', path: '/finance', icon: <AttachMoney /> },
    { text: 'IT', path: '/it', icon: <Computer /> },
  ];
  
  const sidebarContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path} onClick={isMobile ? onClose : undefined} sx={{
              '&:hover': {
                backgroundColor: '#f58220',
                color: 'white',
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
            }}>
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
      variant={isMobile ? "temporary" : "persistent"}
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