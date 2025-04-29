import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8081';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    firstName: string;
    lastName: string;
}

export class AuthService {
    async login(credentials: LoginCredentials) {
        try {
            const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, credentials);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async register(credentials: RegisterCredentials) {
        try {
            const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, credentials);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async validateToken(token: string) {
        try {
            const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/validate-token`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async requestPasswordReset(email: string) {
        try {
            const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/reset-password`, {
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async verifyEmail(token: string) {
        try {
            const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify-email`, {
                params: { token }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.response) {
            return new Error(error.response.data.message || 'Authentication failed');
        }
        return new Error('Network error occurred');
    }
} 