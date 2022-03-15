import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Lottie from "lottie-react-native";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text, Title } from "react-native-paper";
import { useTags } from "../../hooks/useTags";
import { TagsStackParamList } from "../../interfaces/types";
import TagCard from "../TagCard";

export type HomeScreenNavigationProp = StackNavigationProp<
  TagsStackParamList,
  "home"
>;
export type HomeScreenRouteProp = RouteProp<TagsStackParamList, "home">;

function Tags(): JSX.Element {
  const { fetch: fetchTags, tags } = useTags();
  const [refresh, setRefresh] = React.useState<boolean>(false);

  const fetch = (refreshing = false) => {
    if (refreshing) setRefresh(true);
    fetchTags().then(() => {
      if (refreshing) setRefresh(false);
    });
  };

  const styles = StyleSheet.create({
    container: { width: "100%", height: "100%" },
    contentContainerStyle: { alignItems: "center" },
    title: {
      paddingTop: 30,
      marginBottom: 10,
      fontSize: 40,
    },
    error_text: {
      textAlign: "center",
      fontSize: 16,
    },
  });
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={() => fetch(true)} />
        }
        contentContainerStyle={styles.contentContainerStyle}
      >
        <Title style={styles.title}>Tags</Title>
        {tags.length === 0 ? (
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
              Sorry! There aren`t any tags yet.
            </Text>
          </>
        ) : (
          tags.map((tag: string) => <TagCard key={tag} tag={tag} />)
        )}
      </ScrollView>
    </View>
  );
}
export default Tags;
