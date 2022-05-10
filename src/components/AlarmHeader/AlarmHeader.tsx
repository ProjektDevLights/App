import { Alarm } from "@devlights/types";
import axios from "axios";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Divider,
  Switch,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { useAlarms } from "../../hooks/useAlarms";
import TimePicker from "../TimePicker";

export default function AlarmHeader(props: {
  id: string;
  index: number;
}): JSX.Element {
  const { id, index } = props;
  const theme = useTheme();
  const { alarms, updateAlarm } = useAlarms();
  const alarm = alarms.find((a: Alarm) => a.id === id) ?? {
    days: [],
    time: "00:00",
    id: "",
    isOn: false,
    leds: { pattern: "plain", colors: ["#000"] },
    lights: [],
  };
  const [isOn, setIsOn] = React.useState<boolean>(alarm.isOn);
  const [visible, setVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isOn !== alarm.isOn) {
      setIsOn(alarm.isOn);
    }
  }, [alarm]);
  const handleValueChange = (value: boolean) => {
    const old = alarm.isOn;
    setIsOn(value);
    updateAlarm({ ...alarm, isOn: value }).catch(() => setIsOn(old));
  };

  const handleTimeChange = (time: string) => {
    axios.patch(`/alarms/${id}`, {
      time,
    });
  };

  const styles = StyleSheet.create({
    root: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    ripple: {
      marginLeft: theme.spacing(3),
    },
    headerText: {
      fontSize: 30,
      margin: theme.spacing(1),
      padding: theme.spacing(1),
    },
    switch: { alignItems: "center", marginRight: theme.spacing(4) },
    divider: {
      marginHorizontal: theme.spacing(3),
    },
  });
  return (
    <>
      {index > 0 ? <Divider style={styles.divider} /> : undefined}
      <View style={styles.root}>
        <TouchableRipple
          style={styles.ripple}
          onPress={() => {
            setVisible(true);
          }}
        >
          <Text style={styles.headerText}>{alarm?.time ?? "UNDEFINED"}</Text>
        </TouchableRipple>
        <TimePicker
          visible={visible}
          close={() => setVisible(false)}
          onConfirm={handleTimeChange}
          time={alarm.time}
        />
        <Switch
          onValueChange={(value: boolean) => handleValueChange(value)}
          style={styles.switch}
          value={isOn}
          color={alarm.color}
          disabled={alarm === undefined}
        />
      </View>
    </>
  );
}
