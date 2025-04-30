import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { validateRequest } from '../middleware/validateRequest';
import { body } from 'express-validator';

const router = Router();
const authService = new AuthService();

// Register new user
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('firstName').notEmpty(),
        body('lastName').notEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const result = await authService.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Login user
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const result = await authService.login(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
);

// Validate token
router.post('/validate-token', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }
        const result = await authService.validateToken(token);
        if (result.valid) {
            res.json(result);
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

export default router;