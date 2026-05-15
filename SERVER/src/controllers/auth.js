import customerModel from '../models/customer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'nodemailer';
import 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export const signup = async (req, res) => {
    try {
        const { fullName, email, phone, password, image } = req.body;

        const existingUser = await customerModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await customerModel.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            image
        });

        const token = jwt.sign({ id: newCustomer._id, role: newCustomer.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, token, user: newCustomer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const identifier = typeof email === 'string' ? email.trim() : email;

        const user = await customerModel.findOne({
            $or: [
                { email: identifier },
                { phone: identifier },
                { fullName: identifier }
            ]
        }).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        
        user.password = undefined; // don't send password in response

        res.status(200).json({ success: true, token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

import nodemailer from 'nodemailer';
import axios from 'axios';

// Utility to send email OTP
const sendEmailOtp = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email provider
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset OTP - Mango Shop',
            text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Utility to send WhatsApp OTP
const sendWhatsappOtp = async (phone, otp) => {
    try {
        const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your-account-sid';
        const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your-auth-token';
        const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'your-twilio-whatsapp-number';
        const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID || 'HX229f5a04fd0510ce1b071852155d3e75';
        
        console.log(`Sending Twilio WhatsApp OTP ${otp} to ${phone}`);
        
        // Ensure the phone number format is correct for Twilio (E.164 format)
        let formattedPhone = phone.trim();
        if (!formattedPhone.startsWith('+')) {
            // If it starts with 01, it's a BD number, prepend +88
            if (formattedPhone.startsWith('01')) {
                formattedPhone = `+88${formattedPhone}`;
            } else {
                formattedPhone = `+${formattedPhone}`;
            }
        }

        console.log(`Sending Twilio WhatsApp OTP ${otp} to ${formattedPhone} (Original: ${phone})`);
        
        const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

        const params = new URLSearchParams();
        params.append('To', `whatsapp:${formattedPhone}`);
        params.append('From', `whatsapp:${TWILIO_WHATSAPP_NUMBER}`);
        
        // Use the official Twilio Content Template SID
        params.append('ContentSid', TWILIO_CONTENT_SID);
        // Pass the OTP into the template variables (mapping "1" to the otp)
        params.append('ContentVariables', JSON.stringify({ "1": otp }));

        const response = await axios.post(twilioUrl, params, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log(`Twilio WhatsApp Template success! Message SID: ${response.data.sid}`);
    } catch (error) {
        console.error('Error sending WhatsApp message (Twilio):', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Twilio WhatsApp message failed');
    }
};

// Search customer by identifier
export const searchCustomer = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const regex = new RegExp(query, 'i');
        const customers = await customerModel.find({
            $or: [
                { email: regex },
                { phone: regex },
                { fullName: regex }
            ]
        }).select('_id email phone fullName image');

        // Masking data for security
        const maskedCustomers = customers.map(c => {
            const maskedEmail = c.email ? c.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => { 
                return gp2 + gp3.replace(/./g, '*'); 
            }) : null;
            
            const maskedPhone = c.phone ? c.phone.replace(/.(?=.{4})/g, '*') : null;

            return {
                id: c._id,
                fullName: c.fullName,
                email: maskedEmail,
                phone: maskedPhone,
                image: c.image,
                hasEmail: !!c.email,
                hasPhone: !!c.phone
            };
        });

        res.status(200).json({ success: true, customers: maskedCustomers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { customerId, method } = req.body; // method is 'email' or 'whatsapp'

        const user = await customerModel.findById(customerId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 10 minutes
        await user.save();

        if (method === 'whatsapp' && user.phone) {
            try {
                await sendWhatsappOtp(user.phone, otp);
                return res.status(200).json({ success: true, message: 'OTP sent via WhatsApp' });
            } catch (whatsappError) {
                console.error('WhatsApp failed, falling back to email if possible:', whatsappError.message);
                if (user.email) {
                    await sendEmailOtp(user.email, otp);
                    return res.status(200).json({ success: true, message: 'WhatsApp failed, OTP sent via Email' });
                }
                return res.status(400).json({ success: false, message: `WhatsApp failed: ${whatsappError.message}` });
            }
        } else if (user.email) {
            await sendEmailOtp(user.email, otp);
            res.status(200).json({ success: true, message: 'OTP sent via Email' });
        } else {
            return res.status(400).json({ success: false, message: 'User does not have required contact method' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { customerId, otp } = req.body;

        const user = await customerModel.findOne({
            _id: customerId,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { customerId, otp, newPassword } = req.body;

        const user = await customerModel.findOne({
            _id: customerId,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        const user = await customerModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
