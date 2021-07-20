import { Light } from "@devlights/types";
import axios, { AxiosError } from "axios";
import { filter, isEqual, map, mean, some } from "lodash";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
// @ts-ignore
import Slider from "react-native-slider";
import { useSelector } from "react-redux";
import tinycolor from "tinycolor2";
import useSnackbar from "../../hooks/useSnackbar";
import { Store } from "../../store";

export interface SliderProps {
  color: string;
  ids: string[];
}

export default function BrightnessSlider(props: SliderProps): JSX.Element {
  const { ids } = props;
  const snackbar = useSnackbar();
  const light: Light = useSelector(
    (state: Store) => state.lights.find((l: Light) => l.id === ids[0]) as Light,
    (left: Light, right: Light) => isEqual(left, right),
  );

  const realLights: Light[] = useSelector(
    (state: Store) =>
      filter(state.lights, (l: Light) => ids.includes(l.id)) as Light[],
    (left: Light[], right: Light[]) => isEqual(left, right),
  );

  const getBrightness = (): number => {
    if (realLights.length > 1) {
      return Math.round(mean(map(realLights, "brightness")));
    }

    return realLights[0]?.brightness ?? 1;
  };

  const [brightness, setBrightness] = React.useState<number>(
    getBrightness() ?? 1,
  );

  React.useEffect(() => {
    const newBrightness = getBrightness();
    if (newBrightness !== brightness) {
      setBrightness(newBrightness);
    }
  }, [realLights]);

  const theme = useTheme();
  const styles = StyleSheet.create({
    trackStyle: { height: 5 },
    thumbStyle: {
      backgroundColor: tinycolor(
        light?.leds?.colors ? light.leds.colors[0] : "#000",
      )
        .spin(180)
        .toHexString(),
      borderRadius: 20,
      height: 30,
      width: 30,
    },
  });

  const disabled =
    some(realLights, (l: Light) => l.leds.pattern === "custom") ||
    some(realLights, (l: Light) => !l.isOn);

  const updateBrightness = (b: number) => {
    realLights.forEach((l: Light) => {
      const ax = axios.patch(`/lights/${l.id}/brightness`, {
        brightness: Math.round(b),
      });
      ax.catch((err: AxiosError) => {
        setBrightness(l.brightness);
        snackbar.makeSnackbar(
          err.response?.data.message ?? "Nothing",
          theme.colors.error,
        );
      });
    });
  };
  return (
    <Slider
      minimumTrackTintColor={
        // eslint-disable-next-line no-nested-ternary
        !disabled
          ? light?.leds?.colors
            ? light.leds.colors[0]
            : "#fff"
          : theme.colors.disabled
      }
      disabled={disabled}
      minimumValue={1}
      maximumValue={255}
      value={brightness}
      trackStyle={styles.trackStyle}
      thumbStyle={styles.thumbStyle}
      onValueChange={(value: number) => setBrightness(value)}
      onSlidingComplete={(value: number) => updateBrightness(value)}
    />
  );
}
