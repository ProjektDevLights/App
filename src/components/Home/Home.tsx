import { Light, Response } from "@devlights/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import * as SplashScreen from "expo-splash-screen";
import { orderBy } from "lodash";
import Lottie from "lottie-react-native";
import * as React from "react";
import {
  Dimensions,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { ActivityIndicator, Text, Title, useTheme } from "react-native-paper";
import { io, Socket } from "socket.io-client";
import { useHost } from "../../hooks/useHost";
import { useLights } from "../../hooks/useLights";
import useNetwork from "../../hooks/useNetwork";
import { Theme } from "../../interfaces/types";
import LightCard from "../LightCard";
import { useThemeChange } from "../ThemeDialog";

interface SpinnerProps {
  visible: boolean;
}

type AxiosPromise<T> = Promise<AxiosResponse<Response<T>>>;

export function Spinner(props: SpinnerProps): JSX.Element {
  const styles = StyleSheet.create({
    container: {
      height: "75%",
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
    },
    indicator: {
      alignSelf: "center",
      alignItems: "center",
    },
  });
  const { visible } = props;
  return (
    <>
      {visible ? (
        <View style={styles.container}>
          <ActivityIndicator style={styles.indicator} size={60} />
        </View>
      ) : (
        <View />
      )}
    </>
  );
}

export default function Home(): JSX.Element {
  const theme = useTheme();
  const host = useHost();
  const { lights, updateLights } = useLights();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  const themeChange = useThemeChange();
  const network = useNetwork();
  const fetchTheme = async () => {
    const storage = await AsyncStorage.getItem("theme");
    const type: Theme = (storage as Theme) ?? "Dark";
    await themeChange.changeTheme(type);
    return theme;
  };

  const sortLights = (pLights: Light[]) => {
    const orderLights = orderBy(pLights, ["position"], ["asc"]);

    // updateLights(orderLights);
  };

  React.useEffect(() => {
    sortLights(lights);
  }, [lights]);

  const joinSocket = () => {
    const socketHost = `${`${host.getHostName()}:${host.getPort()}`}`;

    const s = io(socketHost);

    global.socket = s;
  };

  const fetch = async (pRefresh = false) => {
    if (pRefresh) setRefreshing(true);
    //setLoading(true);
    setError(false);
    await fetchTheme();

    SplashScreen.hideAsync();
  };

  const updatePos = (params: DragEndParams<Light>) => {
    axios
      .patch(`/lights/${lights[params.from].id}/position`, {
        position: params.to,
      })
      .then((res: AxiosResponse<Response<Light[]>>) => {
        sortLights(res.data.object);
      });
  };

  React.useEffect(() => {
    fetch();
    joinSocket();
    return () => {
      socket?.disconnect();
      setSocket(null);
    };
  }, [host.getHostName(), host.getPort()]);

  React.useEffect(() => {
    fetch();

    return () => {
      socket?.disconnect();
      setSocket(null);
    };
  }, [network]);
  const styles = StyleSheet.create({
    container: { width: "100%", height: "100%" },
    title: {
      paddingTop: 30,
      marginBottom: 10,
      fontSize: 40,
      textAlign: "center",
    },
    contentContainerStyle: {
      alignItems: "center",
      height:
        loading || error || lights.length < 1
          ? "100%"
          : Dimensions.get("window").height * 0.2 + lights.length * 140,
    },
    error_text: {
      textAlign: "center",
      fontSize: 16,
    },
  });
  // TODO find solution for scrollview, draggablelist has a bug with refreshcontrols
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />

      <DraggableFlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetch} />
        }
        data={lights}
        ListHeaderComponent={<Title style={styles.title}>Lights</Title>}
        style={{ height: Dimensions.get("window").height * 0.8 }}
        contentContainerStyle={styles.contentContainerStyle}
        nestedScrollEnabled
        ListEmptyComponent={
          loading && !error ? (
            <Spinner visible={loading} />
          ) : (
            <>
              <Lottie
                duration={4000}
                autoPlay
                hardwareAccelerationAndroid
                loop={false}
                autoSize
                // eslint-disable-next-line global-require
                source={require("../../../assets/animations/bulb.json")}
              />
              <Text style={styles.error_text}>
                Sorry! We couldn`t find any lights in your Network.
                {"\n"}
                Plug some in and they will appear here.
              </Text>
            </>
          )
        }
        onDragEnd={(params: DragEndParams<Light>) => updatePos(params)}
        keyExtractor={(item: Light, index: number) => `light_card_${index}`}
        renderItem={(params: RenderItemParams<Light>) => (
          <LightCard
            onLongPress={params.drag}
            key={`light_card_${params.index}`}
            light={params.item}
          />
        )}
      />
    </View>
  );
}
