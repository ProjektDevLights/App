import * as React from "react";
import { AlarmsContext, AlarmsContextType } from "./AlarmsProvider";

export default function useAlarms(): React.ContextType<typeof AlarmsContext> {
  return React.useContext<AlarmsContextType>(AlarmsContext);
}
