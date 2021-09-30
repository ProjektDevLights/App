import { Light, Pattern, Response } from "@devlights/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios, { AxiosError, AxiosResponse } from "axios";
import { every, map } from "lodash";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import useSnackbar from "../../hooks/useSnackbar";
import { TagsStackParamList } from "../../interfaces/types";
import { Store } from "../../store";
import { setLight } from "../../store/actions/lights";
import { removeTag } from "../../store/actions/tags";
import { tagsEquality } from "../../utils";
import BrightnessSlider from "../BrightnessSlider";
import LightControl from "../LightControl";
import PatternComponent from "../PatternComponent";
import PatternPicker from "../PatternPicker";
import LightsList from "../TagLightsList";

export type TagScreenNavigationProp = StackNavigationProp<
  TagsStackParamList,
  "tag"
>;
export type TagScreenRouteProp = RouteProp<TagsStackParamList, "tag">;

export default function TagScreen(): JSX.Element {
  const { params } = useRoute<TagScreenRouteProp>();
  const { tag } = params;
  const snackbar = useSnackbar();
  const [pickerOpen, setOpen] = React.useState(false);
  const [leds, setLeds] = React.useState<{
    colors: string[];
    pattern: Pattern | string;
    timeout: number | undefined;
  }>({
    colors: ["#000000"],
    pattern: "unkown",
    timeout: undefined,
  });
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const theme = useTheme();
  const tags = useSelector((state: Store) =>
    state.tags.find((t: string) => t === tag),
  );

  const lights: Light[] = useSelector(
    (state: Store) => state.lights.filter((l) => l.tags?.includes(tag)),
    (l: Light[], r: Light[]) => tagsEquality(l, r, l.length, tag),
  );

  React.useEffect(() => {
    if (!lights || lights?.length < 1) {
      dispatch(removeTag(params.tag));
      navigation.goBack();
      snackbar.makeSnackbar(
        "Tag does not exist anymore in this application!",
        theme.colors.error,
      );
    } else {
      navigation.setOptions({
        headerTitle: params.tag,
        headerRight: () => (
          <LightControl
            type="tag"
            tag={tag}
            ids={map(lights, "id")}
            isOn={!every(lights, { isOn: false })}
          />
        ),
      });
    }
  }, [tags]);

  const changeColor = async (
    pColors: string[],
    timeout: number | undefined,
  ) => {
    setLeds({ ...leds, colors: pColors, timeout });
    const ax = axios.patch(`/tags/${tag}/color`, {
      colors: ["fading", "rainbow"].includes(leds.pattern) ? [] : pColors,
      pattern: leds.pattern,
      timeout: ["plain", "gradient"].includes(leds.pattern)
        ? undefined
        : timeout ?? 100,
    });
    ax.then((res: AxiosResponse<Response<Light[]>>) => {
      snackbar.makeSnackbar(res.data.message, theme.colors.success);
    }).catch((err: AxiosError) => {
      snackbar.makeSnackbar(
        err.response?.status === 304
          ? "Nothing chanded"
          : err.response?.data.message,
        theme.colors.error,
      );
      setLeds({ colors: ["#000000"], pattern: "unkown", timeout: undefined });
    });
    return ax;
  };

  const styles = StyleSheet.create({
    container: {
      height: Dimensions.get("window").height,
      width: "100%",
      marginTop: 0,
    },
    slider_container: {
      width: "90%",
      margin: theme.spacing(6),
      zIndex: -1,
    },
    slider_text: {
      fontSize: 20,
      fontFamily: "TitilliumWeb-Regular",
    },
    button: {
      margin: theme.spacing(2),
    },
    selectContainer: {
      width: "90%",
      alignSelf: "center",
      marginTop: theme.spacing(2),
      zIndex: 1,
    },
    selectLabel: {
      marginLeft: 5,
    },
    divider: {
      zIndex: -1,
      flex: 1,
      backgroundColor: `${theme.colors.text}aa`,
      marginVertical: 15,
    },
    pattern: {
      marginLeft: theme.spacing(7),
      marginRight: theme.spacing(5),
    },
    note: { textAlign: "center", flex: 2, marginTop: 10 },
  });
  return (
    <View style={{ height: Dimensions.get("window").height }}>
      <ScrollView style={styles.container}>
        <View style={[styles.selectContainer, { flex: 1 }]}>
          <View style={styles.pattern}>
            <Text style={styles.selectLabel}>Choose pattern for tag</Text>
            <PatternPicker
              changePattern={(p: Pattern | string) =>
                setLeds({ ...leds, pattern: p })
              }
              pattern={leds.pattern}
              onClose={() => setOpen(false)}
              onOpen={() => setOpen(true)}
              pickerOpen={pickerOpen}
            />
          </View>
          <View />
          {leds.pattern === "unkown" ? undefined : (
            <View style={{ zIndex: -1 }}>
              <Divider style={styles.divider} />
              <PatternComponent
                id={tag}
                type="tag"
                newPattern={leds.pattern as Pattern}
                timeout={100}
                colors={leds.colors}
                disabled={false}
                onSubmit={changeColor}
              />
            </View>
          )}
          <Text style={styles.note}>
            Note that its not saved on this screen which color you apply to tags
          </Text>
        </View>

        <View style={styles.slider_container}>
          <Text style={styles.slider_text}> Brightness</Text>
          <BrightnessSlider color="#1de9b6" ids={map(lights, "id")} />
        </View>

        <LightsList lights={lights} tag={tag} />
      </ScrollView>
    </View>
  );
}
