import { Light } from "@devlights/types";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import {
  Animated,
  Dimensions,
  I18nManager,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Headline, useTheme } from "react-native-paper";
import Powerbulb from "../Powerbulb";
import getContrastTextColor from "../textContrast";

export interface CardProps {
  light: Light;
}

export default function LightCard(props: CardProps): JSX.Element {
  const theme: ReactNativePaper.Theme = useTheme();
  const { light } = props;
  const { colors } = light.leds;
  const swipeableRef = React.useRef<Swipeable>(null);
  const styles = StyleSheet.create({
    card: {
      width: "100%",
      height: "100%",
      elevation: 20,
      zIndex: 1,
    },
    headline: {
      marginTop: theme.spacing(4),
      marginLeft: theme.spacing(4),
      color: light.isOn ? getContrastTextColor(colors[0]) : "#fff",
    },
    touchable: {
      width: "100%",
      height: "100%",
      zIndex: 1,
    },
    animated_view: {
      flex: 1,
      backgroundColor: theme.colors.grey,
      alignItems: "center",
      alignContent: "center",
      justifyContent: "center",
    },
    text: {
      color: "white",
      fontSize: 16,
      backgroundColor: "transparent",
      padding: 10,
    },
    action_container: {
      width: 80,
      flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    },
    swipeable: {
      height: 120,
      width: Dimensions.get("window").width * 0.8,
      backgroundColor: theme.colors.grey,
      marginTop: 15,
      borderRadius: 12,
    },
    button: { alignItems: "center", justifyContent: "center", flex: 1 },
  });

  const renderRightAction = (
    x: number,
    progress: Animated.AnimatedInterpolation,
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    return (
      <View style={styles.action_container}>
        <Animated.View
          style={[styles.animated_view, { transform: [{ translateX: trans }] }]}
        >
          <Powerbulb
            onPress={() => swipeableRef.current?.close()}
            id={light.id}
          />
        </Animated.View>
      </View>
    );
  };

  const navigation = useNavigation();
  const onPress = (): void => {
    navigation.navigate("light", {
      id: light.id,
    });
  };
  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={styles.swipeable}
      renderRightActions={(progress: Animated.AnimatedInterpolation) =>
        renderRightAction(80, progress)
      }
    >
      <TouchableWithoutFeedback style={styles.touchable} onPress={onPress}>
        <LinearGradient
          style={styles.card}
          colors={
            light.isOn
              ? [colors[0], colors[1] ? colors[1] : colors[0]]
              : ["#000", "#000"]
          }
          start={[0.25, 0.25]}
          end={[0.75, 0.75]}
        >
          <Headline style={styles.headline}>
            {light.name ?? "Name not avaible"}
          </Headline>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </Swipeable>
  );
}
