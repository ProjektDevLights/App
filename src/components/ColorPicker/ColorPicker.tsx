import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as fullstar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import WheelColorPicker from "react-native-wheel-color-picker";
import tinycolor from "tinycolor2";
import { useFavourites } from "../../hooks/useFavourites";
import { LightsStackParamList } from "../../interfaces/types";
import FavouriteList from "../FavouriteList";

export type ColorModalScreenNavigationProp = StackNavigationProp<
  LightsStackParamList,
  "color_modal"
>;

export type ColorModalScreenRouteProp = RouteProp<
  LightsStackParamList,
  "color_modal"
>;

export default function ColorPicker(): JSX.Element {
  const route = useRoute<ColorModalScreenRouteProp>();
  const ref = React.useRef<WheelColorPicker>(null);
  const { color: currentColor } = route.params;
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors: favouriteColors, removeColor, addColor } = useFavourites();
  /* const [hsv, setHsv] = React.useState<ColorFormats.HSV>(
    tinycolor(color ?? "#fff").toHsv(),
  ); */
  const [color, setColor] = React.useState(currentColor ?? "#fff");
  const [icon, setIcon] = React.useState<IconProp>(faStar);

  const { colors } = theme;
  const saveColor = () => {
    if (favouriteColors.includes(tinycolor.fromRatio(color).toHexString())) {
      removeColor(tinycolor.fromRatio(color).toHexString());
      setIcon(faStar);
    } else {
      addColor(tinycolor.fromRatio(color).toHexString());
      setIcon(fullstar);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    colorWheelContainer: { alignSelf: "center", height: "50%", width: "70%" },
    button: {
      marginTop: 20,
    },
    icon: {
      marginRight: 20,
    },
  });

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.icon} onPress={() => saveColor()}>
          <FontAwesomeIcon color={theme.colors.accent} size={30} icon={icon} />
        </Pressable>
      ),
    });
  }, [icon]);

  React.useEffect(() => {
    if (favouriteColors.includes(tinycolor.fromRatio(color).toHexString())) {
      setIcon(fullstar);
    } else {
      setIcon(faStar);
    }
  }, [color]);

  const onPress = (prop: string) => {
    const newColor = tinycolor.fromRatio(prop).toHexString();
    setColor(newColor);
    if (icon === faStar) setIcon(fullstar);
  };

  const onSubmit = async () => {
    const success = await route.params.onSubmit(
      tinycolor.fromRatio(color).toHexString(),
      //@ts-ignore
      route.params.index,
    );
    if (success) {
      navigation.goBack();
    } else {
      setColor(tinycolor(currentColor).toHexString());
    }
  };

  return (
    <View style={styles.container}>
      <FavouriteList onPress={onPress} />
      <View style={styles.colorWheelContainer}>
        <WheelColorPicker
          color={color}
          onColorChangeComplete={(c) => setColor(c)}
          ref={ref}
          palette={favouriteColors}
          thumbSize={40}
          sliderSize={20}
          noSnap
          row={false}
          swatches={false}
        />
      </View>
      <Text style={styles.button}>
        Current color:
        {tinycolor.fromRatio(color).toHexString()}
      </Text>
      <Button
        disabled={tinycolor.fromRatio(color).toHexString() === currentColor}
        style={styles.button}
        color={
          tinycolor.fromRatio(color).toHexString() !== ""
            ? tinycolor.fromRatio(color).toHexString()
            : color
        }
        onPress={onSubmit}
        mode="contained"
      >
        Save color
      </Button>
    </View>
  );
}
