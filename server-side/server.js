import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import multer from "multer";
import path from "path";

dotenv.config();

// Initialize AWS and S3
const s3 = new S3Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("common"));

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema
const clothesSchema = new mongoose.Schema({
  name: String,
  type: String,
  clothingCategory: {
    type: String,
    enum: ["Top", "Bottom", "Complete Outfit", "PairShoes"],
    required: true,
  },
  professional: Boolean,
  color: String,
  pattern: String,
  image: String,
});

// Define a schema
const favoriteSchema = new mongoose.Schema({
  clothes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Clothes" }],
});

// Create a model
const Clothes = mongoose.model("Clothes", clothesSchema);
const Favorite = mongoose.model("Favorite", favoriteSchema);

// const sampleClothes = [
//   // Shirts (Top)
//   {
//     name: "Blue Casual Shirt",
//     type: "Shirt",
//     clothingCategory: "Top",
//     professional: false,
//     color: "Blue",
//     pattern: "Solid",
//     image: "image_url_1",
//   },
//   {
//     name: "White Formal Shirt",
//     type: "Shirt",
//     clothingCategory: "Top",
//     professional: true,
//     color: "White",
//     pattern: "Solid",
//     image: "image_url_2",
//   },
//   {
//     name: "Checked Casual Shirt",
//     type: "Shirt",
//     clothingCategory: "Top",
//     professional: false,
//     color: "Multi",
//     pattern: "Checked",
//     image: "image_url_3",
//   },
//   {
//     name: "Black Formal Shirt",
//     type: "Shirt",
//     clothingCategory: "Top",
//     professional: true,
//     color: "Black",
//     pattern: "Solid",
//     image: "image_url_4",
//   },

//   // Dresses (Complete Outfit)
//   {
//     name: "Red Evening Dress",
//     type: "Dress",
//     clothingCategory: "Complete Outfit",
//     professional: false,
//     color: "Red",
//     pattern: "Solid",
//     image: "image_url_5",
//   },
//   {
//     name: "Floral Summer Dress",
//     type: "Dress",
//     clothingCategory: "Complete Outfit",
//     professional: false,
//     color: "Multi",
//     pattern: "Floral",
//     image: "image_url_6",
//   },
//   {
//     name: "Black Formal Dress",
//     type: "Dress",
//     clothingCategory: "Complete Outfit",
//     professional: true,
//     color: "Black",
//     pattern: "Solid",
//     image: "image_url_7",
//   },
//   {
//     name: "Blue Casual Dress",
//     type: "Dress",
//     clothingCategory: "Complete Outfit",
//     professional: false,
//     color: "Blue",
//     pattern: "Solid",
//     image: "image_url_8",
//   },

//   // Pants (Bottom)
//   {
//     name: "Black Formal Pants",
//     type: "Pants",
//     clothingCategory: "Bottom",
//     professional: true,
//     color: "Black",
//     pattern: "Solid",
//     image: "image_url_9",
//   },
//   {
//     name: "Blue Jeans",
//     type: "Pants",
//     clothingCategory: "Bottom",
//     professional: false,
//     color: "Blue",
//     pattern: "Solid",
//     image: "image_url_10",
//   },
//   {
//     name: "Grey Formal Pants",
//     type: "Pants",
//     clothingCategory: "Bottom",
//     professional: true,
//     color: "Grey",
//     pattern: "Solid",
//     image: "image_url_11",
//   },
//   {
//     name: "Green Casual Pants",
//     type: "Pants",
//     clothingCategory: "Bottom",
//     professional: false,
//     color: "Green",
//     pattern: "Solid",
//     image: "image_url_12",
//   },

//   // Skirts (Bottom)
//   {
//     name: "Black Formal Skirt",
//     type: "Skirt",
//     clothingCategory: "Bottom",
//     professional: true,
//     color: "Black",
//     pattern: "Solid",
//     image: "image_url_13",
//   },
//   {
//     name: "Red Casual Skirt",
//     type: "Skirt",
//     clothingCategory: "Bottom",
//     professional: false,
//     color: "Red",
//     pattern: "Solid",
//     image: "image_url_14",
//   },

//   // Shorts (Bottom)
//   {
//     name: "Blue Denim Shorts",
//     type: "Shorts",
//     clothingCategory: "Bottom",
//     professional: false,
//     color: "Blue",
//     pattern: "Solid",
//     image: "image_url_15",
//   },
//   {
//     name: "Green Casual Shorts",
//     type: "Shorts",
//     clothingCategory: "Bottom",
//     professional: false,
//     color: "Green",
//     pattern: "Solid",
//     image: "image_url_16",
//   },

