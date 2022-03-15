import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { Appearance } from "react-native";
import { Provider } from "react-native-paper";
import { Theme } from "../../interfaces/types";
import {
  darkTheme as darkFunction,
  lightTheme as lightFunction,
} from "../theme";

export interface ThemeProviderProps {
  children: JSX.Element;
}

export const ThemeContext = React.createContext<{
  type: Theme;
  changeTheme(type: Theme): Promise<void>;
}>({ changeTheme: () => new Promise<void>((): void => {}) });

export function useThemeChange(): React.ContextType<typeof ThemeContext> {
  return React.useContext<{ changeTheme(type: Theme): Promise<void> }>(
    ThemeContext,
  );
}

export default function ThemeProvider(props: ThemeProviderProps): JSX.Element {
  const { children } = props;
  const [type, setType] = React.useState<Theme>("Dark");
  const [theme, setStateTheme] = React.useState<ReactNativePaper.Theme>();
  const colorScheme = Appearance.getColorScheme();

  const changeTheme = async (type: Theme) => {
    if (
      type === "Dark" ||
      (type === "System-Default" && colorScheme === "dark")
    ) {
      await darkFunction().then((t) => {
        setStateTheme(t);
      });
    } else if (
      type === "Light" ||
      (type === "System-Default" && colorScheme === "light")
    ) {
      await lightFunction().then((t) => {
        setStateTheme(t);
      });
    }
    setType(type);
    AsyncStorage.setItem("themeType", type);
  };

  return (
    <ThemeContext.Provider value={{ type, changeTheme }}>
      <Provider theme={theme}>{children}</Provider>
    </ThemeContext.Provider>
  );
}
