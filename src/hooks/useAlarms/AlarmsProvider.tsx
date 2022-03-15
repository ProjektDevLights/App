import { Alarm, Response } from "@devlights/types";
import axios, { AxiosResponse } from "axios";
import React from "react";

export type AlarmsContextType = {
  alarms: Alarm[];
  fetch: () => Promise<void>;
  updateAlarm: (a: Alarm) => void;
  updateAlarms: (a: Alarm[]) => void;
};

export const AlarmsContext = React.createContext<AlarmsContextType>({
  alarms: [],
  fetch: () => new Promise(() => {}),
  updateAlarm: (a: Alarm) => undefined,
  updateAlarms: (a: Alarm[]) => undefined,
});

export interface AlarmsProviderProps {
  children: React.ReactNode;
}

function AlarmsProvider(props: AlarmsProviderProps): JSX.Element {
  const { children } = props;
  const [alarms, setAlarms] = React.useState<Alarm[]>([]);
  const alarmsRef = React.useRef(alarms);
  const fetch = async () => {
    const res: AxiosResponse<Response<Alarm[]>> = await axios.get("/alarm");
    setAlarms(res.data.object);
  };

  const updateAlarm = (alarm: Alarm, server = false): void => {
    if (server) {
      axios.patch(`/alarm/${alarm.id}`, alarm);
    }
    const index = alarmsRef.current.findIndex((a: Alarm) => a.id === alarm.id);
    if (index > -1) {
      alarmsRef.current[index] = alarm;
      setAlarms([...alarmsRef.current]);
    }
  };

  const updateAlarms = (pAlarms: Alarm[]): void => {
    pAlarms.forEach((light: Alarm) => {
      const index = alarmsRef.current.findIndex(
        (l: Alarm) => l.id === light.id,
      );
      alarmsRef.current[index] = light;
    });
    setAlarms(alarmsRef.current);
  };

  React.useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);

  const listen = () => {
    socket?.on("alarm_change", (alarm: Alarm) => {
      updateAlarm(alarm);
    });
    socket?.on("alarm_add", (alarm: Alarm) => {
      setAlarms([...alarmsRef.current, alarm]);
    });
    socket.on("alarm_remove", (alarm: Alarm) => {
      const index = alarmsRef.current.findIndex(
        (a: Alarm) => a.id === alarm.id,
      );
      if (index > -1) {
        alarmsRef.current.splice(index, 1);
        setAlarms([...alarmsRef.current]);
      }
    });
  };

  React.useEffect(() => {
    fetch();
    listen();
  }, []);

  return (
    <AlarmsContext.Provider
      value={{ alarms, fetch, updateAlarm, updateAlarms }}
    >
      {children}
    </AlarmsContext.Provider>
  );
}

export default AlarmsProvider;
