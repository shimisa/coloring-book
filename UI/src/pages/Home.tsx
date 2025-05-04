import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
  color: 'white',
  padding: theme.spacing(8, 0, 6),
  borderRadius: '0 0 20px 20px',
  textAlign: 'center',
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: '12px',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ExampleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

// Sample images data - replace with actual examples
const examples = [
  {
    id: 1,
    title: 'תמונה משפחתית',
    original: '/examples/family-original.jpg',
    coloring: '/examples/family-coloring.jpg',
  },
  {
    id: 2,
    title: 'טיול משפחתי',
    original: '/examples/trip-original.jpg',
    coloring: '/examples/trip-coloring.jpg',
  },
  {
    id: 3,
    title: 'חגיגה משפחתית',
    original: '/examples/celebration-original.jpg',
    coloring: '/examples/celebration-coloring.jpg',
  },
];

const features = [
  {
    icon: <AutoAwesomeIcon fontSize="large" color="primary" />,
    title: 'המרה אוטומטית',
    description: 'טכנולוגיה מתקדמת להמרת תמונות לדפי צביעה איכותיים',
  },
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: 'פרטיות מלאה',
    description: 'התמונות שלכם מאובטחות ונשמרות בצורה מוצפנת',
  },
  {
    icon: <LocalShippingIcon fontSize="large" color="primary" />,
    title: 'משלוח מהיר',
    description: 'משלוח עד הבית תוך 2-4 ימי עסקים',
  },
];

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      <HeroSection>
        <Container>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: isMobile ? '2.5rem' : '3.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            הפכו זכרונות לרגעים של יצירה
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
          >
            המירו את התמונות המשפחתיות האהובות עליכם לספר צביעה מיוחד במינו
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            startIcon={<CloudUploadIcon />}
            href="/upload"
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            התחילו ליצור עכשיו
          </Button>
        </Container>
      </HeroSection>

      <Container sx={{ mt: 8, mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          color="primary"
        >
          איך זה עובד?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureCard elevation={2}>
                {feature.icon}
                <Typography variant="h6" sx={{ my: 2 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: '#f8f8f8', py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            color="primary"
          >
            דוגמאות
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {examples.map((example) => (
              <Grid item xs={12} md={4} key={example.id}>
                <ExampleCard elevation={3}>
                  <CardMedia
                    component="div"
                    sx={{
                      position: 'relative',
                      height: 0,
                      paddingTop: '75%',
                      background: `url(${example.original})`,
                      backgroundSize: 'cover',
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {example.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      לחצו לצפייה בתוצאה
                    </Typography>
                  </CardContent>
                </ExampleCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">
          מוכנים להתחיל?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          צרו ספר צביעה משפחתי מיוחד במינו כבר היום
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/register"
          sx={{ mr: 2 }}
        >
          הרשמה חינם
        </Button>
        <Button variant="outlined" color="primary" size="large" href="/login">
          התחברות
        </Button>
      </Container>
    </Box>
  );
};

export default Home;