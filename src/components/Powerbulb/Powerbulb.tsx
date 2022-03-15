/* eslint-disable react/require-default-props */
import { Light, Response } from "@devlights/types";
import { faLightbulb as regular } from "@fortawesome/free-regular-svg-icons";
import { faLightbulb, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import axios, { AxiosResponse } from "axios";
import { map } from "lodash";
import React from "react";
import { PressableProps } from "react-native";
import { useTheme } from "react-native-paper";
import { useLights } from "../../hooks/useLights";
import useSnackbar from "../../hooks/useSnackbar";
import Icon from "../Icon";

interface PowerBulbProps extends PressableProps {
  ids: string[];
  tag?: string;
  onBulbPress?: () => void;
  type: "light" | "tag";
}

export default function PowerBulb(props: PowerBulbProps): JSX.Element {
  const { ids, onBulbPress, type, tag, ...rest } = props;

  const lights = useLights().lights.filter((l) => ids.includes(l.id));
  const snackbar = useSnackbar();
  const theme = useTheme();

  const areAllOn = (): boolean => {
    const ons = map(lights, "isOn");
    if (ons.includes(false)) return false;
    return true;
  };
  const [icon, setIcon] = React.useState<IconDefinition>(
    areAllOn() ? faLightbulb : regular,
  );

  React.useEffect(() => {
    setIcon(areAllOn() ? faLightbulb : regular);
  }, [areAllOn()]);

  const onPress = (status: boolean) => {
    setIcon(status ? faLightbulb : regular);
    if (onBulbPress) onBulbPress();

    if (type === "light") {
      const ax = axios.patch(
        `/lights/${lights[0].id}/${status ? "on" : "off"}`,
      );
      ax.then((res) => {
        snackbar.makeSnackbar(res.data.message, theme.colors.success);
      }).catch((err) => {
        snackbar.makeSnackbar(err.response.data.message, theme.colors.error);
        setIcon(status ? regular : faLightbulb);
      });
    } else if (type === "tag") {
      const ax = axios.patch(`/tags/${tag}/${status ? "on" : "off"}`);
      ax.then((res: AxiosResponse<Response<Light[]>>) => {
        snackbar.makeSnackbar(res.data.message, theme.colors.success);
      }).catch((err) => {
        setIcon(status ? regular : faLightbulb);
        snackbar.makeSnackbar(err.response.data.message, theme.colors.error);
      });
    }
  };
  return (
    <Icon
      position="right"
      color={theme.colors.accent}
      icon={icon}
      onPress={() => onPress(!areAllOn())}
      {...rest}
    />
  );
}
