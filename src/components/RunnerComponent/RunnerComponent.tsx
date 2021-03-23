import { Light } from "@devlights/types";
import { useNavigation } from "@react-navigation/native";
import { isEqual } from "lodash";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Button, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import useLight from "../../hooks/useLight";
import { Store } from "../../store";
import { ColorModalScreenNavigationProp } from "../ColorPicker/ColorPicker";

export interface RunnerComponentProps {
  id: string;
}

export default function RunnerComponent(
  props: RunnerComponentProps,
): JSX.Element {
  const navigation = useNavigation<ColorModalScreenNavigationProp>();
  const theme = useTheme();
  const lights = useLight();
  const ref = React.useRef<TextInput>();
  const light: Light = useSelector(
    (state: Store) =>
      state.lights.find((l: Light) => l.id === props.id) as Light,
    (left: Light, right: Light) =>
      isEqual(left.leds.timeout, right.leds.timeout) ||
      isEqual(left.leds.colors, right.leds.colors),
  );

  const onPress = () => {
    navigation.navigate("color_modal", {
      id: props.id,
      index: 0,
    });
  };

  // maybe number as parameter
  const changeTimeout = (timeout: string) => {
    if (parseInt(timeout, 10) !== light.leds.timeout) {
      lights
        .setColor(
          light.id,
          light.leds.colors,
          light.leds.pattern,
          parseInt(timeout, 10),
        )
        .catch(() => {
          /* ref.current?.setNativeProps({ text: light.leds.timeout?.toString() }); */
        });
    }
  };

  const styles = StyleSheet.create({
    button: {
      width: "70%",
      alignSelf: "center",
      marginTop: 20,
    },
    timeoutContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginLeft: theme.spacing(8),
      marginRight: theme.spacing(5),
    },
    title: {
      flex: 3,
      textAlignVertical: "center",
      fontSize: 20,
    },
    textinput: {
      flex: 2,
      color: theme.colors.text,
      fontSize: 20,
      fontFamily: "TitilliumWeb-Bold",
      fontWeight: "600",
    },
  });
  return (
    <View>
      <View style={styles.timeoutContainer}>
        <Text style={styles.title}>Timeout</Text>
        <TextInput
          editable={light.isOn}
          ref={ref as React.RefObject<TextInput>}
          keyboardType="number-pad"
          onSubmitEditing={({ nativeEvent: { text } }) => changeTimeout(text)}
          textAlign="right"
          style={styles.textinput}
          defaultValue={light.leds.timeout?.toString() ?? "100"}
        />
      </View>
      <Button
        disabled={!light.isOn}
        mode="contained"
        style={styles.button}
        onPress={onPress}
        color={light.leds.colors[0]}
      >
        {light.leds.colors[0]}
      </Button>
    </View>
  );
}