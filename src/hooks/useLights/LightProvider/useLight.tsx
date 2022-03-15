import * as React from "react";
import { LightContext, LightContextType } from "./LightProvider";

export default function useLight(): React.ContextType<typeof LightContext> {
  return React.useContext<LightContextType>(LightContext);
}
