const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Set up Multer for image file handling
const upload = multer({ dest: "uploads/" });

// Initialize GoogleGenerativeAI with API key
const genAI = new GoogleGenerativeAI("AIzaSyBliLVaBdYWVcvccA3pjkNXz-8l1bztC20");

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files like CSS or JS if needed
app.use(express.static("public"));

// To parse form data (like images)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const functionCall = async (imagePath) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "our website(servicerace) provide the services like the consultance ,home cleaning,bathroom cleaning etc i will give the image just describe that image in two lines and esteemate the price in inr this is for our demo so you should give the price in inr and describe the image range will be only belagavi,karnataka and only give desciption and esteemated price dont show any thing more than that the message should contain 50 words and also contains our website name the content is comming in one line it should come in multiple lines like one line should contain 8 words and esteemated cost make it less give me 5 sentences";
  const image = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
      mimeType: "image/jpg", // Adjust mimeType if the image is not a jpg
    },
  };

  try {
    const result = await model.generateContent([prompt, image]);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error; // Rethrow error for further handling
  }
};

// Route to render the form
app.get("/", (req, res) => {
  res.render('index', { description: null, estimatedPrice: null });
});

// Route to handle image upload and description generation
app.post("/generate", upload.single("service-image"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No image file uploaded.");
    }
    const imagePath = path.join(__dirname, req.file.path);
    const description = await functionCall(imagePath);

    // You can modify the logic to estimate a price
    const estimatedPrice = "$50"; // Example: estimated price

    res.render('index', { description, estimatedPrice });
  } catch (error) {
    console.error("Error in /generate route:", error);
    res.status(500).render('index', {
      description: null,
      estimatedPrice: null,
      errorMessage: "There was an error processing the request. Please try again."
    });
  } finally {
    if (req.file) {
      fs.unlinkSync(path.join(__dirname, req.file.path)); // Clean up uploaded file
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
