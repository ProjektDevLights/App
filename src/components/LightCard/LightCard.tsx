/* eslint-disable no-nested-ternary */
import { CustomData, Light } from "@devlights/types";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Headline, useTheme } from "react-native-paper";
import { getCardColor, rainbow } from "../../utils";
import PatternCard from "../PatternCard/PatternCard";
import Powerbulb from "../Powerbulb";
import getContrastTextColor from "../textContrast";

export interface CardProps {
  light: Light;
  onLongPress?: () => void;
}

export default function LightCard(props: CardProps): JSX.Element {
  const theme: ReactNativePaper.Theme = useTheme();
  const navigation = useNavigation();
  const { light, onLongPress } = props;
  const { colors, pattern } = light.leds;
  const swipeableRef = React.useRef<Swipeable>(null);

  const onPress = (): void => {
    navigation.navigate("light", {
      id: light.id,
    });
  };

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
      position: "absolute",
      zIndex: 10,
      color:
        pattern === "rainbow" && light.isOn
          ? "#000"
          : getContrastTextColor(
              light.isOn ? (colors ? colors[0] : "#000") : "#000",
            ),
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

  const renderAction = (
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
            onBulbPress={() => swipeableRef.current?.close()}
            ids={[light.id]}
            type="light"
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={styles.swipeable}
      renderRightActions={(p) => renderAction(80, p)}
    >
      <TouchableOpacity
        onLongPress={onLongPress}
        style={styles.touchable}
        onPress={onPress}
      >
        <Headline style={styles.headline}>
          {light.name ?? "Name not avaible"}
        </Headline>
        <PatternCard
          {...light}
          headlineStyle={{
            marginTop: theme.spacing(4),
            marginLeft: theme.spacing(4),
          }}
          rootStyle={{ elevation: 20 }}
        />
      </TouchableOpacity>
    </Swipeable>
  );
}
