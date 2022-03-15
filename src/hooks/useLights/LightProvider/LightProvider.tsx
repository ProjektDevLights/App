import { Light, Pattern, Response } from "@devlights/types";
import axios, { AxiosError, AxiosResponse } from "axios";
import React from "react";
import { useTheme } from "react-native-paper";
import { useLights } from "..";
import { LightResponse } from "../../../interfaces/types";
import useSnackbar from "../../useSnackbar";

export type LightContextType = {
  switchLight: (val: boolean) => Promise<AxiosResponse>;
  updateColor: (
    pattern: Pattern,
    pColors: string[],
    timeout?: number,
  ) => Promise<AxiosResponse<LightResponse>>;
} & Light;

export const LightContext = React.createContext<LightContextType>({});

interface LightProviderProps {
  id: string;
  children: React.ReactNode;
}

function LightProvider(props: LightProviderProps): JSX.Element {
  const { id, children } = props;
  const { lights } = useLights();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const switchLight = (
    val: boolean,
  ): Promise<AxiosResponse<Response<Light>>> => {
    const ax = axios.patch(`/lights/${lights[0].id}/${val ? "on" : "off"}`);
    ax.then((res) => {
      snackbar.makeSnackbar(res.data.message, theme.colors.success);
    }).catch((err) => {
      snackbar.makeSnackbar(err.response.data.message, theme.colors.error);
    });
    return ax;
  };

  const updateColor = (
    pattern: Pattern,
    pColors: string[],
    timeout?: number,
  ) => {
    const ax = axios.patch(`/lights/${id}/color`, {
      colors: ["fading", "rainbow"].includes(pattern) ? [] : pColors,
      pattern: pattern,
      timeout: timeout,
    });
    ax.then((res: LightResponse) => {
      snackbar.makeSnackbar(res.data.message, theme.colors.success);
    }).catch((err: AxiosError) => {
      snackbar.makeSnackbar(
        err.response?.data.message ?? "Nothing changed!",
        theme.colors.error,
      );
    });
    return ax;
  };

  return (
    <LightContext.Provider
      value={{ ...lights.find((l) => l.id === id), switchLight, updateColor }}
    >
      {children}
    </LightContext.Provider>
  );
}

export default LightProvider;
