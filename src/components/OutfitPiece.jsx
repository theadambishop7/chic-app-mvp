import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

const OutfitPiece = ({ item, onLockToggle, isLocked }) => {
  return (
    <Card style={{ maxWidth: "200px", margin: "10px" }}>
      <CardMedia
        component="img"
        alt={item.name}
        height="140"
        image={item.image}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {item.name}
        </Typography>
      </CardContent>
      <IconButton onClick={() => onLockToggle(item)}>
        {isLocked ? <LockIcon /> : <LockOpenIcon />}
      </IconButton>
    </Card>
  );
};

export default OutfitPiece;
