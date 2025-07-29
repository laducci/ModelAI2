const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Models
const User = require('../backend/models/User');

// Initialize Express
const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});

app.use(limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        return;
    }
    
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://administrador:ModelAI123@cluster0.k5pupmg.mongodb.net/modelai?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('📦 MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

// Auth routes
app.use('/auth', require('../backend/routes/auth'));
app.use('/scenarios', require('../backend/routes/scenarios'));
app.use('/users', require('../backend/routes/users'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
};
