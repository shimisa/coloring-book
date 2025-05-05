import axios from 'axios';
import qs from 'qs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/user-auth';

export interface LoginCredentials {
  username: string; // Changed from email to username to match server expectations
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

class AuthService {
  private currentUser: any = null;

  constructor() {
    // Initialize auth state and set up interceptors
    this.setupAxiosInterceptors();
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
      }
    }
  }

  async confirmEmail(token: string): Promise<void> {
    try {
      console.log('Making email confirmation request to:', `${API_URL}/confirm-email?token=${token}`);
      
      const response = await axios.get(`${API_URL}/confirm-email?token=${token}`, {
        withCredentials: true
      });
      
      console.log('Email confirmation response:', response);
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // If the first attempt fails, try the alternative endpoint
      try {
        const response = await axios.get(`${API_URL}/register/confirm-email?token=${token}`, {
          withCredentials: true
        });
        console.log('Email confirmation response (alternative):', response);
        return;
      } catch (fallbackError: any) {
        console.error('Fallback confirmation error:', fallbackError);
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('הקישור לאימות האימייל לא תקין או שפג תוקפו');
      } else if (error.response?.status === 400) {
        throw new Error('אימות האימייל נכשל. אנא נסו שוב או צרו קשר עם התמיכה');
      }
      throw new Error('שגיאה באימות האימייל. אנא נסו שוב מאוחר יותר');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Create URL-encoded form data to match Spring Security's form login
      const params = new URLSearchParams();
      params.append('username', credentials.username);
      params.append('password', credentials.password);

      // Debug logging
      console.log('Login request URL:', `${API_URL}/login`);
      console.log('Login credentials:', {
        username: credentials.username,
        password: '********'
      });

      const response = await axios.post(
        `${API_URL}/login`, 
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        }
      );
      
      // Debug logging
      console.log('Login response:', response.data);
      
      if (response.data?.user) {
        // Store user data without sensitive information
        const userData = {
          email: credentials.username,
          ...response.data.user,
          authenticated: true // Add explicit authenticated flag
        };
        
        this.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.dispatchEvent(new Event('user-update'));
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new Event('user-update'));
      throw new Error(error.response?.data?.message || 'שגיאה בהתחברות. אנא בדקו את הפרטים ונסו שוב');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/register`, data, {
        withCredentials: true
      });
      
      if (response.data?.user) {
        this.currentUser = response.data.user;
        window.dispatchEvent(new Event('user-update'));
      }
      return response.data;
      
    } catch (err: any) {
      // Handle specific 409 Conflict error for existing email
      if (err.response?.status === 409) {
        throw new Error('כתובת האימייל או הסיסמה כבר קיימים במערכת. אנא נסו שוב עם פרטים אחרים');
      }
      
      // Handle other errors
      console.error('Registration error:', err);
      throw new Error(err.response?.data?.message || 'שגיאה בהרשמה. אנא בדקו את הפרטים ונסו שוב');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/logout`, this.currentUser, { withCredentials: true });
    } finally {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new Event('user-update'));
    }
  }

  getUser(): any {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return Boolean(this.currentUser?.authenticated);
  }

  // Refresh token mechanism
  public async refreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/refresh`, {}, { 
        withCredentials: true 
      });
      
      if (response.data?.user) {
        const userData = {
          ...response.data.user,
          authenticated: true
        };
        this.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.dispatchEvent(new Event('user-update'));
        return true;
      }
      return false;
    } catch (error) {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new Event('user-update'));
      return false;
    }
  }

  // Setup axios interceptor for CSRF token and authentication
  setupAxiosInterceptors(): void {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        // Always include credentials
        config.withCredentials = true;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshResult = await this.refreshToken();
            if (refreshResult) {
              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear auth state
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            window.dispatchEvent(new Event('user-update'));
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
export default authService;