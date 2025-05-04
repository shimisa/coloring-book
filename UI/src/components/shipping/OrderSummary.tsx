import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { ShippingCost, ShippingAddress } from '../../services/shipping.service';

const SummaryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
}));

const PriceRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
}));

interface OrderSummaryProps {
  orderItems: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  shippingAddress: ShippingAddress;
  shippingCost: ShippingCost;
  estimatedDelivery: string;
  onConfirm: () => void;
  isProcessing?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderItems,
  shippingAddress,
  shippingCost,
  estimatedDelivery,
  onConfirm,
  isProcessing = false,
}) => {
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + shippingCost.total;

  return (
    <SummaryContainer>
      <Typography variant="h5" gutterBottom color="primary">
        סיכום הזמנה
      </Typography>

      <List>
        {orderItems.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.name}
              secondary={`₪${item.price.toFixed(2)}`}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          פרטי משלוח
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {shippingAddress.fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {shippingAddress.street}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {shippingAddress.city}, {shippingAddress.zipCode}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {shippingAddress.phone}
        </Typography>
        
        {shippingAddress.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            הערות: {shippingAddress.notes}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarTodayIcon color="primary" />
        <Typography variant="body2">
          זמן משלוח משוער: {estimatedDelivery}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <PriceRow>
          <Typography>סכום ביניים:</Typography>
          <Typography>₪{subtotal.toFixed(2)}</Typography>
        </PriceRow>
        <PriceRow>
          <Typography>דמי משלוח:</Typography>
          <Typography>₪{shippingCost.basePrice.toFixed(2)}</Typography>
        </PriceRow>
        {shippingCost.giftPackagingPrice && (
          <PriceRow>
            <Typography>אריזת מתנה:</Typography>
            <Typography>₪{shippingCost.giftPackagingPrice.toFixed(2)}</Typography>
          </PriceRow>
        )}
        <Divider sx={{ my: 1 }} />
        <PriceRow>
          <Typography variant="h6">סה"כ לתשלום:</Typography>
          <Typography variant="h6" color="primary">
            ₪{total.toFixed(2)}
          </Typography>
        </PriceRow>
      </Box>

      {total >= 199 && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<LocalShippingIcon />}
            label="משלוח חינם!"
            color="success"
            variant="outlined"
          />
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        onClick={onConfirm}
        disabled={isProcessing}
      >
        {isProcessing ? 'מעבד...' : 'אישור והמשך לתשלום'}
      </Button>
    </SummaryContainer>
  );
};

export default OrderSummary;