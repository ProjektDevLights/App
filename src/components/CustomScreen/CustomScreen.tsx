import { PartialLight, Response } from "@devlights/types";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios, { AxiosError, AxiosResponse } from "axios";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Divider, List, useTheme } from "react-native-paper";
import useSnackbar from "../../hooks/useSnackbar";
import { Custom, LightsStackParamList } from "../../interfaces/types";
import CustomData from "../CustomData";

export type CustomScreenNavigationProp = StackNavigationProp<
  LightsStackParamList,
  "custom"
>;

export type CustomScreenRouteProp = RouteProp<LightsStackParamList, "custom">;

export default function CustomScreen(): JSX.Element {
  const route = useRoute<CustomScreenRouteProp>();
  const navigation = useNavigation();
  const { id, type, onSubmit, custom_sequence } = route.params;
  const [custom, setCustom] = React.useState<Custom[]>(
    custom_sequence?.length && custom_sequence.length > 0
      ? route.params.custom_sequence
      : [{ leds: ["#000"], repeat: 1 }],
  );
  const theme = useTheme();
  const snackbar = useSnackbar();

  const onChange = (c: Custom, index: number) => {
    const cus = [...custom];
    cus[index] = c;
    setCustom(cus);
  };

  const onSave = () => {
    const url = `/${type}s/${id}${type !== "alarm" ? "/custom" : ""}`;

    axios
      .patch(
        url,
        type === "alarm" ? { custom_sequence: custom } : { data: custom },
      )
      .then((res: AxiosResponse<Response<PartialLight | PartialLight[]>>) => {
        snackbar.makeSnackbar(res.data.message, theme.colors.success);
        if (type === "light") {
          onSubmit();
        }
        navigation.goBack();
      })
      .catch((err: AxiosError) => {
        snackbar.makeSnackbar(
          err.response?.data.message ?? "Custom color was not applied",
          theme.colors.error,
        );
      });
  };

  const onRemove = (index: number) => {
    const customs = [...custom];

    if (index > -1) {
      customs.splice(index, 1);
      setCustom(customs);
    }
  };

  const styles = StyleSheet.create({
    container: { height: "100%", width: "100%" },
    icon: {
      alignSelf: "center",
    },
  });
  return (
    <View style={styles.container}>
      {custom.map((c: Custom, i: number) => (
        <>
          <CustomData
            custom={c}
            key={i.toString()}
            onRemove={() => onRemove(i)}
            onChange={(newCustom: Custom) => onChange(newCustom, i)}
          />
          <Divider />
        </>
      ))}
      <List.Item
        title="Add part"
        onPress={() => setCustom([...custom, { repeat: 1, leds: ["#000"] }])}
        right={() => (
          <FontAwesomeIcon
            icon={faPlus}
            color={theme.colors.accent}
            size={26}
            style={styles.icon}
          />
        )}
      />
      <Button onPress={onSave}>Save</Button>
    </View>
  );
}
