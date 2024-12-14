const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  gender: String,
  age: Number,
  adharNumber: String,
  phoneNumber: String,
  address: String,
  city: String,
  pincode: String,
  services: [String],
  photo: String,
  labourCard: String,
  checkDeclaration: Boolean,
  recaptchaVerified: Boolean
});

const Provider = mongoose.model('Provider', providerSchema);
