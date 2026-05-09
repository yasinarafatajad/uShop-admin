import express from 'express';
import { getStats, getDashboardData, getChartData } from '../controllers/stats.js';

const router = express.Router()

router.get('/getStats' , getStats)
router.get('/dashboard' , getDashboardData)
router.get('/chartData' , getChartData)

export default router;