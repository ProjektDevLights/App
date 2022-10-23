import { Alarm, PartialLight } from "@devlights/types";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/core";
import axios from "axios";
import { filter, map, remove } from "lodash";
import * as React from "react";
import { Dimensions, StyleSheet, TextInput, View } from "react-native";
import { Modalize } from "react-native-modalize";
import { Button, Chip, IconButton, useTheme } from "react-native-paper";
import { useAlarms } from "../../hooks/useAlarms";
import useSnackbar from "../../hooks/useSnackbar";
import ApplyDialog from "../ApplyDialog";
import DayChip from "../DayChip";

export interface AlarmCardProps {
  id: string;
}

export default function AlarmCard(props: AlarmCardProps): JSX.Element {
  const { id } = props;
  const { alarms, updateAlarm } = useAlarms();
  const alarm = alarms.find((a: Alarm) => a.id === id) ?? {
    days: [],
    time: "00:00",
    id: "",
    isOn: false,
    leds: { pattern: "plain", colors: ["#000"] },
    lights: [],
  };
  const [days, setDays] = React.useState<number[]>(alarm.days);
  const modalizeRef = React.useRef<Modalize>(null);
  const navigation = useNavigation();
  const theme: ReactNativePaper.Theme = useTheme();
  const snackbar = useSnackbar();
  const ref = React.useRef<TextInput>(null);

  const handleDelete = () => {
    axios.delete(`/alarm/${alarm.id}`);
  };

  /**
   * function for editing one single alarm e.g. the time of it
   * @param data the data with the changes
   * @param key type of what you want to change e.g. "time"
   * @returns Promise over boolean to check wether the request succeded or not
   */
  const handleEdit = async (data: any, key: string): Promise<boolean> => {
    try {
      updateAlarm({ ...alarm, [key]: data }, true);
      /*  await axios.patch(`/alarm/${alarm.id}`, {
        [key]: data,
      }); */
      return true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (c: string): Promise<boolean> => {
    const response = handleEdit(c, "color");
    return response;
  };

  const handleCheckedChange = async (
    day: number,
    checked: boolean,
  ): Promise<void> => {
    const wDays = [...days];
    const old = wDays;
    if (checked) {
      wDays.push(day);
    } else if (wDays.length > 1) {
      remove(wDays, (d: number) => d === day);
    } else {
      snackbar.makeSnackbar(
        "Alarm must be active for at least one day",
        theme.colors.error,
      );
      return;
    }
    wDays.sort();
    setDays(wDays);
    if (!(await handleEdit(wDays, "days"))) setDays(old);
  };

  const handleColorChange = () => {
    navigation.navigate("alarm_pattern", {
      id: alarm.id,
    });
  };

  const styles = StyleSheet.create({
    root: {
      marginHorizontal: theme.spacing(3),
      width: Dimensions.get("window").width - theme.spacing(3) * 2,
      marginBottom: theme.spacing(2),
    },
    day_chip_container: {
      marginTop: theme.spacing(2),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    chip_container: {
      marginTop: theme.spacing(4),
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      flexWrap: "wrap",
    },
    chip: {
      maxHeight: 40,
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
      justifyContent: "center",
      alignItems: "center",
    },
    lights: {
      marginTop: theme.spacing(2),
    },
    button: {
      width: "60%",
    },
    addButton: {
      marginLeft: 0,
    },
    color_container: {
      marginTop: theme.spacing(3),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    icon: {
      alignSelf: "center",
    },
    delete_item: {
      marginLeft: theme.spacing(2),
    },
    textinput: {
      flex: 2,
      color: theme.colors.text,
      fontSize: 20,
      fontFamily: "TitilliumWeb-Bold",
      fontWeight: "600",
    },
  });
  let allDays = [1, 2, 3, 4, 5, 6, 0];
  return (
    <View style={styles.root}>
      <View style={{ flexDirection: "row" }}>
        <IconButton icon="label-outline" />
        <TextInput
          ref={ref as React.RefObject<TextInput>}
          onSubmitEditing={({ nativeEvent: { text } }) => {
            if (text !== "") handleEdit(text, "name");
            else ref.current?.setNativeProps({ text: alarm.name });
          }}
          textAlign="left"
          style={styles.textinput}
          defaultValue={alarm.name}
        />
      </View>
      <View style={styles.day_chip_container}>
        {allDays.map((val) => (
          <DayChip
            key={val}
            day={val}
            selected={days.includes(val)}
            onCheckedChanged={handleCheckedChange}
          />
        ))}
      </View>

      <View style={styles.chip_container}>
        {alarm.lights.map((l: PartialLight, i: number) => (
          <Chip
            key={l.id}
            onPress={() => navigation.navigate("light", { id: l.id })}
            style={styles.chip}
            onClose={() => {
              if (alarm.lights.length > 1) {
                handleEdit(
                  map(
                    filter(
                      alarm.lights,
                      (light: PartialLight) => light.id !== l.id,
                    ),
                    "id",
                  ),
                  "ids",
                );
              } else {
                snackbar.makeSnackbar(
                  "Alarm must have at least one Light",
                  theme.colors.error,
                );
              }
            }}
          >
            {alarm.lights[i].name}
          </Chip>
        ))}
        <IconButton
          style={styles.addButton}
          onPress={() => modalizeRef.current?.open()}
          icon={() => (
            <FontAwesomeIcon
              size={22}
              color={theme.colors.accent}
              icon={faPlus}
            />
          )}
          size={20}
        />
      </View>

      <View style={styles.color_container}>
        <Button
          color={alarm?.leds?.colors[0] ?? "#fff"}
          style={styles.button}
          mode="contained"
          onPress={handleColorChange}
        >
          {alarm.leds.colors}
        </Button>
        <IconButton
          size={30}
          onPress={handleDelete}
          icon={() => (
            <FontAwesomeIcon
              style={styles.icon}
              icon={faTrash}
              size={28}
              color={theme.colors.error}
            />
          )}
        />
      </View>

      <ApplyDialog
        title="Lights for Alarm"
        confirmText="Apply lights"
        ref={modalizeRef}
        onConfirm={(ids: string[]) => {
          handleEdit(ids, "ids");
          modalizeRef.current?.close();
        }}
        ids={map(alarm.lights, "id")}
        ignoreLightOff
      />
    </View>
  );
}
