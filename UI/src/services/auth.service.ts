import axios from 'axios';
import qs from 'qs';

const API_URL = 'http://localhost:8080/api/user-auth'; 

export interface LoginCredentials {
  email: string;
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
    // Initialization is now handled in AppContext
  }

  async confirmEmail(token: string): Promise<void> {
    try {
      await axios.get(`${API_URL}/register/confirm-email?token=${token}`);
    } catch (error) {
      console.error('Email confirmation error:', error);
      throw new Error('שגיאה באימות האימייל. אנא נסו שוב');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        qs.stringify(credentials),
        { 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true
        }
      );
      
      // Store both username and password to generate initials
      this.currentUser = {
        username: response.data.user.username,
        password: response.data.user.password // This will be used for initials
      };
      
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      window.dispatchEvent(new Event('user-update'));
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
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
    return !!this.currentUser;
  }

  // Refresh token mechanism
  private async refreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/refresh`, {}, { 
        withCredentials: true 
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Setup axios interceptor for CSRF token and authentication
  setupAxiosInterceptors(): void {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
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
              return axios(originalRequest);
            } else {
              // If refresh fails, clear auth state
              this.currentUser = null;
              localStorage.removeItem('currentUser');
              window.dispatchEvent(new Event('user-update'));
            }
          } catch (refreshError) {
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