import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavouriteColorsAction } from "../types/favouriteColors";
import { ADD_FAVOURITE_COLOR, REMOVE_FAVOURITE_COLOR, SET_FAVOURITE_COLORS } from "../types/types";
import defaultstate from "../defaultstate";

function favouritesReducer(
  state = defaultstate.favouriteColors,
  action: FavouriteColorsAction,
): string[] {
  let favourites;
  let favourite;
  let index;
  switch (action.type) {
    case SET_FAVOURITE_COLORS:
      favourites = action.favourites;
      return favourites;
    case ADD_FAVOURITE_COLOR:
      favourites = [...state];
      favourite = favourites.find((f) => f === action.favourite);
      if (favourite === undefined) favourites = [...favourites, action.favourite];
      AsyncStorage.setItem("favouriteColors", JSON.stringify(favourites));
      return favourites;
    case REMOVE_FAVOURITE_COLOR:
      favourites = [...state];
      index = favourites.findIndex((f) => f === action.favourite);
      if (index !== undefined) {
        favourites.splice(index, 1);
        AsyncStorage.setItem("favouriteColors", JSON.stringify(favourites));
      }
      return favourites;
    default:
      return state;
  }
}
export default favouritesReducer;
