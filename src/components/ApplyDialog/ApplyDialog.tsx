import { Light } from "@devlights/types";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Modalize } from "react-native-modalize";
import {
  Button,
  Checkbox,
  List,
  Portal,
  Title,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLights } from "../../hooks/useLights";

interface ApplyDialogProps {
  title: string;
  confirmText?: string | undefined;
  onConfirm: (values: string[]) => void;
  ids: string[];
  ignoreLightOff?: boolean;
}

export const ApplyDialog = React.forwardRef(
  (props: ApplyDialogProps, ref: React.ForwardedRef<Modalize>) => {
    const { lights } = useLights();
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { title, confirmText, ids, ignoreLightOff } = props;

    const [values, setValues] = React.useState<string[]>(ids);
    const [bottom, setBottom] = React.useState<number>(insets.bottom);

    React.useEffect(() => {
      setValues(ids);

      return () => {
        setValues(ids);
      };
    }, []);

    const snapPoint = 150 + lights.length * 40;

    const onPress = (id: string) => {
      if (values.includes(id)) {
        const index: number = values.indexOf(id);
        const old = [...values];
        old.splice(index, 1);
        setValues(old);
      } else {
        setValues([...values, id]);
      }
    };

    const onConfirm = () => {
      props.onConfirm(values);
    };

    const styles = StyleSheet.create({
      modal: {
        backgroundColor: theme.colors.background,
        marginBottom: bottom,
      },
      title: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(2),
      },
      item_text: {
        textAlign: "center",
      },
    });
    return (
      <Portal>
        <Modalize
          snapPoint={snapPoint}
          useNativeDriver
          modalStyle={styles.modal}
          ref={ref}
          onClose={() => {
            setValues(ids ?? []);
            setBottom(0);
          }}
        >
          <Title style={styles.title}>{title}</Title>
          {lights.length > 0 ? (
            lights.map((l: Light) => (
              <Checkbox.Item
                key={l.id}
                disabled={ignoreLightOff ? false : !l.isOn}
                label={l.name}
                labelStyle={{
                  color:
                    l.isOn || ignoreLightOff
                      ? theme.colors.text
                      : theme.colors.grey,
                }}
                mode="ios"
                onPress={() => onPress(l.id)}
                status={values.includes(l.id) ? "checked" : "unchecked"}
              />
            ))
          ) : (
            <List.Item
              titleStyle={styles.item_text}
              title="There arent any lights."
            />
          )}
          <Button
            disabled={values.length === 0 || lights.length === 0}
            onPress={() => onConfirm()}
          >
            {confirmText ?? "Save"}
          </Button>
        </Modalize>
      </Portal>
    );
  },
);

ApplyDialog.defaultProps = {
  confirmText: "Apply",
  ignoreLightOff: false,
};

export default ApplyDialog;
