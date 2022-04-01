import * as SplashScreen from "expo-splash-screen";
import "intl";
import "intl/locale-data/jsonp/en";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./components/Navigation/Navigation";
import SafeAreaView from "./components/SafeAreaView";
import ThemeProvider from "./components/ThemeDialog/ThemeProvider";
import AlarmsProvider from "./hooks/useAlarms";
import FavouritesProvider from "./hooks/useFavourites";
import HostProvider from "./hooks/useHost";
import LightsProvider from "./hooks/useLights";
import SnackbarProvider from "./hooks/useSnackbar/SnackbarProvider";
import TagsProvider from "./hooks/useTags";

export default function App(): JSX.Element {
  React.useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);
  const styles = StyleSheet.create({
    root: { backgroundColor: "#000", height: "100%", width: "100%" },
  });
  return (
    <GestureHandlerRootView>
      <View style={styles.root}>
        <HostProvider>
          <SafeAreaProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <LightsProvider>
                  <AlarmsProvider>
                    <TagsProvider>
                      <FavouritesProvider>
                        <SafeAreaView>
                          <Navigation />
                        </SafeAreaView>
                      </FavouritesProvider>
                    </TagsProvider>
                  </AlarmsProvider>
                </LightsProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </HostProvider>
      </View>
    </GestureHandlerRootView>
  );
}
