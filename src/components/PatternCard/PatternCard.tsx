/* eslint-disable no-nested-ternary */
import { CustomData, Leds, Light, Pattern } from "@devlights/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { Component } from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Headline, useTheme } from "react-native-paper";
import { getCardColor, rainbow } from "../../utils";
import getContrastTextColor from "../textContrast";

export type PatternCardProps = Partial<Light> & {
  rootStyle?: StyleProp<ViewStyle>;
  headlineStyle?: StyleProp<TextStyle>;
};

function PatternCard(props: PatternCardProps) {
  const theme = useTheme();
  const { leds, custom_sequence, isOn, name, rootStyle, headlineStyle } = props;
  console.log(leds);
  const styles = StyleSheet.create({
    card: StyleSheet.flatten([
      {
        width: "100%",
        height: "100%",
        zIndex: 1,
      },
      rootStyle,
    ]),
    headline: StyleSheet.flatten([
      {
        position: "absolute",
        zIndex: 10,
        color:
          leds?.pattern === "rainbow" && isOn
            ? "#000"
            : getContrastTextColor(
                isOn
                  ? leds?.colors && leds.colors.length > 0
                    ? leds.colors[0]
                    : "#000"
                  : "#000",
              ),
      },
      headlineStyle,
    ]),
    rainbow_container: {
      flex: 1,
      flexDirection: "row",
    },
    rainbow_view: {
      flex: 1,
    },
    custom_container: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: "#000",
    },
    custom_container_inner: {
      flex: 1,
      flexDirection: "row",
    },
  });
  return (
    <View style={styles.card}>
      {leds?.pattern !== "rainbow" && leds?.pattern !== "custom" ? (
        <LinearGradient
          style={styles.card}
          colors={getCardColor({ ...props } as Light)}
          start={[0.25, 0.25]}
          end={[0.75, 0.75]}
        >
          <Headline style={styles.headline}>
            {name ?? "Name not avaible"}
          </Headline>
        </LinearGradient>
      ) : leds.pattern === "rainbow" ? (
        <View
          style={{
            borderColor: "red",
            borderRadius: 12,
            height: "100%",
            width: "100%",
          }}
        >
          <View style={styles.rainbow_container}>
            {rainbow.map((c: string) => (
              <View
                key={c}
                style={{
                  ...styles.rainbow_view,
                  backgroundColor: isOn ? c : "#000",
                }}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.custom_container}>
          {custom_sequence?.map((c: CustomData) => (
            <View style={{ flex: c.repeat, flexDirection: "row" }}>
              {c.leds.map((col: string) => (
                <View
                  style={{
                    backgroundColor: isOn ? col : "#000",
                    flex: c.repeat / c.leds.length,
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default PatternCard;
