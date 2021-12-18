import * as React from "react";
import { HostContext, HostContextType } from "./HostProvider";

export default function useSnackbar(): React.ContextType<typeof HostContext> {
  return React.useContext<HostContextType>(HostContext);
}
