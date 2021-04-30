/* eslint-disable no-nested-ternary */
import { Light } from "@devlights/types";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { max, min } from "lodash";
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
import Powerbulb from "../Powerbulb";
import getContrastTextColor from "../textContrast";

export interface CardProps {
  light: Light;
}

export default function LightCard(props: CardProps): JSX.Element {
  const theme: ReactNativePaper.Theme = useTheme();
  const navigation = useNavigation();
  const { light } = props;
  const { colors, pattern } = light.leds;
  const swipeableRef = React.useRef<Swipeable>(null);

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
            onBulbPress={() => swipeableRef.current?.close()}
            ids={[light.id]}
          />
        </Animated.View>
      </View>
    );
  };

  const getCardColor = (): string[] => {
    if (light.isOn) {
      switch (light.leds.pattern) {
        case "fading":
          return [
            "#ff0000",
            "#ffff00",
            "#00ff00",
            "#00ffff",
            "#0000ff",
            "#ff00ff",
          ];
        case "plain":
        case "runner":
        case "waking":
        case "blinking":
          return [light.leds.colors[0], light.leds.colors[0]];
        default:
          return light.leds.colors;
      }
    } else {
      return ["#000000", "#000000"];
    }
  };

  const onPress = (): void => {
    navigation.navigate("light", {
      id: light.id,
    });
  };

  const getBoxCounts = (lightCount: number): number[] => {
    const count: number = max([2, min([lightCount, 10])]) as number;
    const count1: number = Math.round(count / 2);
    return [count1, count - count1];
  };
  const getFlexAmounts = (lightcount: number): number[][] => {
    const flexAmounts: number[][] = [];
    getBoxCounts(lightcount).forEach((amount: number, index: number) => {
      switch (amount) {
        case 1:
          flexAmounts.push([5]);
          break;
        case 2:
          flexAmounts.push(index === 1 ? [2, 3] : [3, 2]);
          break;
        case 3:
          flexAmounts.push(index === 1 ? [1, 2, 2] : [2, 2, 1]);
          break;
        case 4:
          flexAmounts.push(index === 1 ? [1, 1, 2, 1] : [1, 2, 1, 1]);
          break;
        case 5:
          flexAmounts.push([1, 1, 1, 1, 1]);
          break;
        default:
          flexAmounts.push([5]);
          break;
      }
    });
    return flexAmounts;
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
          : getContrastTextColor(light.isOn ? colors[0] : "#000"),
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
    rainbow_container: {
      flex: 1,
      flexDirection: "row",
    },
    rainbow_view: {
      flex: 1,
    },
    custom_container: {
      flex: 1,
    },
    custom_container_inner: {
      flex: 1,
      flexDirection: "row",
    },
  });

  let curIndex = -1;
  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={styles.swipeable}
      renderRightActions={(progress: Animated.AnimatedInterpolation) =>
        renderRightAction(80, progress)
      }
    >
      <TouchableOpacity style={styles.touchable} onPress={onPress}>
        <Headline style={styles.headline}>
          {light.name ?? "Name not avaible"}
        </Headline>
        {light.leds.pattern !== "rainbow" && light.leds.pattern !== "custom" ? (
          <LinearGradient
            style={styles.card}
            colors={getCardColor()}
            start={[0.25, 0.25]}
            end={[0.75, 0.75]}
          >
            <Headline style={styles.headline}>
              {light.name ?? "Name not avaible"}
            </Headline>
          </LinearGradient>
        ) : light.leds.pattern === "rainbow" ? (
          <>
            <View style={styles.rainbow_container}>
              <View
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: light.isOn ? "#ff0000" : "#000",
                }}
              />
              <View
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: light.isOn ? "#ffff00" : "#000",
                }}
              />
              <View
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: light.isOn ? "#00ff00" : "#000",
                }}
              />
              <View
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: light.isOn ? "#00ffff" : "#000",
                }}
              />
              <View
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: light.isOn ? "#0000ff" : "#000",
                }}
              />
              <View
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: light.isOn ? "#ff00ff" : "#000",
                }}
              />
            </View>
          </>
        ) : (
          <View style={styles.custom_container}>
            {getFlexAmounts(light.leds.colors.length).map(
              (counts: number[]) => (
                <View style={styles.custom_container_inner}>
                  {counts.map((amount: number) => {
                    curIndex++;
                    return (
                      <View
                        style={{
                          backgroundColor: light.leds.colors[curIndex],
                          flex: amount,
                        }}
                      />
                    );
                  })}
                </View>
              ),
            )}
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}
