import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { Ring } from "@uiball/loaders";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const AddItemModule = ({ open, onClose, setWardrobe, fetchWardrobe }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    professional: false,
    color: "",
    pattern: "",
    image: null,
  });
  const [image, setImage] = useState(null);
  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, professional: e.target.checked });
  };

  const compressImage = (image, maxWidth, maxHeight, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          // Convert Blob to File, maintaining the .jpg extension
          resolve(blobToFile(blob, "compressed_image.jpg"));
        },
        "image/jpeg",
        quality
      );
    });
  };

  const blobToFile = (blob, fileName) => {
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    return blob;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5 MB");
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        compressImage(img, 1280, 1280)
          .then((compressedFile) => {
            setImage(compressedFile);
          })
          .catch((error) => {
            console.error("Image compression failed:", error);
          });
      };
    }
  };

  const removeImage = () => {
    setImage(null);
    setFormData({ ...formData, image: null });
  };

  const uploadItem = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      form.append("image", image, image.name); // Notice the third parameter `image.name` which is the name of the File object.

      const response = await axios.post(
        "http://192.168.50.139:5000/upload",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(`File uploaded successfully. S3 URL: ${response.data}`);

      const newItem = {
        name: formData.name,
        type: formData.type,
        professional: formData.professional,
        color: formData.color,
        pattern: formData.pattern,
        image: response.data,
      };
      setWardrobe((prevItems) => [...prevItems, newItem]);
      onClose();
      setIsLoading(false);
      fetchWardrobe();
      // clear form
      setFormData({
        name: "",
        type: "",
        professional: false,
        color: "",
        pattern: "",
        image: null,
      });
    } catch (error) {
      console.log("An error occurred:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
        },
      }}
    >
      <div style={{ padding: "20px", minHeight: "50vh" }}>
        <TextField
          name="name"
          label="Name"
          variant="outlined"
          fullWidth
          onChange={handleChange}
          className="input-add"
        />
        <FormControl variant="outlined" fullWidth className="input-add">
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <MenuItem value="Shirt">Shirt</MenuItem>
            <MenuItem value="Dress">Dress</MenuItem>
            <MenuItem value="Pants">Pants</MenuItem>
            <MenuItem value="Skirt">Skirt</MenuItem>
            <MenuItem value="Shorts">Shorts</MenuItem>
            <MenuItem value="PairShoes">Shoes</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={formData.professional}
              onChange={handleSwitchChange}
              className="input-add"
            />
          }
          label="Professional"
        />
        <div style={{ marginBottom: "15px" }}>
          <Button
            onChange={handleImageChange}
            component="label"
            variant="contained"
            className="input-add"
            startIcon={<CloudUploadIcon />}
            color="primary"
          >
            Upload Image
            <VisuallyHiddenInput type="file" capture="environment" />
          </Button>
        </div>
        {image && (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              style={{ marginBottom: "15px", height: "100px" }}
            />
            <CancelIcon onClick={removeImage} color="warning" />
          </div>
        )}
        <TextField
          name="color"
          label="Color"
          variant="outlined"
          fullWidth
          onChange={handleChange}
          className="input-add"
        />
        <TextField
          name="pattern"
          label="Pattern"
          variant="outlined"
          fullWidth
          onChange={handleChange}
          className="input-add"
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {error && (
            <div style={{ color: theme.palette.error.main }}>{error}</div>
          )}
          <Button variant="contained" color="primary" onClick={uploadItem}>
            {isLoading ? <Ring size={24.5} color="white" /> : "Submit"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default AddItemModule;
