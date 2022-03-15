import {
  faChevronLeft,
  faStar,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigation } from "@react-navigation/native";
import {
  createStackNavigator,
  StackHeaderLeftButtonProps,
  TransitionPresets,
} from "@react-navigation/stack";
import React from "react";
import { useTheme } from "react-native-paper";
import LightProvider from "../../hooks/useLights/LightProvider";
import { LightsStackParamList } from "../../interfaces/types";
import ColorPicker from "../ColorPicker";
import CustomScreen from "../CustomScreen";
import Favourite from "../Favourite";
import Home from "../Home";
import Icon from "../Icon";
import LightScreen from "../LightScreen";

export default function LightsNavigator(): JSX.Element {
  const Stack = createStackNavigator<LightsStackParamList>();
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        headerStyle: { height: 100, elevation: 0 },
      }}
    >
      <Stack.Screen
        name="home"
        component={Home}
        options={{
          title: "Home",
          headerTitle: "",
          headerRight: () => (
            <Icon
              color="#ffff00"
              icon={faStar}
              position="right"
              onPress={() => navigation.navigate("favourite")}
            />
          ),
        }}
      />
      <Stack.Screen
        name="light"
        options={() => ({
          headerLeft: (props: StackHeaderLeftButtonProps) => (
            <Icon
              color={theme.colors.accent}
              position="left"
              icon={faChevronLeft}
              {...props}
            />
          ),
          headerTitle: "",
          gestureEnabled: true,
          gestureResponseDistance: { vertical: 200 },
          ...TransitionPresets.SlideFromRightIOS,
        })}
        // @ts-ignore
        // eslint-disable-next-line react/no-children-prop
        children={({ route }) => {
          const { id } = route.params;
          return (
            <LightProvider id={id}>
              <LightScreen />
            </LightProvider>
          );
        }}
      />
      <Stack.Screen
        name="color_modal"
        options={{
          headerLeft: (props: StackHeaderLeftButtonProps) => (
            <Icon
              color={theme.colors.accent}
              position="left"
              icon={faTimes}
              {...props}
            />
          ),
          headerTitle: "",
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
        component={ColorPicker}
      />
      <Stack.Screen
        name="custom"
        component={CustomScreen}
        options={{
          headerTitle: "Create Custom Pattern",
          headerLeft: (props: StackHeaderLeftButtonProps) => (
            <Icon
              color={theme.colors.accent}
              position="left"
              icon={faChevronLeft}
              {...props}
            />
          ),
        }}
      />

      <Stack.Screen
        options={{
          headerTitle: "Favourites",
          headerTitleAlign: "center",
          headerTitleStyle: {
            marginTop: 10,
          },
          headerLeft: (props: StackHeaderLeftButtonProps) => (
            <Icon
              color={theme.colors.accent}
              icon={faTimes}
              position="left"
              {...props}
            />
          ),
        }}
        name="favourite"
        component={Favourite}
      />
    </Stack.Navigator>
  );
}
