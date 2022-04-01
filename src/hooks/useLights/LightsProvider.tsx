import { Light, Response } from "@devlights/types";
import axios, { AxiosResponse } from "axios";
import { isEqual, orderBy } from "lodash";
import React from "react";
import { DragEndParams } from "react-native-draggable-flatlist";

export type LightsContextType = {
  lights: Light[];
  fetch: () => Promise<void>;
  updateLight: (l: Light) => void;
  updateLights: (l: Light[]) => void;
  updatePos: (params: DragEndParams<Light>) => void;
};

export const LightsContext = React.createContext<LightsContextType>({
  lights: [],
  fetch: () => new Promise(() => {}),
  updateLight: (l: Light) => undefined,
  updateLights: (l: Light[]) => undefined,
  updatePos: (params: DragEndParams<Light>) => undefined,
});

export interface LightsProviderProps {
  children: React.ReactNode;
}

function LightsProvider(props: LightsProviderProps): JSX.Element {
  const { children } = props;
  const [lights, setLights] = React.useState<Light[]>([]);
  const lightsRef = React.useRef(lights);

  const sortLights = (pLights: Light[]): Light[] => {
    const orderLights = orderBy(pLights, ["position"], ["asc"]);

    return orderLights;
  };

  const updatePos = (params: DragEndParams<Light>) => {
    axios
      .patch(`/lights/${lights[params.from].id}/position`, {
        position: params.to,
      })
      .then((res: AxiosResponse<Response<Light[]>>) => {
        setLights(sortLights(res.data.object));
      });
  };

  const fetch = async () => {
    const res: AxiosResponse<Response<Light[]>> = await axios.get("/lights");

    setLights(sortLights(res.data.object));
  };

  const updateLight = (light: Light): void => {
    const index = lightsRef.current.findIndex((l: Light) => l.id === light.id);
    if (index > -1) {
      lightsRef.current[index] = light;
      setLights(sortLights([...lightsRef.current]));
    }
  };

  const updateLights = (pLights: Light[]): void => {
    pLights.forEach((light: Light) => {
      const index = lightsRef.current.findIndex(
        (l: Light) => l.id === light.id,
      );
      lightsRef.current[index] = light;
    });
    setLights(lightsRef.current);
  };

  React.useEffect(() => {
    if (!isEqual(lightsRef.current, lights)) {
      lightsRef.current = lights;
    }
  }, [lights]);

  const listen = () => {
    socket.on("light_change", (light: Light) => {
      updateLight(light);
    });
    socket.on("light_add", (light: Light) => {
      setLights([...lightsRef.current, light]);
    });
    socket.on("light_remove", (light: Light) => {
      const index = lightsRef.current.findIndex(
        (l: Light) => l.id === light.id,
      );
      if (index > -1) {
        lightsRef.current.splice(index, 1);
        setLights([...lightsRef.current]);
      }
    });
    socket.on("light_change_multiple", (pLights: Light[]) => {
      updateLights(pLights);
    });
  };

  React.useEffect(() => {
    fetch();
    listen();
  }, []);

  return (
    <LightsContext.Provider
      value={{ lights, fetch, updateLight, updateLights, updatePos }}
    >
      {children}
    </LightsContext.Provider>
  );
}

export default LightsProvider;
