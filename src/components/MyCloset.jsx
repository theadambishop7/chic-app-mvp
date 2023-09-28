import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { styled, useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

function MyCloset({ groupedWardrobe, fetchWardrobe }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const categoryDisplayName = {
    PairShoes: "Shoes",
    Shirt: "Shirts",
    Dress: "Dresses",
    Skirt: "Skirts",
    // add more categories as needed
  };
  const theme = useTheme();

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const deleteItemFromDB = async (id) => {
    try {
      // Replace the URL and port number with your server's
      const response = await fetch(
        `http://192.168.50.139:5000/api/clothes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 200) {
        console.log("Item successfully deleted");
      } else {
        console.log("Failed to delete item");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleConfirmDelete = async () => {
    // Check if selectedItem exists
    if (selectedItem && selectedItem._id) {
      // Delete the item from the database
      await deleteItemFromDB(selectedItem._id);
    }

    setShowConfirmDelete(false);
    setSelectedItem(null);

    // Fetch the updated wardrobe list
    fetchWardrobe();
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {Object.keys(groupedWardrobe).map((group, index) => (
        <Accordion
          key={index}
          expanded={expanded === `panel${index}`}
          onChange={handleAccordionChange(`panel${index}`)}
          sx={{ backgroundColor: theme.palette.background.main }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            <Typography fontSize={20}>
              {categoryDisplayName[group] || group}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div style={{ fontFamily: "Montserrat" }}>
              {groupedWardrobe[group].map((item) => (
                <Card
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  style={{ marginBottom: "16px" }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      spacing={4}
                    >
                      <img src={item.image} alt={item.name} height={50} />
                      <span>{item.name}</span>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog
        open={!!selectedItem}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          style={{
            display: "grid",
            gridTemplateColumns: "4fr 1fr",
            alignItems: "center",
          }}
        >
          <span style={{ padding: "0px", fontWeight: "400" }}>
            {selectedItem?.name}
          </span>
          <IconButton
            style={{ justifySelf: "end", padding: "0px" }}
            aria-label="delete"
            onClick={handleDeleteClick}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "20px" }}>
              <img
                src={selectedItem?.image}
                alt={selectedItem?.name}
                height={150}
              />
            </div>
            <div>
              <DialogContentText id="alert-dialog-description">
                <span style={{ fontWeight: "600" }}>Type:</span>{" "}
                {selectedItem?.type} <br />
                <span style={{ fontWeight: "600" }}>Color:</span>{" "}
                {selectedItem?.color} <br />
                <span style={{ fontWeight: "600" }}>Pattern:</span>{" "}
                {selectedItem?.pattern} <br />
                {/* ... and so on */}
              </DialogContentText>
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this item?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDelete(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MyCloset;
