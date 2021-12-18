import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React from "react";

export type HostContextType = {
  setHostName: (hostname: string) => void;
  setHostPort: (port: number) => void;
  getHostName: () => string;
  getPort: () => number;
};

const HostContext = React.createContext<HostContextType>({
  getHostName: () => "devlight",
  getPort: () => 80,
  setHostName: () => null,
  setHostPort: () => null,
});

export interface ProviderProps {
  children?: JSX.Element;
}

export default function HostProvider(props: ProviderProps): JSX.Element {
  const [hostName, setHost] = React.useState<string>("http://devlight");
  const [port, setPort] = React.useState<number>(80);

  const setHostName = (newHostname: string) => {
    if (newHostname === hostName) return;
    setHost(`http://${newHostname}`);
    AsyncStorage.setItem("hostname", `http://${newHostname}`);
  };

  const setHostPort = (newPort: number) => {
    if (newPort === port) return;
    setPort(newPort);
    AsyncStorage.setItem("port", newPort.toString());
  };

  const fetch = async () => {
    const storeHost = (await AsyncStorage.getItem("hostname")) as string;
    const storePort = parseInt(
      (await AsyncStorage.getItem("port")) as string,
      10,
    );
    if (Number.isNaN(storePort)) {
      AsyncStorage.setItem("port", "80");
    }

    axios.defaults.baseURL = `${storeHost ?? hostName}:${
      // eslint-disable-next-line no-nested-ternary
      storePort ? (!isNaN(storePort) ? storePort : port) : port
    }`;
    setHost(storeHost ?? "http://devlight");
    setPort(storePort ? (!isNaN(storePort) ? storePort : 80) : 80);
  };

  React.useEffect(() => {
    axios.defaults.baseURL = `${hostName}:${port}`;
  }, [hostName, port]);

  React.useEffect(() => {
    fetch();
  }, []);

  const { children } = props;
  return (
    <HostContext.Provider
      value={{
        setHostName,
        setHostPort,
        getHostName: () => hostName,
        getPort: () => port,
      }}
    >
      {children}
    </HostContext.Provider>
  );
}

export { HostContext };
