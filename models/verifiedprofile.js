const mongoose = require('mongoose');

const actualUserSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    services: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true, // Path to the uploaded photo file
    },
    labourCard: {
        type: String,
        required: true, // Path to the uploaded labour card file
    },
}); // Automatically adds createdAt and updatedAt

const ActualUser = mongoose.model('ActualUser', actualUserSchema);

module.exports = ActualUser;
