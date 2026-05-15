import OrderModel from '../models/order.js'
import customerModel from '../models/customer.js'
import ProductModel from '../models/product.js'
import Coupon from '../models/coupon.js'

export const GetOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await OrderModel.findOne({ _id: id });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const GetAllOrder = async (req, res) => {
    try {
        const { email, phone } = req.query;
        let query = {};

        if (email || phone) {
            const orConditions = [];
            if (email) orConditions.push({ 'shippingAddress.email': email });
            if (phone) orConditions.push({ 'shippingAddress.phone': phone });
            
            // Also search by linked user's email/phone if possible
            const customers = await customerModel.find({
                $or: [
                    { email: email || '____' },
                    { phone: phone || '____' }
                ]
            });
            
            if (customers.length > 0) {
                orConditions.push({ user: { $in: customers.map(c => c._id) } });
            }

            if (orConditions.length > 0) {
                query.$or = orConditions;
            }
        }

        const result = await OrderModel.find(query).sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const AddOrder = async (req, res) => {
    const {
        user,
        items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        discountPrice,
        couponCode,
        totalPrice,
        orderStatus,
        isPaid,
        senderNumber,
        trxId,
        paymentScreenshot
    } = req.body;

    try {
        let customerId = user;

        // If no existing customer selected, auto-create one
        if (!customerId && shippingAddress?.fullName) {
            // Check if customer with same phone already exists
            let existingCustomer = null;
            if (shippingAddress.phone) {
                existingCustomer = await customerModel.findOne({ phone: shippingAddress.phone });
            }

            if (existingCustomer) {
                customerId = existingCustomer._id;
            } else {
                // Create new customer from shipping info
                const newCustomer = await customerModel.create({
                    fullName: shippingAddress.fullName,
                    email: `${shippingAddress.fullName.replace(/\s+/g, '.').toLowerCase()}.${Date.now()}@guest.local`,
                    phone: shippingAddress.phone || '',
                    address: {
                        street: shippingAddress.address || '',
                        city: shippingAddress.city || '',
                        country: shippingAddress.country || 'Bangladesh',
                    },
                });
                customerId = newCustomer._id;
                console.log('Auto-created customer:', newCustomer.fullName);
            }
        }

        const orderData = {
            user: customerId,
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            discountPrice,
            couponCode,
            totalPrice,
            orderStatus,
            isPaid,
            senderNumber,
            trxId,
            paymentScreenshot
        };

        const order = await OrderModel.create(orderData);
        if (!order) {
            return res.status(500).json({ success: false, message: 'Order placement failed' });
        }

        // Link order to customer
        if (customerId) {
            await customerModel.findByIdAndUpdate(
                customerId,
                { $push: { orders: order._id } }
            );
        }

        // Decrease stock for each ordered product
        const orderItems = req.body.items || [];
        for (const item of orderItems) {
            if (item.product) {
                const updated = await ProductModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -(item.quantity || 1) } },
                    { new: true }
                );
                console.log(`Stock updated for ${item.name}: now ${updated?.stock}`);
            }
        }

        // Increase coupon usage count if used
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode },
                { $inc: { usedCount: 1 } }
            );
        }

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.log('Order adding failed :', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const DeleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await OrderModel.findOneAndDelete({ _id: id });
        if (result) {
            // Restore stock for deleted order items
            for (const item of result.items || []) {
                await ProductModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity || 1 } }
                );
            }
            // Restore coupon limit if used
            if (result.couponCode) {
                await Coupon.findOneAndUpdate(
                    { code: result.couponCode },
                    { $inc: { usedCount: -1 } }
                );
            }
            res.status(200).json({ success: true, message: 'Order deleted' });
        } else {
            res.status(404).json({ success: false, message: "Order doesn't exist" });
        }
    } catch (err) {
        console.log('Order delete failed. ', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const UpdateOrder = async (req, res) => {
    const { id } = req.params;
    try {
        // Get old order to check status change
        const oldOrder = await OrderModel.findById(id);
        if (!oldOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const result = await OrderModel.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        // If order is being cancelled, restore stock and coupon usage
        if (req.body.orderStatus === 'cancelled' && oldOrder.orderStatus !== 'cancelled') {
            for (const item of oldOrder.items || []) {
                await ProductModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity || 1 } }
                );
            }
            if (oldOrder.couponCode) {
                await Coupon.findOneAndUpdate(
                    { code: oldOrder.couponCode },
                    { $inc: { usedCount: -1 } }
                );
            }
        }

        res.status(200).json({ success: true, order: result });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};