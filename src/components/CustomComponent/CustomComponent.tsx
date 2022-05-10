import { CustomData, Pattern } from "@devlights/types";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Text, useTheme } from "react-native-paper";
import Circle from "../Circle";
import { CustomScreenNavigationProp } from "../CustomScreen/CustomScreen";

export interface CustomComponentProps {
  colors: string[];
  id: string;
  custom_sequence: CustomData[];
  type: "light" | "tag" | "alarm";
  oldPattern: Pattern;
  onSubmit: () => Promise<Pattern>;
}
export default function CustomComponent(
  props: CustomComponentProps,
): JSX.Element {
  const { colors, custom_sequence, id, type, oldPattern, onSubmit } = props;

  const navigation = useNavigation<CustomScreenNavigationProp>();
  const theme = useTheme();

  const navigate = (pCustom_sequence?: CustomData[]) => {
    navigation.navigate("custom", {
      id,
      type,
      onSubmit,
      custom_sequence: pCustom_sequence ?? undefined,
    });
  };
  console.log(custom_sequence);

  const styles = StyleSheet.create({
    colors_container: {
      marginTop: theme.spacing(2),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    color: {
      marginLeft: theme.spacing(2),
    },
    text: {
      textAlign: "center",
    },
    button: {
      marginTop: theme.spacing(4),
      width: "70%",
      alignSelf: "center",
    },
    opacity: {
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: theme.spacing(4),
    },
    icon: {
      justifyContent: "center",
    },
  });
  return (
    <View>
      {oldPattern === "custom" ? (
        <>
          <Text style={styles.text}> Colors used in this Custom Pattern</Text>
          <View style={styles.colors_container}>
            {colors.map((c: string) => (
              <View style={styles.color}>
                <Circle colors={[c]} />
              </View>
            ))}
            <TouchableOpacity
              style={styles.opacity}
              onPress={() => navigate(custom_sequence)}
            >
              <FontAwesomeIcon
                style={styles.icon}
                icon={faPen}
                size={26}
                color={theme.colors.accent}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : undefined}
      <Button
        mode="contained"
        color={theme.colors.accent}
        style={styles.button}
        onPress={navigate}
      >
        Create new custom pattern
      </Button>
    </View>
  );
}
