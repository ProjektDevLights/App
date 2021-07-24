import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Divider, FAB, useTheme } from "react-native-paper";
import { Custom } from "../../interfaces/types";
import ChangeableText from "../ChangeableText";
import Circle from "../Circle";
import { LightScreenNavigationProp } from "../LightScreen/LightScreen";

export interface CustomDataProps {
  custom: Custom;
  onChange: (c: Custom) => void;
  onRemove: (i?: number) => void;
}
export default function CustomData(props: CustomDataProps): JSX.Element {
  const { custom, onRemove } = props;
  const [repeat, setRepeat] = React.useState<number>(custom.repeat);
  const [colors, setColors] = React.useState<string[]>(custom.leds);
  const [error, setError] = React.useState<boolean>(false);
  const navigation = useNavigation<LightScreenNavigationProp>();
  const theme = useTheme();

  const onSubmit = (c: string, i?: number) => {
    const cols = colors;
    cols[i ?? 0] = c;
    setColors(cols);
    props.onChange({ leds: cols, repeat });
    return true;
  };

  const setRepeats = (repeats: number) => {
    setRepeat(repeat);
    props.onChange({ leds: colors, repeat: repeats });
  };

  const onChange = (text: string) => {
    setError(false);
    if (!/^\d+$/.test(text) || parseInt(text, 10) > 1000) {
      setError(true);
      setRepeats(1);
      setError(false);
    } else {
      setRepeats(parseInt(text, 10));
    }
  };

  const onRemoveColor = (index: number) => {
    const cols = colors;
    cols.splice(index, 1);
    setColors(cols);
    props.onChange({ leds: cols, repeat });
  };

  const styles = StyleSheet.create({
    colors_container: {
      flexDirection: "row",
      justifyContent: "flex-start",
      flexWrap: "wrap",
    },
    opacity: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(3),
    },
    icon: {
      alignSelf: "center",
    },
  });
  return (
    <>
      <ChangeableText
        value={repeat.toString()}
        onSave={(text: string) => onChange(text)}
        error={error}
        keyboardType="number-pad"
      />
      <View style={styles.colors_container}>
        {colors.map((c: string, i: number) => (
          <TouchableOpacity
            style={styles.opacity}
            onLongPress={() => onRemoveColor(i)}
            onPress={() => {
              navigation.navigate("color_modal", {
                color: c,
                index: i,
                onSubmit,
              });
            }}
          >
            <Circle colors={[c]} />
          </TouchableOpacity>
        ))}
        <FAB
          style={styles.opacity}
          small
          icon="plus"
          onPress={() => setColors([...colors, "#000"])}
        />
      </View>
      <Divider style={{ marginTop: theme.spacing(2) }} />
      <TouchableOpacity
        onPress={() => onRemove()}
        style={{ margin: theme.spacing(2) }}
      >
        <FontAwesomeIcon
          size={26}
          style={styles.icon}
          color={theme.colors.secondary}
          icon={faTrash}
        />
      </TouchableOpacity>
    </>
  );
}
