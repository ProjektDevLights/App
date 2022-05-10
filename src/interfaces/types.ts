import { CustomData, Light, Pattern, Response } from "@devlights/types";
import { AxiosResponse } from "axios";

export type Theme = "Light" | "Dark" | "System-Default";
export type Custom = {
  repeat: number;
  leds: string[];
};

export type LightResponse = AxiosResponse<Response<Light>>;
export type ColorModal = {
  color: string;
  onSubmit: (color: string, i?: number) => Promise<boolean> | boolean;
  index?: number;
};
/**
 * Types for the LightsNavigator
 */
export type LightsStackParamList = {
  home: undefined;
  light: {
    id: string;
  };
  custom: {
    id: string;
    type: "tag" | "light" | "alarm";
    custom_sequence?: CustomData[];
    onSubmit: () => Promise<Pattern>;
  };
  color_modal: ColorModal;
  favourite: undefined;
};

/**
 * Types for the Tags Navigator
 */
export type TagsStackParamList = {
  home: undefined;
  tag: {
    tag: string;
  };
  custom: {
    id: string;
    type: "tag" | "light" | "alarm";
    onSubmit: () => Promise<Pattern>;
  };
  color_modal: ColorModal;
};
/**
 * Types for Alarm Navigator
 */
export type AlarmStackParamList = {
  home: undefined;
  color_modal: ColorModal;
  alarm_pattern: {
    id: string;
  };
  custom: {
    id: string;
    type: "tag" | "light" | "alarm";
    onSubmit: () => Promise<Pattern>;
  };
};
