import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8081';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
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
            const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/signup`, credentials);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async validateToken(token: string) {
        try {
            // Since your Java backend doesn't have a dedicated endpoint for token validation,
            // we'll implement a simple check using the Authorization header
            // This makes a request to verify if the token is valid by checking if it can access protected resources
            const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { valid: true, user: response.data };
        } catch (error) {
            // If the request fails, the token is invalid
            return { valid: false, user: null };
        }
    }

    private handleError(error: any) {
        if (error.response) {
            return new Error(error.response.data.message || 'Authentication failed');
        }
        return new Error('Network error occurred');
    }
}