import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios, { AxiosError } from "axios";
import Lottie from "lottie-react-native";
import * as React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { Divider, List, useTheme } from "react-native-paper";
import { useFavourites } from "../../hooks/useFavourites";
import { Gradient } from "../../hooks/useFavourites/FavouritesProvider";
import useSnackbar from "../../hooks/useSnackbar";
import { LightResponse, LightsStackParamList } from "../../interfaces/types";
import { ApplyDialog } from "../ApplyDialog/ApplyDialog";
import Circle from "../Circle";

export function Color(props: {
  colors: string[];
  delete: () => void;
  onPress: () => void;
}): JSX.Element {
  const { colors, onPress } = props;
  const snackbar = useSnackbar();
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: { width: "100%" },
    pressable: { alignSelf: "center" },
  });

  return (
    <>
      <List.Item
        title={colors[0] + (colors[1] ? ` + ${colors[1]}` : "")}
        onPress={onPress}
        style={styles.container}
        left={() => <Circle colors={colors} />}
        right={() => (
          <TouchableOpacity style={styles.pressable} onPress={props.delete}>
            <FontAwesomeIcon
              size={26}
              icon={faTrash}
              color={theme.colors.accent}
            />
          </TouchableOpacity>
        )}
      />
    </>
  );
}

export type FavouriteScreenNavigationProp = StackNavigationProp<
  LightsStackParamList,
  "favourite"
>;

export type FavouriteScreenRouteProp = RouteProp<
  LightsStackParamList,
  "favourite"
>;

export default function Favourite(): JSX.Element {
  const snackbar = useSnackbar();
  const { colors, gradients, removeColor, removeGradient } = useFavourites();
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: { alignSelf: "center", alignItems: "center", marginTop: 10 },
    text: {
      fontSize: 18,
      color: theme.colors.text,
      textAlign: "left",
      margin: theme.spacing(4),
    },
  });

  const [currentColors, setCurrentColors] = React.useState<string[]>([]);

  const modalizeRef = React.useRef<Modalize>(null);
  const onConfirm = (ids: string[]) => {
    modalizeRef.current?.close();
    if (ids.length > 0) {
      ids.forEach((id: string) => {
        const ax = axios.patch(`/lights/${id}/color`, {
          colors: currentColors,
          pattern: currentColors.length > 1 ? "gradient" : "plain",
        });
        ax.then((res: LightResponse) => {
          setCurrentColors([]);
          snackbar.makeSnackbar(res.data.message, theme.colors.success);
        }).catch((err: AxiosError) => {
          snackbar.makeSnackbar(
            err.response?.data.message ?? "Nothing changed!",
            theme.colors.error,
          );
          setCurrentColors([]);
        });
      });
    }
  };

  const dialog = () => {
    return (
      <ApplyDialog
        onConfirm={onConfirm}
        title="Apply favourite color on Light"
        confirmText="Apply Color"
        ref={modalizeRef}
        ids={[]}
      />
    );
  };

  if (colors.length === 0 && gradients.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Lottie
          autoPlay
          hardwareAccelerationAndroid
          autoSize
          loop={false}
          // eslint-disable-next-line global-require
          source={require("../../../assets/animations/favourite.json")}
        />
        <Text style={styles.text}>You haven`t saved any favourites yet</Text>
      </ScrollView>
    );
  }

  // Colors === 0 and gradients should be not null
  if (colors.length === 0) {
    return (
      <ScrollView>
        <View style={styles.container}>
          <Text style={{ color: theme.colors.text, margin: theme.spacing(3) }}>
            You haven`t saved any colors yet
          </Text>
        </View>
        <Divider />
        <Text style={styles.text}>Gradients</Text>
        {gradients.map((g: Gradient) => {
          const array = [g.start, g.end];
          return (
            <Color
              onPress={() => {
                setCurrentColors(array);
                modalizeRef.current?.open();
              }}
              key={g.start + g.end}
              delete={() => removeGradient(g)}
              colors={array}
            />
          );
        })}
        {dialog()}
      </ScrollView>
    );
  }

  // Gradients === 0 and colors should be not null
  if (gradients.length === 0) {
    return (
      <ScrollView>
        <View style={{ marginTop: theme.spacing(4) }}>
          <Text style={styles.text}>Colors</Text>
          {colors.map((fav: string) => (
            <Color
              onPress={() => {
                setCurrentColors([fav]);
                modalizeRef.current?.open();
              }}
              key={fav}
              delete={() => removeColor(fav)}
              colors={[fav]}
            />
          ))}
        </View>
        <Divider />
        <View style={styles.container}>
          <Text style={{ color: theme.colors.text, margin: theme.spacing(3) }}>
            You haven`t saved any gradients yet
          </Text>
        </View>
        {dialog()}
      </ScrollView>
    );
  }

  // Default export if nothing is null.
  return (
    <ScrollView>
      <Text style={styles.text}> Colors</Text>
      {colors.map((fav: string) => (
        <Color
          onPress={() => {
            setCurrentColors([fav]);
            modalizeRef.current?.open();
          }}
          key={fav}
          delete={() => removeColor(fav)}
          colors={[fav]}
        />
      ))}
      <Divider />
      <Text style={styles.text}>Gradients</Text>
      {gradients.map((g: Gradient) => {
        const array: string[] = [g.start, g.end];
        return (
          <Color
            onPress={() => {
              setCurrentColors(array);
              modalizeRef.current?.open();
            }}
            key={g.start + g.end}
            delete={() => removeGradient(g)}
            colors={array}
          />
        );
      })}
      {dialog()}
    </ScrollView>
  );
}
