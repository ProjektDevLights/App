import { faChevronLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  createStackNavigator,
  StackHeaderLeftButtonProps,
  TransitionPresets,
} from "@react-navigation/stack";
import * as React from "react";
import { useTheme } from "react-native-paper";
import { AlarmStackParamList } from "../../interfaces/types";
import AlarmPattern from "../AlarmPattern";
import Alarms from "../Alarms";
import ColorPicker from "../ColorPicker";
import CustomScreen from "../CustomScreen";
import Icon from "../Icon";

export default function AlarmNavigator(): JSX.Element {
  const Stack = createStackNavigator<AlarmStackParamList>();
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        headerStyle: { height: 100, elevation: 0 },
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTitleAlign: "left",
          headerStyle: {
            elevation: 0,
          },
        }}
        name="home"
        component={Alarms}
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
        name="alarm_pattern"
        component={AlarmPattern}
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
    </Stack.Navigator>
  );
}
