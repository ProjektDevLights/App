import * as React from "react";
import { FavouritesContext, FavouritesContextType } from "./FavouritesProvider";

export default function useFavourites(): React.ContextType<
  typeof FavouritesContext
> {
  return React.useContext<FavouritesContextType>(FavouritesContext);
}
