const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fitnessData: [
        {
            activityType: String,
            duration: Number, // in minutes
            caloriesBurned: Number,
            distance: Number, // in kilometers
            date: { type: Date, default: Date.now }
        }
    ],
    meals: [
        {
            mealType: String,
            foodItems: [
                {
                    foodName: String,
                    calories: Number,
                    protein: Number,
                    carbs: Number,
                    fats: Number
                }
            ],
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);
