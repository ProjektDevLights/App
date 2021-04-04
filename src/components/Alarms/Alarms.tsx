import { Alarm, Response } from "@devlights/types";
import axios, { AxiosResponse } from "axios";
import { indexOf, isEqual, map } from "lodash";
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
import { useDispatch, useSelector } from "react-redux";
import { Store } from "../../store";
import { addAlarm, setAlarms } from "../../store/actions/alarms";
import AlarmCard from "../AlarmCard/AlarmCard";
import AlarmFooter from "../AlarmFooter";
import AlarmHeader from "../AlarmHeader";
import ApplyDialog from "../ApplyDialog";
import TimePicker from "../TimePicker";

export default function Alarms(): JSX.Element {
  const alarms: Alarm[] =
    useSelector(
      (state: Store) => state.alarms,
      (l: Alarm[], r: Alarm[]) => isEqual(l, r),
    ) || [];
  const dispatch = useDispatch();
  const modalizeRef = React.useRef<Modalize>(null);
  const [activeSections, setActiveSections] = React.useState<number[]>([]);
  const [newAlarm, setNewAlarm] = React.useState<{
    time: string;
    days: number[];
    ids: string[];
  }>({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
  const [visible, setVisible] = React.useState<boolean>(false);
  const theme = useTheme();

  React.useEffect(() => {
    return setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
  }, []);

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

  const fetchAlarms = () => {
    axios.get("http://devlight/alarm").then((res: AxiosResponse) => {
      dispatch(setAlarms(res.data.object));
    });
  };

  const handleAlarmCreation = (ids: string[]) => {
    axios
      .put("http://devlight/alarm", {
        name: "Alarm",
        color: "#00ff6a",
        days: newAlarm.days,
        time: newAlarm.time,
        ids,
      })
      .then((res: AxiosResponse<Response<Alarm>>) => {
        dispatch(addAlarm(res.data.object));
        setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
      })
      .catch(() => {
        setNewAlarm({ time: "00:00", days: [0, 1, 2, 3, 4, 5, 6], ids: [] });
      });
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
      <FAB style={styles.fab} onPress={() => setVisible(true)} icon="plus" />
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