//   // Pair of Shoes (Complete Outfit)
//   {
//     name: "Black Formal Shoes",
//     type: "PairShoes",
//     clothingCategory: "PairShoes",
//     professional: true,
//     color: "Black",
//     pattern: "Solid",
//     image: "image_url_17",
//   },
//   {
//     name: "White Sneakers",
//     type: "PairShoes",
//     clothingCategory: "PairShoes",
//     professional: false,
//     color: "White",
//     pattern: "Solid",
//     image: "image_url_18",
//   },
//   {
//     name: "Brown Formal Shoes",
//     type: "PairShoes",
//     clothingCategory: "PairShoes",
//     professional: true,
//     color: "Brown",
//     pattern: "Solid",
//     image: "image_url_19",
//   },
//   {
//     name: "Red Casual Shoes",
//     type: "PairShoes",
//     clothingCategory: "PairShoes",
//     professional: false,
//     color: "Red",
//     pattern: "Solid",
//     image: "image_url_20",
//   },
// ];

// Clothes.insertMany(sampleClothes);

// Upload a file to S3

app.post("/upload", upload.single("image"), async (req, res) => {
  // Validation Logic
  const { type } = req.body;
  const validTypes = [
    "Shirt",
    "Pants",
    "Skirt",
    "Shorts",
    "Dress",
    "PairShoes",
  ];

  let clothingCategory; // Declare it here

  if (!validTypes.includes(type)) {
    return res.status(400).send("Invalid type.");
  }

  // Setting clothingCategory based on type
  if (type === "Shirt") {
    clothingCategory = "Top";
  } else if (["Pants", "Skirt", "Shorts"].includes(type)) {
    clothingCategory = "Bottom";
  } else if (type === "Dress") {
    clothingCategory = "Outfit";
  } else if (type === "PairShoes") {
    clothingCategory = "PairShoes";
  }

  const fileContent = fs.readFileSync(req.file.path);
  const key = path.basename(req.file.path); // Or generate a unique key

  const params = {
    Bucket: "wardrobe-app-clothing-uploads",
    Key: key,
    Body: fileContent,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    fs.unlinkSync(req.file.path); // Delete the file from local storage

    const s3Url = `https://wardrobe-app-clothing-uploads.s3.us-west-2.amazonaws.com/${key}`;

    // Save to MongoDB
    const newClothes = new Clothes({
      ...req.body,
      clothingCategory, // Added this
      image: s3Url,
    });
    await newClothes.save();

    res.status(200).send(`File uploaded successfully. S3 URL: ${s3Url}`);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete a clothing item
app.delete("/api/clothes/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the item first to get the S3 key (if you are storing it in the 'image' field as URL)
    const item = await Clothes.findById(id);
    if (!item) {
      return res.status(404).send("Item not found.");
    }

    // Deleting from S3
    const urlParts = item.image.split("/");
    const s3Key = urlParts[urlParts.length - 1];
    const deleteParams = {
      Bucket: "wardrobe-app-clothing-uploads",
      Key: s3Key,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));

    // Deleting from MongoDB
    await Clothes.findByIdAndDelete(id);

    res.status(200).send("Item successfully deleted.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error.");
  }
});

// Save favorite outfit
app.post("/api/favorites", async (req, res) => {
  const { clothesIds } = req.body;

  const clothes = await Clothes.find({ _id: { $in: clothesIds } });

  if (clothes.length !== clothesIds.length) {
    return res.status(400).send("Invalid clothesIds.");
  }

  // Save to MongoDB
  const newFavorite = new Favorite({
    clothes: clothesIds,
  });
  await newFavorite.save();

  res
    .status(200)
    .json({
      message: "Favorite outfit saved successfully.",
      _id: newFavorite._id,
    });
});

// Remove a favorite outfit
app.delete("/api/favorites/:id", async (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;

  try {
    // Deleting from MongoDB
    await Favorite.findByIdAndDelete(id);

    res.status(200).send("Favorite outfit successfully deleted.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error.");
  }
});

// Get all clothes
app.get("/api/clothes", async (req, res) => {
  const clothes = await Clothes.find();
  res.json(clothes);
});

// Get all favorites
app.get("/api/favorites", async (req, res) => {
  const favorites = await Favorite.find().populate("clothes");
  res.json(favorites);
});

app.listen(5000, "192.168.50.139", () => {
  console.log("Server running on http://192.168.50.139:5000");
});
