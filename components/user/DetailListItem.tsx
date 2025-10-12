import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors, Rs, SIZES } from "@/util/comon";

type Props = {
 label: string;
 value: string;
};

const DetailListItem = ({label, value}: Props) => {
  return (
    <View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}> {label} </Text>
        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export default DetailListItem;

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    paddingVertical: Rs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    flex: 1,
    fontSize: SIZES.md,
    color: colors.grayText,
  },
  infoValue: {
    flex: 2,
    fontSize: SIZES.sm,
    color: colors.grayText,
    fontWeight: "500",
  },
});
