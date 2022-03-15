import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";

export type Gradient = { start: string; end: string };

export type FavouritesContextType = {
  colors: string[];
  gradients: Gradient[];
  addColor: (c: string) => void;
  addGradient: (g: Gradient) => void;
  removeColor: (c: string) => void;
  removeGradient: (g: Gradient) => void;
};

export const FavouritesContext = React.createContext<FavouritesContextType>({
  colors: [],
  gradients: [],
  addColor: (c: string) => undefined,
  addGradient: (g: Gradient) => undefined,
  removeColor: (c: string) => undefined,
  removeGradient: (g: Gradient) => undefined,
});

function FavouritesProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [gradients, setGradients] = useState<Gradient[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const fetch = async () => {
    const favouriteColors: string | null = await AsyncStorage.getItem(
      "favouriteColors",
    );
    const favouriteGradients: string | null = await AsyncStorage.getItem(
      "favouriteGradients",
    );

    setGradients(Array.from(JSON.parse(favouriteGradients ?? "[]")));
    setColors(Array.from(JSON.parse(favouriteColors ?? "[]")));
  };

  const addColor = (color: string) => {
    const newColors = [...colors, color];

    setColors(newColors);
    AsyncStorage.setItem("favouriteColors", JSON.stringify(newColors));
  };

  const addGradient = (gradient: Gradient) => {
    const newGradients = [...gradients, gradient];
    setGradients(newGradients);
    AsyncStorage.setItem("favouriteGradients", JSON.stringify(newGradients));
  };

  const removeColor = (color: string) => {
    const index = colors.findIndex((c: string) => c === color);
    if (index > -1) {
      colors.splice(index, 1);
      setColors(colors);
      AsyncStorage.setItem("favouriteColors", JSON.stringify(colors));
    }
  };

  const removeGradient = (gradient: Gradient) => {
    const index = gradients.findIndex(
      (g: Gradient) => g.end === gradient.end && g.start === gradient.start,
    );
    if (index > -1) {
      gradients.splice(index);
      setGradients(gradients);
      AsyncStorage.setItem("favouriteGradients", JSON.stringify(gradients));
    }
  };

  React.useEffect(() => {
    fetch();
  }, []);
  return (
    <FavouritesContext.Provider
      value={{
        colors,
        gradients,
        addColor,
        addGradient,
        removeColor,
        removeGradient,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export default FavouritesProvider;
