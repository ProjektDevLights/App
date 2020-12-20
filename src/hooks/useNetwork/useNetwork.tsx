import { useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export default function useNetwork(): boolean {
  const [hasNetwork, setNetwork] = useState<boolean>(false);
  useEffect(() => {
    function setNetworkStatus(status: NetInfoState) {
      // console.log(status);
      if (status.isConnected) {
        if (!status.isInternetReachable) { setNetwork(false); return;}
        if (status.type === "wifi" || status.type === "ethernet") {
          setNetwork(true);
        } else if (!status.isWifiEnabled) {
          setNetwork(false);
        }
      } else {
        setNetwork(false);
      }
    }
    NetInfo.addEventListener((state) => {
      setNetworkStatus(state);
    });
  });
  return hasNetwork;
}