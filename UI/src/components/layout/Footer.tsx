import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

const FooterRoot = styled('footer')(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  padding: theme.spacing(6, 0),
  marginTop: 'auto',
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FooterRoot>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              צובעים משפחה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              הפכו את הזכרונות המשפחתיים שלכם
              <br />
              לחוויה יצירתית מיוחדת במינה
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              צרו קשר
            </Typography>
            <Box>
              <Link href="tel:+972-XX-XXXXXXX" color="inherit" display="flex" alignItems="center" sx={{ mb: 1 }}>
                <WhatsAppIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">052-XXXXXXX</Typography>
              </Link>
              <Link href="mailto:info@family-coloring.co.il" color="inherit" display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">info@family-coloring.co.il</Typography>
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              עקבו אחרינו
            </Typography>
            <Box>
              <Link href="https://instagram.com" target="_blank">
                <SocialButton color="primary" aria-label="Instagram">
                  <InstagramIcon />
                </SocialButton>
              </Link>
              <Link href="https://facebook.com" target="_blank">
                <SocialButton color="primary" aria-label="Facebook">
                  <FacebookIcon />
                </SocialButton>
              </Link>
              <Link href="https://wa.me/972XXXXXXXXX" target="_blank">
                <SocialButton color="primary" aria-label="WhatsApp">
                  <WhatsAppIcon />
                </SocialButton>
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} צובעים משפחה. כל הזכויות שמורות.
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link href="/privacy" color="inherit" variant="body2">
                  מדיניות פרטיות
                </Link>
                <Link href="/terms" color="inherit" variant="body2">
                  תנאי שימוש
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {isMobile && (
          <Box sx={{ height: 70 }}>
            {/* Spacer for mobile navigation */}
          </Box>
        )}
      </Container>
    </FooterRoot>
  );
};

export default Footer;