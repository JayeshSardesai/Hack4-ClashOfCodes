// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    serviceType: { type: String, required: true },
    serviceDescription: { type: String, required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    photo: { type: String, required: true }, // Assuming the photo will be stored as a URL or file path
    serviceTypeDropdown: { type: String, required: true }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
