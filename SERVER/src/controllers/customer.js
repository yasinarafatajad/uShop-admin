import customerModel from '../models/customer.js'

export const getCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await customerModel.findById(id);
        if (result) {
            res.status(200).json(result)
        } else {
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getAllCustomer = async (req, res) => {
    try {
        const customers = await customerModel
            .find()
            .sort({ createdAt: -1 })
            .populate({ path: 'orders', select: 'totalPrice' })
            .lean();

        // Compute totalSpent for each customer
        const result = customers.map(c => ({
            ...c,
            totalSpent: (c.orders || []).reduce((sum, o) => sum + (o.totalPrice || 0), 0),
        }));

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const addCustomer = async (req, res) => {
    try {
        const result = await customerModel.create(req.body);
        if (result) {
            res.status(201).json({ success: true, customer: result });
        } else {
            res.status(500).json({ success: false, message: 'Customer creation failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await customerModel.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ success: true, message: 'Customer deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await customerModel.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (result) {
            res.status(200).json({ success: true, customer: result });
        } else {
            res.status(404).json({ success: false, message: 'Customer not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}