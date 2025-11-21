const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verifyToken = require('../middleware/auth');
const { getNutritionEstimate } = require('../services/nutritionService');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get current user's fitness data
router.get('/fitness', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('fitnessData');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ fitnessData: user.fitnessData || [] });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add a fitness entry
router.post('/fitness', verifyToken, async (req, res) => {
    const { activityType, duration, caloriesBurned, distance } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.fitnessData.push({ activityType, duration, caloriesBurned, distance });
        await user.save();
        res.json({ msg: 'Fitness data added successfully', fitnessData: user.fitnessData });
    } catch (err) {
        res.status(500).json({ msg: 'Error adding fitness data' });
    }
});

// Log a meal
router.post('/meal', verifyToken, async (req, res) => {
    const { mealType, foodItems } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.meals.push({ mealType, foodItems });
        await user.save();
        res.json({ msg: 'Meal logged successfully', meals: user.meals });
    } catch (err) {
        res.status(500).json({ msg: 'Error logging meal' });
    }
});

// Get current user's meals
router.get('/meals', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('meals');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ meals: user.meals || [] });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// External nutrition lookup (CalorieNinjas + local fallback)
router.get('/food-calories', verifyToken, async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ msg: 'Query is required' });

    try {
        const estimate = await getNutritionEstimate(query);
        res.json(estimate);
    } catch (err) {
        if (err.code === 'NOT_FOUND') {
            return res.status(404).json({ msg: 'Food not found in nutrition database' });
        }
        if (err.code === 'EMPTY_QUERY') {
            return res.status(400).json({ msg: 'Query is required' });
        }
        res.status(502).json({ msg: 'Unable to fetch nutrition data right now' });
    }
});

module.exports = router;
