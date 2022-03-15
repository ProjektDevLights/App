import { Light } from "@devlights/types";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useNavigation } from "@react-navigation/core";
import axios, { AxiosError } from "axios";
import { map } from "lodash";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Modalize } from "react-native-modalize";
import { Divider, List, Text, useTheme } from "react-native-paper";
import useSnackbar from "../../hooks/useSnackbar";
import { useTags } from "../../hooks/useTags";
import ApplyDialog from "../ApplyDialog";

export interface LightListProps {
  lights: Light[];
  tag: string;
}

export default function LightsList(props: LightListProps): JSX.Element {
  const { lights, tag } = props;
  const navigation = useNavigation();
  const theme = useTheme();
  const { fetch: fetchTags } = useTags();
  const snackbar = useSnackbar();
  const modalizeRef = React.useRef<Modalize>(null);

  /**
   * Remove tags from Light
   * @param id id of the light
   * @param tags the tag which should be removed
   * @param silent wether the tag should not be removed when less than 1 light uses this tag
   */
  const removeTags = (id: string, tags: string[], silent = false) => {
    const ax = axios.delete(`/lights/${id}/tags`, {
      data: { tags },
    });
    ax.then(() => {
      if (lights.length <= 1 && !silent) {
        navigation.goBack();
        fetchTags();
        snackbar.makeSnackbar("Tag has been removed!", theme.colors.error);
      }
    });
  };

  /**
   * add new lights to tag and eventually remove some
   * @param ids the ids given to the tag
   */
  const addLights = (ids: string[]) => {
    const oldIds = map(lights, "id");

    const newIds = [];
    for (let i = 0; i < ids.length; i++) {
      if (!oldIds.includes(ids[i])) newIds.push(ids[i]);
    }

    for (let i = 0; i < oldIds.length; i++) {
      if (!ids.includes(oldIds[i])) removeTags(oldIds[i], [tag], true);
    }

    if (newIds.length > 0) {
      let error = null;
      newIds.forEach((v: string) => {
        axios
          .put(`/lights/${v}/tags`, {
            tags: [tag],
          })
          .catch((err: AxiosError) => {
            error =
              err.response?.data.message ?? "Tag could not be added to light";
          });
      });
      if (error == null) {
        snackbar.makeSnackbar(
          `Successfully added tag ${tag} to the lights!`,
          theme.colors.success,
        );
      } else {
        snackbar.makeSnackbar(error, theme.colors.error);
      }
    }

    modalizeRef.current?.close();
  };

  const styles = StyleSheet.create({
    item_headline: {
      margin: theme.spacing(2),
      fontWeight: "bold",
    },
    item_divider: { margin: 0 },
    list_item: { margin: 0 },
    list_icon: { alignSelf: "center" },

    title: { fontSize: 18, textAlignVertical: "top" },
    item_container: {
      borderRadius: 12,
      backgroundColor: theme.colors.grey,
      width: "90%",
      alignSelf: "center",
      zIndex: -1,
    },
    opacity: {
      alignSelf: "center",
      flexDirection: "row",
      margin: theme.spacing(2),
    },
    addIcon: {
      marginLeft: theme.spacing(1),
      alignSelf: "center",
    },
  });
  return (
    <View style={styles.item_container}>
      <Text style={styles.item_headline}>
        Lights with tag
        {` ${tag}`}
      </Text>
      <Divider style={styles.item_divider} />

      {lights.map((l: Light) => (
        <List.Item
          key={l.id}
          onPress={() => navigation.navigate("light", { id: l.id })}
          style={styles.list_item}
          titleStyle={styles.title}
          title={l.name}
          right={() => (
            <TouchableOpacity
              style={styles.list_icon}
              onPress={() => removeTags(l.id, [tag])}
            >
              <FontAwesomeIcon
                color={theme.colors.accent}
                icon={faTrashAlt}
                size={24}
              />
            </TouchableOpacity>
          )}
        />
      ))}
      <Divider style={styles.item_divider} />
      <TouchableOpacity
        onPress={() => modalizeRef.current?.open()}
        style={styles.opacity}
      >
        <Text>Add Light</Text>
        <FontAwesomeIcon
          style={styles.addIcon}
          icon={faPlus}
          color={theme.colors.text}
          size={16}
        />
      </TouchableOpacity>
      <ApplyDialog
        ref={modalizeRef}
        ids={map(lights, "id")}
        ignoreLightOff
        confirmText="Add"
        title={`Add Lights to ${tag}`}
        onConfirm={(values: string[]) => addLights(values)}
      />
    </View>
  );
}
