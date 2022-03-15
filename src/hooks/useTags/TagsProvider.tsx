import { Light, Response } from "@devlights/types";
import axios, { AxiosResponse } from "axios";
import React from "react";
import { useLights } from "../useLights";

export type TagsContextType = {
  tags: string[];
  fetch: () => Promise<void>;
  updateTag: (tag: string, key: string, data: any) => void;
  getLightsFromTag: (tag: string) => Light[];
};

export const TagsContext = React.createContext<TagsContextType>({
  tags: [],
  fetch: () => new Promise(() => {}),
  updateTag: (tag: string, key: string, data: any) => undefined,
  getLightsFromTag: (tag: string) => [],
});

export interface TagsProviderProps {
  children: React.ReactNode;
}

function TagsProvider(props: TagsProviderProps): JSX.Element {
  const { children } = props;
  const [tags, setTags] = React.useState<string[]>([]);
  const { lights } = useLights();
  const tagsRef = React.useRef(tags);
  const fetch = async () => {
    const res: AxiosResponse<Response<string[]>> = await axios.get("/tags");
    setTags(res.data.object);
  };

  const updateTag = (tag: string, key: string, data: any) => {
    if (tags.includes(tag)) {
      axios.patch(`/tags/${tag}/${key}`, data);
    }
  };

  const getLightsFromTag = (tag: string): Light[] =>
    lights.filter((l: Light) => l.tags.includes(tag));

  React.useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  React.useEffect(() => {
    fetch();
  }, []);

  return (
    <TagsContext.Provider value={{ tags, fetch, updateTag, getLightsFromTag }}>
      {children}
    </TagsContext.Provider>
  );
}

export default TagsProvider;
