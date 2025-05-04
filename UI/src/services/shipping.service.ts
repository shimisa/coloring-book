import axios from 'axios';

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface ShippingCost {
  basePrice: number;
  giftPackagingPrice?: number;
  total: number;
}

export interface OrderDetails {
  imageIds: string[];
  bookFormat: 'A4' | 'A5';
  paperType: 'standard' | 'premium';
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  shippingAddress: ShippingAddress;
  orderDetails: OrderDetails;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ShippingService {
  async calculateShipping(orderDetails: Partial<OrderDetails>): Promise<number> {
    try {
      const response = await axios.post(`${API_URL}/shipping/calculate`, orderDetails);
      return response.data.shippingCost;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }

  async createOrder(shippingAddress: ShippingAddress, orderDetails: OrderDetails): Promise<Order> {
    try {
      const response = await axios.post(`${API_URL}/orders`, {
        shippingAddress,
        orderDetails,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<Order['status']> {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}/status`);
      return response.data.status;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_URL}/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async updateShippingAddress(orderId: string, shippingAddress: Partial<ShippingAddress>): Promise<Order> {
    try {
      const response = await axios.patch(`${API_URL}/orders/${orderId}/shipping`, shippingAddress);
      return response.data;
    } catch (error) {
      console.error('Error updating shipping address:', error);
      throw error;
    }
  }

  getEstimatedDeliveryDate(order: Order): Date {
    // Calculate estimated delivery date based on order status and location
    const processingDays = 2; // 2 business days for processing
    const shippingDays = 3; // 3 business days for shipping
    
    const estimatedDate = new Date(order.createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + processingDays + shippingDays);
    
    return estimatedDate;
  }

  formatAddress(address: ShippingAddress): string {
    return `${address.street}, ${address.city} ${address.zipCode}`;
  }

  validatePhoneNumber(phone: string): boolean {
    // Israeli phone number validation
    const phoneRegex = /^(\+972|0)([23489]|5[0-9]|77)[1-9]\d{6}$/;
    return phoneRegex.test(phone);
  }

  validateZipCode(zipCode: string): boolean {
    // Israeli postal code validation
    const zipRegex = /^\d{5,7}$/;
    return zipRegex.test(zipCode);
  }
}

export default new ShippingService();