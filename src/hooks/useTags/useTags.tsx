import * as React from "react";
import { TagsContext, TagsContextType } from "./TagsProvider";

export default function useTags(): React.ContextType<typeof TagsContext> {
  return React.useContext<TagsContextType>(TagsContext);
}
