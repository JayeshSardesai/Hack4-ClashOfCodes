const express = require("express");
const app = express();
const path = require("path");
const multer = require('multer'); 
const mysql = require("mysql2");
const port = 8080;
const mongoose = require("mongoose");
const User = require('./models/adminlogin.js'); // Import the User model
const ActualUser= require('./models/verifiedprofile.js'); // Import the User model
const Order = require('./models/order');
// const Provider = require('./models/provider.js'); // Import the User model
const bodyParser = require('body-parser');


const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');


app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));
main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/serives");
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'storage/'); // Define the folder where you want to save the files
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Save files with a unique name
    }
  });
  
  // Create multer instance with storage configuration
  const upload = multer({ storage: storage });


//gemini 


app.use(express.json());
const methodOverride = require('method-override');

app.use(express.urlencoded({extended :true}));//to take the url parameters
app.use(methodOverride('_method'));

app.set("view engine","ejs");

app.set("views",path.join(__dirname,"views"));//join the views folder (for the ejs files)

app.use(express.static(path.join(__dirname,"public")));//join the public folder to add the static files


//connection


app.get("/service/1",(req,res)=>{
    res.render("index1.ejs");
});
app.get("/service/2",(req,res)=>{
    res.render("index2.ejs");
});
app.get("/service/3",(req,res)=>{
    res.render("index3.ejs");
});

app.get("/provider",(req,res)=>{
    res.render("provider.ejs");
});

app.get("/adminlogin",(req,res)=>{
    res.render("adminlogin.ejs");
});

app.post('/signup', async (req, res) => {
    const { username, adminid, email, password } = req.body;
  
    // Check if email or adminid already exists
    const existingUser = await User.findOne({ $or: [{ email }, { adminid }] });
    if (existingUser) {
      return res.status(400).send('Email or Admin ID already in use');
    }
  
    try {
      // Create and save the new user (no password hashing)
      const newUser = new User({
        username,
        adminid,
        email,
        password // Store the password in plain text (not recommended)
      });
  
      await newUser.save();
      res.status(201).send('User signed up successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  // Signin API (POST request)
  app.post('/login', async (req, res) => {
    const { email, adminid, password } = req.body;

    // Find user by both email and adminid
    const user = await User.findOne({ email, adminid });
    if (!user) {
      return res.status(400).send('User not found or incorrect Admin ID');
    }

    // Check if the provided password matches the one in the database
    if (password !== user.password) {
      return res.status(400).send('Invalid credentials');
    }

    // Successful login, redirect to the X page
    // res.status(200).send('Login successful, redirecting to X page...');
    res.redirect("http://localhost:8080/admininterface");
    // Optionally, you can send a token for authentication in a real-world app
    // res.json({ token: 'your-jwt-token' });
});
//provider
app.get("/provider",(req,res)=>{
    res.render("provider.ejs");
});
const providerSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    // pincode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    services: { type: String, required: true },
    photo: { type: String, required: true },
    labourCard: { type: String },
});

const Provider = mongoose.model('Provider', providerSchema);

// Step 1: Rendering the Form (GET request)
app.get('/provider', (req, res) => {
    res.render('provider'); // This will render the provider.ejs form
});

// Step 2: Handling Form Submission (POST request)
app.post('/provider', upload.fields([{ name: 'myfile' }, { name: 'labour-card' }]), async (req, res) => {
    console.log(req.body); // For debugging the form data
    try {
      if (!req.files['myfile'] || !req.files['labour-card']) {
        return res.status(400).send('Both files are required.');
      }
  
      const provider = new Provider({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        gender: req.body.gender,
        age: req.body.age,
        phoneNumber: req.body['phone-number'],
        address: req.body.address,
        city: req.body.city,
        services: req.body.services,
        photo: req.files['myfile'][0].path, // Photo file path
        labourCard: req.files['labour-card'][0].path, // Labour card file path
      });
  
      // Save the provider data to MongoDB
      await provider.save();
  
      res.send('Provider registered successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error saving provider data.');
    }
  });


  //approve the job
  app.get("/admininterface/approve",async (req,res)=>{
    try {
        const providers = await Provider.find(); // Fetch all providers from the database
        res.render('approve.ejs', { providers }); // Pass the data to the EJS template
      } catch (err) {
        res.status(500).send('Error fetching data from database');
      }
  });
  app.post('/admininterface/approve/:id', async (req, res) => {
    try {
      const providerId = req.params.id;
  
      // Find the provider by ID
      const provider = await Provider.findById(providerId);
  
      if (!provider) {
        return res.status(404).send('Provider not found');
      }
  
      // Create a new ActualUser with provider's data
      const actualUser = new ActualUser({
        fname: provider.fname,
        lname: provider.lname,
        email: provider.email,
        gender: provider.gender,
        age: provider.age,
        phoneNumber: provider.phoneNumber,
        address: provider.address,
        city: provider.city,
        services: provider.services,
        photo: provider.photo,
        labourCard: provider.labourCard,
      });
  
      // Save the ActualUser data
      await actualUser.save();
  
      // Delete the provider from the Provider collection
      await Provider.findByIdAndDelete(providerId);
  
      // Redirect to the admin interface or send a success response
      res.redirect('/admininterface'); // Adjust this path as per your application
    } catch (error) {
      console.error('Error approving provider:', error);
      res.status(500).send('An error occurred while approving the provider');
    }
  });

  app.get("/admininterface/verified", async (req, res) => {
    try {
        // Fetch all providers from the database
        const providers = await ActualUser.find();

        // If no providers are found, return a 404 error
        if (!providers || providers.length === 0) {
            return res.status(404).send('No providers found');
        }

        // Pass all provider data to the EJS template
        res.render("verifiedprofile.ejs", { providers });
    } catch (error) {
        console.error("Error fetching providers:", error);
        res.status(500).send("An error occurred while fetching the providers' profiles");
    }
});

//order the service
app.get('/admininterface/order', (req, res) => {
  res.render('order'); // Render the 'order.ejs' form
});


// Route to handle form submission at /submit
app.post('/submit', upload.single('photo'), async (req, res) => {
  try {
      // Create a new order with form data and uploaded photo path
      const newOrder = new Order({
          serviceType: req.body.serviceType,
          serviceDescription: req.body.serviceDescription,
          customerName: req.body.customerName,
          email: req.body.email,
          address: req.body.address,
          city: req.body.city,
          photo: req.file.path, // Store the file path
          serviceTypeDropdown: req.body.serviceTypeDropdown
      });

      await newOrder.save();
      res.redirect("http://127.0.0.1:5501/frontend/index.html");
  } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while placing the order');
  }
});

//order
app.get('/admininterface/edit', async (req, res) => {
  try {
    const orders = await Order.find(); // Get all orders from the database
    res.render('showingorder', { orders: orders });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

// Route to handle deletion of an order
app.post('/admininterface/delete/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id); // Delete the order by ID
    res.redirect('/admininterface/edit'); // Redirect back to the order list after deletion
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

app.get("/admininterface/edit",(req,res)=>{
  res.render("showingorder.ejs");
});
app.get("/admininterface/email",(req,res)=>{
  res.render("email.ejs");
});

//admin 
app.get("/admininterface",(req,res)=>{
    res.render("admininterface.ejs");
});

app.listen(port,(req,res)=>{
    console.log(`Listening to the port ${port}`);
});

app.get("/msg",(req,res)=>{
  res.render("email.ejs");
})