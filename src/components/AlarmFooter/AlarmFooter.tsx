import { Alarm } from "@devlights/types";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import moment from "moment";
import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { useAlarms } from "../../hooks/useAlarms";

export interface AlarmFooterProps {
  isActive: boolean;
  onPress: (open: boolean) => void;
  id: string;
}

function AlarmFooter(props: AlarmFooterProps): JSX.Element {
  const { isActive, onPress, id } = props;
  const { alarms } = useAlarms();
  const alarm = alarms.find((a: Alarm) => a.id === id) ?? {
    days: [],
    time: "00:00",
    id: "",
    isOn: false,
    leds: { pattern: "plain", colors: ["#000"] },
    lights: [],
  };
  const theme = useTheme();
  const styles = StyleSheet.create({
    root: {
      marginTop: theme.spacing(-2),
      flexDirection: "row",
      justifyContent: isActive ? "flex-end" : "space-between",
    },
    button: {
      marginRight: theme.spacing(2),
    },
    text: {
      textAlignVertical: "center",
      marginLeft: theme.spacing(6),
    },
  });

  const getDays = (): string | string[] => {
    // TODO Sunday at the end
    const { days } = alarm;
    if (days.length === 7) {
      return "Everyday";
    }
    if (
      alarm.days.includes(0) &&
      alarm.days.includes(6) &&
      alarm.days.length === 2
    ) {
      return "Weekends";
    }
    if (
      alarm.days.includes(1) &&
      alarm.days.includes(2) &&
      alarm.days.includes(3) &&
      alarm.days.includes(4) &&
      alarm.days.includes(5)
    ) {
      return "Weekdays";
    }
    return days.map((val: number) => moment().set("day", val).format("dd"));
  };
  return (
    <View style={styles.root}>
      {!isActive ? (
        <Text style={styles.text}>{`${getDays()} \u2022 ${alarm.name}`}</Text>
      ) : (
        <Text> </Text>
      )}
      <IconButton
        size={26}
        style={styles.button}
        onPress={() => onPress(!isActive)}
        icon={() => (
          <FontAwesomeIcon
            size={24}
            color={theme.colors.accent}
            icon={isActive ? faChevronUp : faChevronDown}
          />
        )}
      />
    </View>
  );
}

export default AlarmFooter;
