import OrderModel from '../models/order.js'
import customerModel from '../models/customer.js'
import ProductModel from "../models/product.js";

export const getStats = async (req, res) => {
    try {
        const totalOrder = await OrderModel.countDocuments();
        const totalCustomer = await customerModel.countDocuments();
        const totalProduct = await ProductModel.countDocuments();
        const revenueData = await OrderModel.aggregate([
            {
                $match: {
                    $or: [
                        { isPaid: true }, { orderStatus: 'delivered' }
                    ]
                }
            }, {
                $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } }
            }
        ]);
        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        const stats = {
            totalProduct,
            totalCustomer,
            totalOrder,
            totalRevenue: totalRevenue || 0
        };

        res.status(200).json(stats);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// Dashboard data: recent orders + top products by revenue
export const getDashboardData = async (req, res) => {
    try {
        // Recent orders (last 5)
        const recentOrders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Top products by revenue (from order items)
        const topProductsAgg = await OrderModel.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    totalSold: { $sum: '$items.quantity' },
                    name: { $first: '$items.name' },
                    image: { $first: '$items.image' },
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 }
        ]);

        // Enrich with current product data
        const topProducts = [];
        for (const item of topProductsAgg) {
            const product = await ProductModel.findById(item._id).lean();
            topProducts.push({
                _id: item._id,
                title: product?.title || item.name,
                images: product?.images || (item.image ? [{ url: item.image }] : []),
                price: product?.price || 0,
                stock: product?.stock || 0,
                totalRevenue: item.totalRevenue,
                totalSold: item.totalSold,
            });
        }

        res.status(200).json({ recentOrders, topProducts });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

// Chart / Report data
export const getChartData = async (req, res) => {
    try {
        // Monthly sales for the current year
        const currentYear = new Date().getFullYear();
        const monthlySales = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Weekly sales (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklySales = await OrderModel.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    sales: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Category breakdown (count products per category-related field: brand)
        const categoryBreakdown = await ProductModel.aggregate([
            {
                $group: {
                    _id: "$brand",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Total revenue, orders, customers, products
        const totalRevenue = await OrderModel.aggregate([
            {
                $match: {
                    $or: [{ isPaid: true }, { orderStatus: 'delivered' }]
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalOrders = await OrderModel.countDocuments();
        const totalCustomers = await customerModel.countDocuments();
        const totalProducts = await ProductModel.countDocuments();

        res.status(200).json({
            monthlySales,
            weeklySales,
            categoryBreakdown,
            metrics: {
                totalRevenue: totalRevenue[0]?.total || 0,
                totalOrders,
                totalCustomers,
                totalProducts
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
}