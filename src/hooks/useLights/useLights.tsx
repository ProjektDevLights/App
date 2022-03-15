import * as React from "react";
import { LightsContext, LightsContextType } from "./LightsProvider";

export default function useLights(): React.ContextType<typeof LightsContext> {
  return React.useContext<LightsContextType>(LightsContext);
}
