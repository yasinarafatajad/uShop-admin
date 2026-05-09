import OrderModel from '../models/order.js'
import customerModel from '../models/customer.js'

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
        const result = await OrderModel.find().sort({ createdAt: -1 });
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
        totalPrice,
        orderStatus,
        isPaid
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
            totalPrice,
            orderStatus,
            isPaid
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
        const result = await OrderModel.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (result) {
            res.status(200).json({ success: true, order: result });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};