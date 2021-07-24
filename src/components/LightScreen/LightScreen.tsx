import { Light, Pattern } from "@devlights/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios, { AxiosError, AxiosResponse } from "axios";
import * as React from "react";
import {
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import useSnackbar from "../../hooks/useSnackbar";
import { LightResponse, LightsStackParamList } from "../../interfaces/types";
import { Store } from "../../store";
import { setLight } from "../../store/actions/lights";
import { lightEquality } from "../../utils";
import BrightnessSlider from "../BrightnessSlider";
import CountComponent from "../CountComponent";
import LightControl from "../LightControl";
import LightName from "../LightName";
import PatternComponent from "../PatternComponent";
import PatternPicker from "../PatternPicker";
import TagsList from "../TagsList/TagsList";

export type LightScreenNavigationProp = StackNavigationProp<
  LightsStackParamList,
  "light"
>;
export type LightScreenRouteProp = RouteProp<LightsStackParamList, "light">;

export default function LightScreen(): JSX.Element {
  const route = useRoute<LightScreenRouteProp>();
  const {
    params: { id },
  } = route;
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { colors } = theme;
  const dispatch = useDispatch();
  const light = useSelector(
    (state: Store) => state.lights.find((l: Light) => l.id === id) as Light,
    (l: Light, r: Light) => lightEquality(l, r),
  );

  const navigation = useNavigation();

  const fallBacklight: Light = {
    name: "DevLight",
    brightness: 255,
    count: 150,
    id: "0.0",
    isOn: false,
    leds: {
      colors: ["#1de9b6"],
      pattern: "plain",
      timeout: undefined,
    },
    tags: [""],
    position: 0,
  };

  const [refresh, setRefresh] = React.useState<boolean>(false);
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [pickerOpen, setPickerOpen] = React.useState<boolean>(false);
  const [oldPattern, setOldPattern] = React.useState<Pattern | string>(
    light?.leds.pattern ?? "plain",
  );

  React.useEffect(() => {
    setOldPattern(light.leds.pattern);
    navigation.setOptions({
      headerRight: () => (
        <LightControl ids={[light.id]} type="light" isOn={light.isOn} />
      ),
    });
  }, []);

  React.useEffect(() => {
    console.log(light);
    if (!light) {
      navigation.goBack();
      snackbar.makeSnackbar(
        "Light has been removed or is not avaible in this application!",
        theme.colors.error,
      );
    }
  }, [light]);

  const fetch = async () => {
    setRefresh(true);
    const res: LightResponse = await axios.get(`/lights/${id}`);
    dispatch(setLight(light.id, res.data.object));

    setRefresh(false);
  };

  const changePattern = async (newPattern: Pattern): Promise<Pattern> => {
    let success = true;

    if (newPattern !== "custom") {
      setOldPattern(light.leds.pattern);
      const newColors: string[] = [light.leds.colors[0]];
      if (newPattern === "gradient") {
        newColors.push(light.leds.colors[0]);
      }
      const ax = axios.patch(`/lights/${id}/color`, {
        colors: ["rainbow", "fading"].includes(newPattern) ? [] : newColors,
        pattern: newPattern as Pattern,
        timeout: ["runner", "rainbow", "fading"].includes(newPattern)
          ? 1000
          : undefined,
      });
      ax.then((res: LightResponse) => {
        success = true;
        //dispatch(setLight(light.id, res.data.object));
        snackbar.makeSnackbar(res.data.message, theme.colors.success);
      });
      ax.catch((err: AxiosError) => {
        snackbar.makeSnackbar(err.response?.data.message, theme.colors.error);
        success = false;
      });
    } else {
      dispatch(
        setLight(light.id, {
          ...light,
          leds: { colors: light.leds.colors, pattern: "custom" },
        }),
      );
      setOldPattern(light.leds.pattern);
    }
    return success ? newPattern : light.leds.pattern;
  };

  const changeColor = async (
    pColors: string[],
    timeout: number | undefined,
  ): Promise<AxiosResponse<Light>> => {
    if (light.leds.pattern === "custom") {
      setOldPattern("custom");
      return;
    }
    const ax = axios.patch(`/lights/${id}/color`, {
      colors: ["fading", "rainbow"].includes(light.leds.pattern) ? [] : pColors,
      pattern: light.leds.pattern,
      timeout: timeout ?? light.leds.timeout,
    });
    ax.then((res: LightResponse) => {
      //dispatch(setLight(light.id, res.data.object));
      snackbar.makeSnackbar(res.data.message, theme.colors.success);
    }).catch((err: AxiosError) => {
      snackbar.makeSnackbar(
        err.response?.data.message ?? "Nothing changed!",
        theme.colors.error,
      );
    });
    return ax;
  };

  const styles = StyleSheet.create({
    container: {
      height: "100%",
      marginTop: 0,
      paddingBottom: 100,
    },
    numberContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing(4),
      marginLeft: theme.spacing(8),
      marginRight: theme.spacing(5),
    },
    divider: {
      backgroundColor: `${theme.colors.text}aa`,
      marginVertical: 15,
    },
    selectContainer: {
      marginLeft: theme.spacing(7),
      marginRight: theme.spacing(5),
    },
    selectLabel: {
      marginLeft: 5,
    },
    title: {
      flex: 3,
      textAlignVertical: "center",
      fontSize: 20,
    },
    pattern: { zIndex: -1, marginHorizontal: theme.spacing(5) },
    slider_container: {
      marginTop: 10,
      marginLeft: theme.spacing(6),
      marginRight: theme.spacing(6),
    },
    slider_text: {
      fontSize: 20,
      fontFamily: "TitilliumWeb-Regular",
    },
    item_container: {
      borderRadius: 12,
      backgroundColor: theme.colors.grey,
      width: "90%",
      alignSelf: "center",
      zIndex: -1,
    },
  });
  return (
    <KeyboardAvoidingView
      style={{ height: "100%" }}
      behavior="height"
      enabled={enabled}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={fetch}
            tintColor={colors.accent}
            colors={[colors.primary, colors.accent]}
          />
        }
        style={styles.container}
        contentContainerStyle={{ paddingBottom: theme.spacing(4) }}
      >
        <LightName light={light ?? fallBacklight} />
        <View style={styles.numberContainer}>
          <Text style={styles.title}>LEDs</Text>
          <CountComponent light={light ?? fallBacklight} />
        </View>
        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Pattern</Text>
          <PatternPicker
            disabled={
              !light || !light?.isOn || light?.leds.pattern === "waking"
            }
            pattern={light?.leds.pattern ?? fallBacklight.leds.pattern}
            pickerOpen={pickerOpen}
            onOpen={() => setPickerOpen(true)}
            onClose={() => setPickerOpen(false)}
            changePattern={(pattern: Pattern | string) => {
              changePattern(pattern as Pattern);
            }}
          />
        </View>

        <View style={styles.slider_container}>
          <Text style={styles.slider_text}> Brightness</Text>
          <BrightnessSlider
            color={light?.leds.colors[0] ?? fallBacklight.leds.colors[0]}
            ids={[light?.id ?? fallBacklight.id]}
          />
        </View>

        <Divider style={styles.divider} />
        <View style={styles.pattern}>
          <PatternComponent
            id={light?.id ?? fallBacklight.id}
            type="light"
            disabled={!light?.isOn ?? true}
            newPattern={light?.leds.pattern ?? fallBacklight.leds.pattern}
            oldPattern={oldPattern}
            timeout={light?.leds.timeout ?? undefined}
            colors={light?.leds?.colors ?? fallBacklight.leds.colors}
            custom_sequence={light?.custom_sequence}
            onSubmit={changeColor}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.item_container}>
          <TagsList
            enabled={enabled}
            setEnabled={setEnabled}
            light={light ?? fallBacklight}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
