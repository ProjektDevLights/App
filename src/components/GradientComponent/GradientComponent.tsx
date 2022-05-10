import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import {
  faExchangeAlt,
  faStar as fullstar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useFavourites } from "../../hooks/useFavourites";
import { Gradient } from "../../hooks/useFavourites/FavouritesProvider";
import { isFavouriteGradient, makeValidColorArray } from "../../utils";
import { ColorModalScreenNavigationProp } from "../ColorPicker/ColorPicker";
import FavouriteGradientList from "../FavouriteGradientList";

export interface GradientComponentProps {
  colors: string[];
  onSubmit: (color: string | string[], index?: number) => Promise<boolean>;
  disabled: boolean;
}

export default function GradientComponent(
  props: GradientComponentProps,
): JSX.Element {
  const { colors, disabled } = props;
  const navigation = useNavigation<ColorModalScreenNavigationProp>();
  const {
    gradients: favouriteGradients,
    removeGradient,
    addGradient,
  } = useFavourites();
  const [icon, setIcon] = React.useState<IconProp>(faStar);
  const theme = useTheme();

  const onSubmit = async (newColor: string, index?: number) => {
    const newColors = makeValidColorArray(
      typeof newColor === "string" ? newColor : "",
      colors,
      index ?? 0,
    );
    const success = await props.onSubmit(newColors);
    return success;
  };

  const onPress = (index: number) => {
    navigation.navigate("color_modal", {
      color: colors[index],
      onSubmit,
      index,
    });
  };

  const saveColor = () => {
    const gradient: Gradient = {
      start: colors[0],
      end: colors[1],
    };
    if (isFavouriteGradient(favouriteGradients, gradient)) {
      removeGradient(gradient);
      setIcon(faStar);
    } else {
      addGradient(gradient);
      setIcon(fullstar);
    }
  };

  React.useEffect(() => {
    if (
      isFavouriteGradient(favouriteGradients, {
        start: colors[0],
        end: colors[1],
      })
    ) {
      setIcon(fullstar);
    } else setIcon(faStar);
  }, [colors]);

  const styles = StyleSheet.create({
    buttonContainer: {
      flex: 2,
      borderColor: "red",
    },
    iconContainer: {
      flex: 1,
      borderColor: "red",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      borderColor: "red",
      width: Dimensions.get("window").width - theme.spacing(5) * 2,
      marginTop: theme.spacing(4),
      flexDirection: "row",
      alignContent: "space-between",
    },
    pressable: {
      alignSelf: "flex-end",
      marginRight: 10,
      marginTop: favouriteGradients.length === 0 ? theme.spacing(2) : 0,
    },
    text: {
      fontSize: 20,
      fontFamily: "TitilliumWeb-Regular",
    },
  });
  return (
    <View>
      {favouriteGradients.length !== 0 ? (
        <View>
          <Text style={styles.text}> Favourite Gradients </Text>
          <FavouriteGradientList onPress={props.onSubmit} />
        </View>
      ) : null}
      <Pressable style={styles.pressable} onPress={() => saveColor()}>
        <FontAwesomeIcon color={theme.colors.accent} size={30} icon={icon} />
      </Pressable>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            disabled={disabled}
            mode="contained"
            onPress={() => onPress(0)}
            color={colors[0]}
          >
            {colors[0]}
          </Button>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => props.onSubmit([colors[1], colors[0]])}
          >
            <FontAwesomeIcon
              icon={faExchangeAlt}
              color={disabled ? theme.colors.disabled : theme.colors.accent}
              size={30}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            disabled={disabled}
            mode="contained"
            onPress={() => onPress(1)}
            color={colors[1] ?? colors[0]}
          >
            {colors[1] ?? colors[0]}
          </Button>
        </View>
      </View>
    </View>
  );
}
