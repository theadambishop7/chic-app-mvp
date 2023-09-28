import React, { useEffect, useState } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddItemModule from "./AddItemModule"; // Import the AddItemModule component
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import OutfitPiece from "./OutfitPiece";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import axios from "axios";
import MyCloset from "./MyCloset";

const wardrobeAPI = "http://192.168.50.139:5000";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
        },
        sharpBottomCorners: {
          // Add this class
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: "0", // This will keep the AppBar corners square
        },
      },
    },
  },

  palette: {
    primary: {
      main: "#53009A",
    },
    secondary: {
      main: "#a9006a",
    },
    terciary: {
      main: "#f5f5f5",
    },
    background: {
      main: "#fafaff",
    },
  },
  typography: {
    fontFamily: "Montserrat",
    h2: {
      fontSize: "240px",
      fontWeight: 600,
    },
  },
});

const App = () => {
  const [userName, setUserName] = useState("Abby");
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [wardrobe, setWardrobe] = useState([]);
  const [groupedWardrobe, setGroupedWardrobe] = useState({});
  const [lockedItems, setLockedItems] = useState([]);
  const [showCloset, setShowCloset] = useState(false);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [favoriteFlag, setFavoriteFlag] = useState(false);
  const [favoritesActive, setFavoritesActive] = useState(false);
  const [currentFavoriteIndex, setCurrentFavoriteIndex] = useState(0);

  // const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [lastPickedItems, setLastPickedItems] = useState({
    Top: null,
    Bottom: null,
    "Complete Outfit": null,
    PairShoes: null,
  });

  const prevFavoritedOutfit = () => {
    if (currentFavoriteIndex > 0) {
      const newIndex = currentFavoriteIndex - 1;
      setCurrentFavoriteIndex(newIndex);
      setSelectedItems(favoriteOutfits[newIndex].clothes);
    }
  };

  const nextFavoritedOutfit = () => {
    if (currentFavoriteIndex < favoriteOutfits.length - 1) {
      const newIndex = currentFavoriteIndex + 1;
      setCurrentFavoriteIndex(newIndex);
      setSelectedItems(favoriteOutfits[newIndex].clothes);
    }
  };

  const loadFirstFavorite = () => {
    fetchFavorites();
    setCurrentFavoriteIndex(0);
    if (favoriteOutfits.length > 0) {
      setLockedItems([]);
      setFavoritesActive(true);
      setSelectedItems(favoriteOutfits[0].clothes);
    } else {
      handleTooltipOpen();
    }
  };

  const handleCloseOutfit = () => {
    setSelectedItems([]);
    setLockedItems([]);
    setFavoritesActive(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleClick = (event) => {
    setAnchorEl((prev) => event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement your logout logic here
    handleClose();
  };

  const handleMyClosetItems = () => {
    handleClose();
    setShowCloset(!showCloset);
  };

  const pickRandomItem = (items) => {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  };

  const pickUniqueRandomItem = (items, lastPickedItem) => {
    if (items.length === 1) {
      return items[0];
    }

    let newItem;
    do {
      newItem = pickRandomItem(items);
    } while (newItem === lastPickedItem);

    return newItem;
  };

  const generateOutfit = () => {
    setFavoriteFlag(false);
    setFavoritesActive(false);
    let outfit = [...lockedItems]; // Start with any locked items

    const isTopLocked = lockedItems.some(
      (item) => item.clothingCategory === "Top"
    );
    const isBottomLocked = lockedItems.some(
      (item) => item.clothingCategory === "Bottom"
    );
    const isCompleteOutfitLocked = lockedItems.some(
      (item) => item.clothingCategory === "Complete Outfit"
    );
    const isPairShoesLocked = lockedItems.some(
      (item) => item.type === "PairShoes"
    );

    const availableTops = wardrobe.filter(
      (item) => item.clothingCategory === "Top" && !lockedItems.includes(item)
    );
    const availableBottoms = wardrobe.filter(
      (item) =>
        item.clothingCategory === "Bottom" && !lockedItems.includes(item)
    );
    const availableCompleteOutfits = wardrobe.filter(
      (item) =>
        item.clothingCategory === "Complete Outfit" &&
        !lockedItems.includes(item)
    );
    const availablePairShoes = wardrobe.filter(
      (item) => item.type === "PairShoes" && !lockedItems.includes(item)
    );
    let newLastPickedItems = { ...lastPickedItems };

    if (isTopLocked && isBottomLocked) {
      if (!isPairShoesLocked) {
        const newItem = pickUniqueRandomItem(
          availablePairShoes,
          lastPickedItems.PairShoes
        );
        outfit.push(newItem);
        newLastPickedItems.PairShoes = newItem;
      }
    } else if (isCompleteOutfitLocked) {
      if (!isPairShoesLocked) {
        const newItem = pickUniqueRandomItem(
          availablePairShoes,
          lastPickedItems.PairShoes
        );
        outfit.push(newItem);
        newLastPickedItems.PairShoes = newItem;
      }
    } else {
      if (!isTopLocked && !isBottomLocked) {
        if (Math.random() < 0.5 && availableCompleteOutfits.length > 0) {
          const newItem = pickUniqueRandomItem(
            availableCompleteOutfits,
            lastPickedItems["Complete Outfit"]
          );
          outfit.push(newItem);
          newLastPickedItems["Complete Outfit"] = newItem;
        } else {
          if (availableTops.length > 0) {
            const newItem = pickUniqueRandomItem(
              availableTops,
              lastPickedItems.Top
            );
            outfit.push(newItem);
            newLastPickedItems.Top = newItem;
          }
          if (availableBottoms.length > 0) {
            const newItem = pickUniqueRandomItem(
              availableBottoms,
              lastPickedItems.Bottom
            );
            outfit.push(newItem);
            newLastPickedItems.Bottom = newItem;
          }
        }
      } else if (isTopLocked && !isBottomLocked) {
        if (availableBottoms.length > 0) {
          const newItem = pickUniqueRandomItem(
            availableBottoms,
            lastPickedItems.Bottom
          );
          outfit.push(newItem);
          newLastPickedItems.Bottom = newItem;
        }
      } else if (!isTopLocked && isBottomLocked) {
        if (availableTops.length > 0) {
          const newItem = pickUniqueRandomItem(
            availableTops,
            lastPickedItems.Top
          );
          outfit.push(newItem);
          newLastPickedItems.Top = newItem;
        }
      }

      if (!isPairShoesLocked) {
        const newItem = pickUniqueRandomItem(
          availablePairShoes,
          lastPickedItems.PairShoes
        );
        outfit.push(newItem);
        newLastPickedItems.PairShoes = newItem;
      }
    }

    const sortedOutfit = outfit.sort((a, b) => {
      const order = ["Top", "Bottom", "Complete Outfit", "PairShoes"];
      return (
        order.indexOf(a.clothingCategory) - order.indexOf(b.clothingCategory)
      );
    });

    setSelectedItems(sortedOutfit);
    setLastPickedItems(newLastPickedItems);
  };

  const handleLockToggle = (item) => {
    if (lockedItems.some((lockedItem) => lockedItem._id === item._id)) {
      setLockedItems(
        lockedItems.filter((lockedItem) => lockedItem._id !== item._id)
      );
    } else {
      setLockedItems([...lockedItems, item]);
    }
  };

  const fetchWardrobe = async () => {
    const response = await fetch(`${wardrobeAPI}/api/clothes`);
    const data = await response.json();
    setWardrobe(data);
  };

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  function isFavoriteOutfit(selectedItems) {
    return favoriteOutfits.some((outfit) => {
      const outfitClothes = outfit.clothes;
      return outfitClothes.every((item) => {
        return selectedItems.some(
          (selectedItem) => selectedItem._id === item._id
        );
      });
    });
  }

  async function handleFavorite() {
    const selectedItemsIds = selectedItems.map((item) => item._id); // Assuming each item has an _id property
    const isFavorited = isFavoriteOutfit(selectedItems);
    if (favoriteOutfits.length >= 10 && !isFavorited) {
      return;
    }

    if (isFavorited) {
      // Remove from local state
      const newFavoriteOutfits = favoriteOutfits.filter(
        (outfit) =>
          !outfit.clothes.every((item) => selectedItemsIds.includes(item._id))
      );
      setFavoriteOutfits(newFavoriteOutfits);

      // Remove from server
      try {
        const outfitToRemove = favoriteOutfits.find((outfit) =>
          outfit.clothes.every((item) => selectedItemsIds.includes(item._id))
        );

        if (outfitToRemove && outfitToRemove._id) {
          await axios.delete(
            `${wardrobeAPI}/api/favorites/${outfitToRemove._id}`
          );
        }
      } catch (error) {
        console.error("Failed to delete favorite outfit", error);
      }
    } else {
      // Save to server
      try {
        const response = await axios.post(`${wardrobeAPI}/api/favorites`, {
          clothesIds: selectedItemsIds,
        });
        // Save to local state
        const newFavoriteOutfit = {
          _id: response.data._id,
          clothes: selectedItems,
        }; // Assuming server returns the new _id
        setFavoriteOutfits([...favoriteOutfits, newFavoriteOutfit]);
      } catch (error) {
        console.error("Failed to save favorite outfit", error);
      }
    }

    setFavoritesActive(false);
  }

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${wardrobeAPI}/api/favorites`);
      const data = response.data;
      console.log("Favorites", data);
      setFavoriteOutfits(data);
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    // Group the items by their type (or any other category you have)
    const groups = {};
    wardrobe.forEach((item) => {
      const group = item.type;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });
    setGroupedWardrobe(groups);
  }, [wardrobe]);

  return (
    <ThemeProvider theme={theme}>
      <Container
        className="app"
        color="secondary"
        style={{ minHeight: "100vh" }}
      >
        <AppBar position="absolute" color="background">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              <img
                onClick={() => setShowCloset(false)}
                className="logo"
                src="https://wardrobe-app-clothing-uploads.s3.us-west-2.amazonaws.com/chic-logo.png"
                alt="logo"
                style={{ height: "50px" }}
              />
            </Typography>
            <IconButton edge="end" color="inherit" onClick={handleClick}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleMyClosetItems}>My Closet Items</MenuItem>
              <MenuItem onClick={handleLogout}>LogOut</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <div>
          {showCloset && (
            <MyCloset
              fetchWardrobe={fetchWardrobe}
              groupedWardrobe={groupedWardrobe}
            />
          )}
        </div>
        {!showCloset && (
          <>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <ClickAwayListener onClickAway={handleTooltipClose}>
                <div>
                  <Tooltip
                    color="secondary"
                    arrow={true}
                    PopperProps={{
                      disablePortal: true,
                    }}
                    onClose={handleTooltipClose}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="No Favorites Yet!"
                    leaveDelay={200}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      style={{ marginTop: "20px" }}
                      onClick={loadFirstFavorite}
                    >
                      <FavoriteBorderIcon style={{ marginRight: "5px" }} />
                      <span style={{ fontWeight: "600", marginLeft: "5px" }}>
                        {favoriteOutfits.length}
                      </span>
                    </Button>
                  </Tooltip>
                </div>
              </ClickAwayListener>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: "20px" }}
                onClick={generateOutfit}
              >
                Generate Random Outfit
              </Button>
            </Stack>
            <Paper
              sx={{ fontFamily: theme.typography.fontFamily }}
              color="secondary"
              elevation={3}
              style={{
                padding: "5px 20px 15px",
                marginTop: "20px",
                backgroundColor: "#fafaff",
              }}
            >
              {selectedItems.length > 0 ? (
                <>
                  <Stack
                    direction="column"
                    justifyContent="flex-start"
                    spacing={0}
                    mb={2}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" alignContent="center" spacing={0}>
                        <h2>
                          {isFavoriteOutfit(selectedItems)
                            ? "Favorite"
                            : "Random"}{" "}
                          Outfit
                        </h2>
                        <>
                          <IconButton onClick={handleFavorite}>
                            {isFavoriteOutfit(selectedItems) ? (
                              <FavoriteIcon color="secondary" />
                            ) : (
                              <FavoriteBorderIcon color="secondary" />
                            )}
                          </IconButton>
                        </>
                      </Stack>

                      <IconButton onClick={handleCloseOutfit}>
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                    {favoritesActive ? (
                      <Stack direction="row" justifyContent="space-between">
                        <span>
                          <Button
                            variant="outlined"
                            onClick={prevFavoritedOutfit}
                            disabled={currentFavoriteIndex === 0}
                          >
                            <ArrowBackIosIcon />
                          </Button>
                        </span>
                        <span>
                          <Button
                            variant="outlined"
                            onClick={nextFavoritedOutfit}
                            disabled={
                              currentFavoriteIndex ===
                              favoriteOutfits.length - 1
                            }
                          >
                            <ArrowForwardIosIcon />
                          </Button>
                        </span>
                      </Stack>
                    ) : null}
                    <span>
                      <Stack
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={1}
                      ></Stack>
                    </span>
                  </Stack>
                </>
              ) : (
                <>
                  <h3>Welcome {userName}!</h3>{" "}
                  <p>Let's pick your outfit for today.</p>
                </>
              )}

              {selectedItems.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px", // You can change this as needed
                  }}
                >
                  {selectedItems.map((item, index) => (
                    <OutfitPiece
                      key={index}
                      item={item}
                      onLockToggle={handleLockToggle}
                      isLocked={lockedItems.some(
                        (lockedItem) => lockedItem._id === item._id
                      )}
                    />
                  ))}
                </div>
              )}
            </Paper>
          </>
        )}

        <IconButton
          onClick={toggleDrawer}
          className="btn-add"
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main,
            marginTop: "20px",
            color: "white",
          }}
        >
          <AddIcon />
        </IconButton>
        <AddItemModule
          fetchWardrobe={fetchWardrobe}
          open={isDrawerOpen}
          onClose={toggleDrawer}
          setWardrobe={setWardrobe}
        />
      </Container>
    </ThemeProvider>
  );
};

export default App;
