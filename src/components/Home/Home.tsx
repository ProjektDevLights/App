import { Alarm, Light, Response } from "@devlights/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import * as SplashScreen from "expo-splash-screen";
import { isEqual, orderBy, sortBy } from "lodash";
import Lottie from "lottie-react-native";
import allSettled from "promise.allsettled";
import * as React from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { ActivityIndicator, Text, Title, useTheme } from "react-native-paper";
import { useSelector, useStore } from "react-redux";
import { io, Socket } from "socket.io-client";
import useNetwork from "../../hooks/useNetwork";
import { LightResponse, Theme } from "../../interfaces/types";
import { Store } from "../../store";
import {
  addAlarm,
  editAlarm,
  removeAlarm,
  setAlarms,
} from "../../store/actions/alarms";
import {
  setFavouriteColors,
  setFavouriteGradients,
} from "../../store/actions/favourites";
import {
  removeLight,
  setAllLights,
  setLight,
} from "../../store/actions/lights";
import { setTags } from "../../store/actions/tags";
import { lightsEquality } from "../../utils";
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
  const store = useStore();
  const lights: Light[] = useSelector(
    (state: Store) => state.lights,
    (l: Light[], r: Light[]) => lightsEquality(l, r),
  );
  const [loading, setLoading] = React.useState<boolean>(false);
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

    store.dispatch(setAllLights(orderLights));
  };

  React.useEffect(() => {
    console.log("change");

    sortLights(lights);
  }, [lights]);

  const joinSocket = () => {
    const s = io("http://devlight");
    s.on("light_change", (light: Light) => {
      if (light.name === "Fake 3") console.log("fake change");

      store.dispatch(setLight(light.id, light));
    });
    s.on("light_add", (light: Light) => {
      store.dispatch(setLight(light.id, light));
    });
    s.on("light_remove", (light: Light) => {
      store.dispatch(removeLight(light.id));
    });
    s.on("light_change_multiple", (pLights: Light[]) => {
      pLights.forEach((light: Light) => {
        store.dispatch(setLight(light.id, light));
      });
    });
    s.on("alarm_change", (alarm: Alarm) => {
      store.dispatch(editAlarm(alarm));
    });
    s.on("alarm_add", (alarm: Alarm) => {
      store.dispatch(addAlarm(alarm));
    });
    s.on("alarm_remove", (alarm: Alarm) => {
      store.dispatch(removeAlarm(alarm));
    });
    setSocket(s);
  };

  const fetch = async () => {
    setLoading(true);
    setError(false);
    const fetching = fetchTheme();

    const lightPromise: AxiosPromise<Light[]> = axios.get("/lights");
    const alarmPromise: AxiosPromise<Alarm[]> = axios.get("/alarm");
    const tagsPromise: AxiosPromise<string[]> = axios.get("/tags");
    const promises: Promise<AxiosResponse<LightResponse> | unknown>[] = [];
    promises.push(fetching);
    if (network) {
      promises.push(lightPromise);
      promises.push(tagsPromise);
      promises.push(alarmPromise);
    }
    // TODO Type val
    allSettled(promises).then((val: any[]) => {
      try {
        if (val[1]) {
          sortLights(val[1].value.data.object, true);
        } else {
          store.dispatch(setAllLights([]));
          setError(true);
        }
        if (val[2]) {
          store.dispatch(setTags(val[2].value.data.object));
        } else {
          store.dispatch(setTags([]));
        }
        if (val[3]) {
          store.dispatch(setAlarms(val[3].value.data.object));
        } else {
          store.dispatch(setAlarms([]));
        }
        setLoading(false);

        if (socket === null || socket?.connected === false) {
          joinSocket();
        }
      } catch {
        setLoading(false);
        setError(true);
      }
      SplashScreen.hideAsync();
    });

    const favouriteColors: string | null = await AsyncStorage.getItem(
      "favouriteColors",
    );
    const favouriteGradients: string | null = await AsyncStorage.getItem(
      "favouriteGradients",
    );
    if (favouriteColors != null) {
      store.dispatch(
        setFavouriteColors(Array.from(JSON.parse(favouriteColors))),
      );
    }
    if (favouriteGradients != null) {
      store.dispatch(
        setFavouriteGradients(Array.from(JSON.parse(favouriteGradients))),
      );
    }
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
        data={lights}
        ListHeaderComponent={<Title style={styles.title}>Lights</Title>}
        style={{ height: Dimensions.get("window").height * 0.8 }}
        onRefresh={fetch}
        contentContainerStyle={styles.contentContainerStyle}
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
