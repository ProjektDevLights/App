import React from "react";
import { StyleSheet } from "react-native";
import { List } from "react-native-paper";
import { useHost } from "../../hooks/useHost";
import ChangeableText from "../ChangeableText";

export default function HostSettings(): JSX.Element {
  const host = useHost();

  const styles = StyleSheet.create({
    listTitle: {
      textAlign: "center",
    },
    changeText: {
      justifyContent: "flex-start",
    },
    changeTextInput: { fontSize: 18, fontWeight: "normal" },
  });
  return (
    <>
      <List.Section title="Server settings" titleStyle={styles.listTitle}>
        <List.Item
          title="Hostname"
          description={() => (
            <ChangeableText
              style={styles.changeText}
              inputStyle={styles.changeTextInput}
              value={host.getHostName()}
              onSave={(text: string) => host.setHostName(text)}
            />
          )}
        />
        <List.Item
          title="Port"
          description={() => (
            <ChangeableText
              style={styles.changeText}
              inputStyle={styles.changeTextInput}
              value={host.getPort().toString()}
              onSave={(text: string) => host.setHostPort(parseInt(text, 10))}
            />
          )}
        />
      </List.Section>
    </>
  );
}
