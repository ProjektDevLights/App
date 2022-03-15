import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as fullstar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
// @ts-ignore
import HsvColorPicker from "react-native-hsv-color-picker";
import { Button, Text, useTheme } from "react-native-paper";
import tinycolor, { ColorFormats } from "tinycolor2";
import { useFavourites } from "../../hooks/useFavourites";
import { LightsStackParamList } from "../../interfaces/types";
import FavouriteList from "../FavouriteList/FavouriteList";

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
  const { color } = route.params;
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors: favouriteColors, removeColor, addColor } = useFavourites();
  const [hsv, setHsv] = React.useState<ColorFormats.HSV>(
    tinycolor(color ?? "#fff").toHsv(),
  );
  const [icon, setIcon] = React.useState<IconProp>(faStar);

  const { colors } = theme;
  const saveColor = () => {
    if (favouriteColors.includes(tinycolor.fromRatio(hsv).toHexString())) {
      removeColor(tinycolor.fromRatio(hsv).toHexString());
      setIcon(faStar);
    } else {
      addColor(tinycolor.fromRatio(hsv).toHexString());
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
    button: { marginTop: 20 },
    icon: { marginRight: 20 },
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
    if (favouriteColors.includes(tinycolor.fromRatio(hsv).toHexString())) {
      setIcon(fullstar);
    } else {
      setIcon(faStar);
    }
  }, [hsv]);

  const onSatValChange = ({
    saturation,
    value,
  }: {
    saturation: number;
    value: number;
  }) => {
    setHsv({ ...hsv, s: saturation, v: value });
  };

  const onPress = (prop: string) => {
    const { h, s, v } = tinycolor.fromRatio(prop).toHsv();
    setHsv({ h, s, v });
    if (icon === faStar) setIcon(fullstar);
  };

  const onSubmit = async () => {
    const success = await route.params.onSubmit(
      tinycolor.fromRatio(hsv).toHexString(),
      //@ts-ignore
      route.params.index,
    );
    if (success) {
      navigation.goBack();
    } else {
      setHsv(tinycolor(color).toHsv());
    }
  };

  return (
    <View style={styles.container}>
      <FavouriteList onPress={onPress} />
      <HsvColorPicker
        huePickerHue={hsv.h}
        huePickerSliderSize={30}
        satValPickerHue={hsv.h}
        satValPickerSaturation={hsv.s}
        satValPickerValue={hsv.v}
        satValPickerSize={270}
        satValPickerSliderSize={30}
        onHuePickerDragMove={({ hue }: { hue: number }) =>
          setHsv({ ...hsv, h: hue })
        }
        onHuePickerPress={({ hue }: { hue: number }) =>
          setHsv({ ...hsv, h: hue })
        }
        onSatValPickerDragMove={onSatValChange}
        onSatValPickerPress={onSatValChange}
      />
      <Text>
        Current color:
        {tinycolor.fromRatio(hsv).toHexString()}
      </Text>
      <Button
        disabled={tinycolor.fromRatio(hsv).toHexString() === color}
        style={styles.button}
        color={
          tinycolor.fromRatio(hsv).toHexString() !== ""
            ? tinycolor.fromRatio(hsv).toHexString()
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
