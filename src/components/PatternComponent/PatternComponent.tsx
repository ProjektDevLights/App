import { CustomData, Pattern } from "@devlights/types";
import { AxiosResponse } from "axios";
import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { makeValidColorArray } from "../../utils";
import CustomComponent from "../CustomComponent";
import GradientComponent from "../GradientComponent";
import PlainComponent from "../PlainComponent";
import RainbowComponent from "../RainbowComponent";
import RunnerComponent from "../RunnerComponent";

export interface PatternComponentProps {
  oldPattern?: Pattern | string | undefined;
  newPattern: Pattern;
  colors: string[];
  custom_sequence?: CustomData[];
  timeout: number | undefined;
  disabled: boolean;
  onSubmit: (
    colors: string[],
    timeout: number | undefined,
  ) => Promise<AxiosResponse>;
  id: string;
  type: "light" | "tag";
}

export default function PatternComponent(
  props: PatternComponentProps,
): JSX.Element {
  const {
    newPattern,
    oldPattern,
    colors,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    custom_sequence,
    disabled,
    timeout,
    id,
    type,
  } = props;
  const styles = StyleSheet.create({
    text: {
      textAlign: "center",
    },
  });

  console.log(custom_sequence);
  const onSubmit = async (
    newColor: string | string[],
    newTimeout?: number,
    index?: number,
  ): Promise<boolean> => {
    let success = true;
    const newColors =
      typeof newColor === "string"
        ? makeValidColorArray(
            typeof newColor === "string" ? newColor : "",
            colors,
            index ?? 0,
          )
        : newColor;
    const as = props.onSubmit(
      newColors,
      newTimeout && newTimeout <= 0 ? timeout : newTimeout,
    );
    as.then((res: AxiosResponse) => {
      if (res.status === 304) success = false;
    }).catch(() => {
      success = true;
    });
    return success;
  };

  const getComponent = () => {
    switch (newPattern) {
      case "gradient":
        return (
          <GradientComponent
            disabled={disabled}
            onSubmit={onSubmit}
            colors={colors}
          />
        );
      case "plain":
        return (
          <PlainComponent
            disabled={disabled}
            colors={colors}
            onSubmit={onSubmit}
          />
        );
      case "runner":
        return (
          <RunnerComponent
            disabled={disabled}
            colors={colors}
            timeout={timeout ?? 100}
            onSubmit={onSubmit}
          />
        );
      case "rainbow":
      case "fading":
        return (
          <RainbowComponent
            disabled={disabled}
            onSubmit={onSubmit}
            timeout={timeout ?? 100}
          />
        );
      case "custom":
        return (
          <CustomComponent
            oldPattern={oldPattern}
            colors={colors}
            id={id}
            custom_sequence={custom_sequence}
            type={type}
            onSubmit={onSubmit}
          />
        );

      default:
        return (
          <Text style={styles.text}>
            Changing color is not supported withing pattern {newPattern}
          </Text>
        );
    }
  };

  return <>{getComponent()}</>;
}
