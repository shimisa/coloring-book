import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsIcon from '@mui/icons-material/Collections';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth.service';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: theme.palette.text.primary,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

const LogoSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const NavSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const LogoLink = styled(RouterLink)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  '&:hover': {
    opacity: 0.9
  }
});

const AnimatedIcon = styled(ColorLensIcon)(({ theme }) => ({
  animation: 'spin 4s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1, 2),
  textTransform: 'none',
}));

interface NavigationItem {
  text: string;
  icon: JSX.Element;
  path: string;
  protected: boolean;
  flowProtected?: boolean;
}

const navigationItems: NavigationItem[] = [
  { text: 'דף הבית', icon: <HomeIcon />, path: '/', protected: false },
  { text: 'העלאת תמונות', icon: <CloudUploadIcon />, path: '/upload', protected: true },
  { text: 'הגלריה שלי', icon: <CollectionsIcon />, path: '/gallery', protected: true },
  { text: 'סיכום והזמנה', icon: <LocalShippingIcon />, path: '/shipping', protected: true, flowProtected: true },
];

const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userData, setUserData] = useState(authService.getUser());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useApp();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const handleUserUpdate = () => {
      setUserData(authService.getUser());
    };

    window.addEventListener('user-update', handleUserUpdate);
    return () => window.removeEventListener('user-update', handleUserUpdate);
  }, []);

  const userInitials = React.useMemo(() => {
    if (userData?.username && userData?.password) {
      // Take first letter from username and password to make "SS"
      const firstInitial = userData.username.charAt(0);
      const secondInitial = userData.password.charAt(0);
      return `${firstInitial}${secondInitial}`.toUpperCase();
    }
    return '';
  }, [userData]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    handleMenuClose();
    authService.logout();
    showToast('התנתקת בהצלחה', 'success');
    navigate('/');
  };

  const handleNavigation = (path: string, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      showToast('יש להתחבר תחילה', 'warning');
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate(path);
    handleMenuClose();
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnimatedIcon color="primary" sx={{ fontSize: 24 }} />
        <Typography variant="h6" color="primary">
          צובעים משפחה
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path, item.protected)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <StyledAppBar position="sticky">
      <StyledToolbar>
        <LogoSection>
          <LogoLink to="/">
            <AnimatedIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="div"
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              צובעים משפחה
            </Typography>
          </LogoLink>
        </LogoSection>

        {!isMobile && (
          <NavSection>
            {navigationItems.map((item) => (
              <NavButton
                key={item.text}
                startIcon={item.icon}
                onClick={() => handleNavigation(item.path, item.protected)}
                variant={location.pathname === item.path ? 'contained' : 'text'}
                color={location.pathname === item.path ? 'primary' : 'inherit'}
              >
                {item.text}
              </NavButton>
            ))}
          </NavSection>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                size="large"
                edge="end"
                aria-label="user account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}
                >
                  {userInitials || <PersonIcon />}
                </Avatar>
              </IconButton>
              {isMobile && (
                <IconButton
                  color="primary"
                  onClick={handleDrawerToggle}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="primary"
                variant="outlined"
                component={RouterLink}
                to="/login"
                sx={{ minWidth: isMobile ? 'auto' : 100 }}
              >
                {isMobile ? 'כניסה' : 'התחברות'}
              </Button>
              <Button
                color="primary"
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{ minWidth: isMobile ? 'auto' : 100 }}
              >
                {isMobile ? 'הרשמה' : 'הרשמה חינם'}
              </Button>
            </Box>
          )}
        </Box>
      </StyledToolbar>

      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 180,
            maxWidth: 220
          }
        }}
        MenuListProps={{
          sx: {
            py: 0.5
          }
        }}
      >
        <MenuItem 
          onClick={() => handleNavigation('/gallery', true)}
          sx={{ py: 1 }}
        >
          הגלריה שלי
        </MenuItem>
        <MenuItem 
          onClick={() => handleNavigation('/upload', true)}
          sx={{ py: 1 }}
        >
          העלאת תמונות
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{ py: 1, color: 'error.main' }}
        >
          התנתקות
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>
    </StyledAppBar>
  );
};

export default Header;