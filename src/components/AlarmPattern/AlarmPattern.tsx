/* eslint-disable no-nested-ternary */
import { Pattern } from "@devlights/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useAlarms } from "../../hooks/useAlarms";
import useSnackbar from "../../hooks/useSnackbar";
import { AlarmStackParamList } from "../../interfaces/types";
import PatternComponent from "../PatternComponent";
import PatternPicker from "../PatternPicker";

export type AlarmScreenNavigationProp = StackNavigationProp<
  AlarmStackParamList,
  "alarm_pattern"
>;
export type AlarmScreenRouteProp = RouteProp<
  AlarmStackParamList,
  "alarm_pattern"
>;

export default function AlarmPattern(): JSX.Element {
  const { params } = useRoute<AlarmScreenRouteProp>();
  const { updateAlarm } = useAlarms();
  const alarm = useAlarms().alarms.find((a) => a.id === params.id) ?? {
    id: "1",
    days: [],
    isOn: false,
    leds: { colors: ["#1de9b6"], pattern: "plain", timeout: undefined },
    lights: [],
    time: "00:00",
    custom_sequence: [],
  };

  const [pattern, setPattern] = useState(alarm?.leds.pattern ?? "plain");
  const [pickerOpen, setPickerOpen] = useState(false);
  const theme = useTheme();

  const snackbar = useSnackbar();

  const changePattern = async (newPattern: Pattern): Promise<Pattern> => {
    let success = true;

    if (newPattern !== "custom") {
      const newColors: string[] =
        alarm.leds?.colors && alarm.leds.colors.length > 0
          ? [alarm.leds.colors[0]]
          : [];

      if (newPattern === "gradient") {
        newColors.push(alarm?.leds?.colors[0] ?? "#1de9b6");
      }
      const ax = updateAlarm(
        {
          ...alarm,
          leds: {
            // TODO
            colors: ["rainbow", "fading"].includes(newPattern)
              ? []
              : newColors.length > 0
              ? newColors
              : ["#1de9b6"],
            pattern: newPattern as Pattern,
          },
        },
        true,
      );
      ax.then((res) => {
        setPattern(newPattern);
        success = true;
        snackbar.makeSnackbar(res?.data.message, theme.colors.success);
      });
      ax.catch((err: AxiosError) => {
        snackbar.makeSnackbar(err.response?.data.message, theme.colors.error);
        success = false;
      });
    } else {
      setPattern(newPattern);
      alarm.leds.pattern = "custom";
    }
    return success ? newPattern : alarm.leds.pattern;
  };
  return (
    <View
      style={{ marginLeft: theme.spacing(7), marginRight: theme.spacing(5) }}
    >
      <PatternPicker
        changePattern={changePattern}
        pattern={pattern}
        pickerOpen={pickerOpen}
        onOpen={() => setPickerOpen(true)}
        onClose={() => setPickerOpen(false)}
      />
      <PatternComponent
        onSubmit={(colors, timeout) =>
          updateAlarm(
            {
              ...alarm,
              leds: { ...alarm.leds, colors, pattern, timeout },
            },
            true,
          )
        }
        id={alarm.id}
        colors={alarm.leds.colors}
        custom_sequence={alarm.custom_sequence}
        timeout={alarm.leds.timeout}
        type="alarm"
        oldPattern={alarm.leds.pattern}
        newPattern={pattern}
      />
    </View>
  );
}
