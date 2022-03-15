import { Light } from "@devlights/types";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { map } from "lodash";
import React from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Text, useTheme } from "react-native-paper";
import { useLights } from "../../hooks/useLights";
import { useTags } from "../../hooks/useTags";
import Powerbulb from "../Powerbulb";
import { TagScreenNavigationProp } from "../TagScreen/TagScreen";
import getContrastTextColor from "../textContrast";

interface TagCardProps {
  tag: string;
}

export default function TagCard(props: TagCardProps): JSX.Element {
  const { tag } = props;
  const swipeableRef = React.useRef<Swipeable>(null);
  const lights = useLights().lights.filter((l: Light) => l.tags?.includes(tag));

  const tags = useTags();
  const navigation = useNavigation<TagScreenNavigationProp>();
  const theme = useTheme();
  const styles = StyleSheet.create({
    animated_view: {
      flex: 1,
      backgroundColor: theme.colors.grey,
      alignItems: "center",
      alignContent: "center",
      justifyContent: "center",
    },
    action_container: {
      width: 80,
      flexDirection: "row",
    },
    swipeable: {
      height: 100,
      backgroundColor: theme.colors.grey,
      width: Dimensions.get("window").width * 0.8,
      marginTop: 15,
      borderRadius: 12,
    },
    touchable: {
      height: "100%",
      width: "100%",
      backgroundColor: theme.colors.accent,
    },
    tag: {
      color: getContrastTextColor(theme.colors.accent),
      marginLeft: theme.spacing(4),
      marginTop: theme.spacing(4),
      fontSize: 18,
    },
  });

  const deleteTag = async () => {
    await lights.forEach(async (l: Light): Promise<void> => {
      await axios.delete(`/lights/${l.id}/tags`, {
        data: { tags: [tag] },
      });
    });
    tags.fetch();
  };

  const renderLeftAction = (
    x: number,
    progress: Animated.AnimatedInterpolation,
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 80],
      outputRange: [0, x],
    });
    return (
      <View style={styles.action_container}>
        <Animated.View
          style={[
            styles.animated_view,
            {
              transform: [{ translateX: trans }],
              backgroundColor: theme.colors.secondary,
            },
          ]}
        >
          <TouchableOpacity onPress={deleteTag}>
            <FontAwesomeIcon icon={faTrash} size={30} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderRightAction = (
    x: number,
    progress: Animated.AnimatedInterpolation,
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    return (
      <View style={styles.action_container}>
        <Animated.View
          style={[styles.animated_view, { transform: [{ translateX: trans }] }]}
        >
          <Powerbulb
            onBulbPress={() => swipeableRef.current?.close()}
            ids={map(lights, "id")}
            type="tag"
            tag={tag}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={styles.swipeable}
      renderLeftActions={(progress) => renderLeftAction(80, progress)}
      renderRightActions={(progress) => renderRightAction(80, progress)}
    >
      <TouchableWithoutFeedback
        style={styles.touchable}
        onPress={() => navigation.navigate("tag", { tag })}
      >
        <Text style={styles.tag}>{tag}</Text>
      </TouchableWithoutFeedback>
    </Swipeable>
  );
}
