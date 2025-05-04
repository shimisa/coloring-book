import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Navigation from './components/layout/Navigation';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ImageUploader from './components/upload/ImageUploader';
import ImageGallery from './components/gallery/ImageGallery';
import ColoringPreview from './components/gallery/ColoringPreview';
import ShippingForm from './components/shipping/ShippingForm';
import OrderSummary from './components/shipping/OrderSummary';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Navigation />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/upload" component={ImageUploader} />
        <Route path="/gallery" component={ImageGallery} />
        <Route path="/preview" component={ColoringPreview} />
        <Route path="/shipping" component={ShippingForm} />
        <Route path="/summary" component={OrderSummary} />
        <Route path="/" exact>
          <h1>Welcome to the Family Photo Coloring App</h1>
        </Route>
      </Switch>
      <Footer />
    </Router>
  );
};

export default App;