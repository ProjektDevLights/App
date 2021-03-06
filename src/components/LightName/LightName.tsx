import { Light } from "@devlights/types";
import axios from "axios";
import React from "react";
import { useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import useSnackbar from "../../hooks/useSnackbar";
import { LightResponse } from "../../interfaces/types";
import { setLight } from "../../store/actions/lights";
import ChangeableText from "../ChangeableText";

export interface LightNameProps {
  light: Light;
}
export default function LightName(props: LightNameProps): JSX.Element {
  const { light } = props;
  const theme = useTheme();
  const snackbar = useSnackbar();
  const dispatch = useDispatch();
  const [error, setError] = React.useState<boolean>();

  const changeName = (name: string) => {
    if (name === light.name) return;
    const ax = axios.patch(`/lights/${light.id}/update`, { name });
    ax.then((res: LightResponse) => {
      snackbar.makeSnackbar(res.data.message, theme.colors.success);
      dispatch(setLight(light.id, res.data.object));
      setError(false);
    });
    ax.catch(() => {
      setError(true);
    });
  };
  return (
    <ChangeableText
      error={error}
      value={light.name}
      onSave={changeName}
      style={{ marginBottom: theme.spacing(5) }}
    />
  );
}
