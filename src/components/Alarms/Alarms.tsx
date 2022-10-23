import axios, { AxiosError, AxiosResponse } from "axios";
import { indexOf, map } from "lodash";
import moment from "moment";
import React from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import { Modalize } from "react-native-modalize";
import {
  FAB,
  Text,
  Title,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { useAlarms } from "../../hooks/useAlarms";
import useNetwork from "../../hooks/useNetwork";
import useSnackbar from "../../hooks/useSnackbar";
import AlarmCard from "../AlarmCard/AlarmCard";
import AlarmFooter from "../AlarmFooter";
import AlarmHeader from "../AlarmHeader";
import ApplyDialog from "../ApplyDialog";
import TimePicker from "../TimePicker";

export default function Alarms(): JSX.Element {
  const { alarms } = useAlarms();
  const [avaible, setAvaible] = React.useState<boolean>(true);
  const network = useNetwork();
  const modalizeRef = React.useRef<Modalize>(null);
  const [activeSections, setActiveSections] = React.useState<number[]>([]);
  const [newAlarm, setNewAlarm] = React.useState<{
    time: string;
    days: number[];
    ids: string[];
  }>({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
  const [visible, setVisible] = React.useState<boolean>(false);
  const theme = useTheme();
  const snackbar = useSnackbar();

  React.useEffect(() => {
    setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
    return setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
  }, []);

  const getavailable = async () => {
    const ax = axios.get("/ping", { timeout: 1000 });
    ax.then((res: AxiosResponse) => {
      if (res.data === "Pong") {
        setAvaible(true);
      }
    }).catch(() => {
      setAvaible(false);
    });
  };

  React.useEffect(() => {
    getavailable();
  }, [network]);

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing(2),
    },
    contentContainerStyle: {
      alignItems: "center",
    },
    title: {
      paddingTop: 30,
      marginBottom: 10,
      fontSize: 40,
    },
    headerText: {
      fontSize: 30,
      marginLeft: theme.spacing(5),
      paddingVertical: theme.spacing(2),
    },
    fab: {
      position: "absolute",
      margin: theme.spacing(8),
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
  });

  const fetchAlarms = async () => {
    await getavailable();
  };

  const handleAlarmCreation = (ids: string[]) => {
    axios
      .put("/alarm", {
        name: "Alarm",
        leds: { colors: ["#00ff6a"], pattern: "plain" },
        days: newAlarm.days,
        time: newAlarm.time,
        ids,
      })
      .then(() => {
        setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
      })
      .catch((err: AxiosError) => {
        setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
        snackbar.makeSnackbar(
          err.response?.data.message ?? "Error while creating a new alarm",
          theme.colors.error,
        );
      });
  };

  const getVisibility = (): boolean => {
    if (!network || !avaible) return false;
    return true;
  };

  const handleFooterPress = (isActive: boolean, index: number) => {
    if (isActive) {
      setActiveSections([index]);
    } else {
      const old = [...activeSections];
      const oldIndex = indexOf(old, index);
      old.splice(oldIndex, 1);
      setActiveSections(old);
    }
  };

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchAlarms} />
        }
        contentContainerStyle={styles.contentContainerStyle}
      >
        <Title style={styles.title}>Alarms</Title>
        {alarms.length > 0 ? (
          <Accordion
            duration={100}
            renderFooter={(
              content: string,
              index: number,
              isActive: boolean,
            ) => (
              <AlarmFooter
                isActive={isActive}
                id={content}
                onPress={(open: boolean) => handleFooterPress(open, index)}
              />
            )}
            touchableComponent={TouchableRipple}
            activeSections={activeSections}
            containerStyle={styles.container}
            sectionContainerStyle={{
              width: Dimensions.get("window").width,
            }}
            underlayColor="rgba(255,255,255,0.3)"
            onChange={(indexes: number[]) => setActiveSections(indexes)}
            renderHeader={(content: string, index: number) => (
              <AlarmHeader id={content} index={index} />
            )}
            renderContent={(content: string) => (
              <AlarmCard key={content} id={content} />
            )}
            sections={map(alarms, "id")}
          />
        ) : (
          <Text> Sorry! There arent any alarms yet</Text>
        )}
      </ScrollView>
      <FAB
        visible={getVisibility()}
        style={styles.fab}
        onPress={() => setVisible(true)}
        icon="plus"
      />
      <TimePicker
        time={`${moment().get("hour")}:${moment().get("minute")}`}
        visible={visible}
        close={() => setVisible(false)}
        onConfirm={(time: string) => {
          setNewAlarm({ ...newAlarm, time });
          modalizeRef.current?.open();
        }}
      />
      <ApplyDialog
        title="Choose Lights"
        ignoreLightOff
        ids={[]}
        ref={modalizeRef}
        onConfirm={async (ids: string[]) => {
          handleAlarmCreation(ids);
          modalizeRef.current?.close();
        }}
      />
    </>
  );
}
