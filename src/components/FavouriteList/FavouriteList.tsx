import * as React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { useFavourites } from "../../hooks/useFavourites";

export interface FavouriteListProps {
  onPress: (fav: string) => void;
}

export default function FavouriteList(props: FavouriteListProps): JSX.Element {
  const favouriteColors: string[] = useFavourites().colors;
  const styles = StyleSheet.create({
    container: { width: "100%", height: 120, alignItems: "center" },
    scrollview: { height: 45, marginBottom: 30 },
    contentContainer: { height: 45 },
    text: { textAlignVertical: "top", fontSize: 18, marginBottom: 10 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Favourite Colors</Text>
      <ScrollView
        horizontal
        style={styles.scrollview}
        contentContainerStyle={styles.contentContainer}
      >
        {favouriteColors.length > 0 ? (
          favouriteColors.map((fav: string) => {
            const style = StyleSheet.create({
              avatar: { backgroundColor: fav, marginLeft: 10 },
            });
            return (
              <Pressable key={fav} onPress={() => props.onPress(fav)}>
                <Avatar.Text size={40} style={style.avatar} label="" />
              </Pressable>
            );
          })
        ) : (
          <Text> Nothing here </Text>
        )}
      </ScrollView>
    </View>
  );
}
