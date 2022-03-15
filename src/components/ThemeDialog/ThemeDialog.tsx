import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import { Button, Dialog, Portal, RadioButton } from "react-native-paper";
import { Theme } from "../../interfaces/types";
import { useThemeChange } from "./ThemeProvider";

export interface ThemeDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function ThemeDialog(props: ThemeDialogProps): JSX.Element {
  const { visible } = props;
  const [value, setValue] = React.useState<Theme>("Dark");
  const changeTheme = useThemeChange();

  const onConfirm = async () => {
    changeTheme.changeTheme(value);
    props.onDismiss();
  };

  const onDismiss = async () => {
    props.onDismiss();
    fetch();
  };

  const fetch = async () => {
    const type = await AsyncStorage.getItem("themeType");
    setValue(type);
  };

  React.useEffect(() => {
    fetch();
  }, []);

  const styles = StyleSheet.create({
    radioItem: {
      flexDirection: "row-reverse",
      alignSelf: "flex-start",
    },
  });

  const getTextStyle = (pValue: string): StyleProp<TextStyle> => {
    const fontWeight = value === pValue ? "bold" : "normal";
    return {
      fontWeight,
    };
  };
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable>
        <Dialog.Title>Choose Theme</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={(newValue: string) => {
              setValue(newValue as Theme);
            }}
            value={value}
          >
            <RadioButton.Item
              style={styles.radioItem}
              labelStyle={getTextStyle("light")}
              label="Light Theme"
              value="Light"
            />
            <RadioButton.Item
              style={styles.radioItem}
              labelStyle={getTextStyle("dark")}
              label="Dark Theme"
              value="Dark"
            />
            <RadioButton.Item
              style={styles.radioItem}
              labelStyle={getTextStyle("system-default")}
              label="System-Default"
              value="System-Default"
            />
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onConfirm}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
