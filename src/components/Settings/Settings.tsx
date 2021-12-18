import { faAdjust } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { isEqual } from "lodash";
import * as React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { List, Title, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import { Theme } from "../../interfaces/types";
import { Store } from "../../store";
import HostSettings from "../HostSettings";
import ThemeDialog from "../ThemeDialog";

export default function Settings(): JSX.Element {
  const theme = useTheme();
  const [visible, setVisible] = React.useState<boolean>(false);
  const themeType = useSelector(
    (state: Store) => state.theme,
    (left: Theme, right: Theme) => isEqual(left, right),
  );
  const styles = StyleSheet.create({
    container: { width: "100%", height: "100%" },
    title: {
      textAlign: "center",
      paddingTop: 30,
      marginBottom: 10,
      fontSize: 40,
    },
    contentContainerStyle: {
      width: "100%",
      height: "100%",
    },
    themeText: {
      textAlign: "center",
    },
    listItem: {
      width: "100%",
    },
    listItemTitle: {
      fontSize: 20,
    },
    listIcon: {
      alignSelf: "center",
    },
  });
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />

      <ScrollView contentContainerStyle={styles.contentContainerStyle}>
        <Title style={styles.title}>Settings</Title>

        <List.Section title="Apperance" titleStyle={styles.themeText}>
          <List.Item
            style={styles.listItem}
            title="Theme"
            description={themeType}
            titleStyle={styles.listItemTitle}
            onPress={() => setVisible(true)}
            left={() => (
              <FontAwesomeIcon
                color={theme.colors.text}
                style={styles.listIcon}
                icon={faAdjust}
              />
            )}
          />
          <ThemeDialog visible={visible} onDismiss={() => setVisible(false)} />
        </List.Section>
        <HostSettings />
      </ScrollView>
    </View>
  );
}
