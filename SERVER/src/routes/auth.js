import express from 'express';
import { signup, login, forgotPassword, changePassword, resetPassword, searchCustomer, verifyOtp } from '../controllers/auth.js';

const router = express.Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/search-customer', searchCustomer);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/change-password', changePassword);

export default router;
