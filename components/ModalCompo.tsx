import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/util/comon";

type Props = {
  children: React.ReactNode;
};

const ModalCompo = ({ children }: Props) => {
  return (
    <View>
      <Modal
        isVisible={true}
        statusBarTranslucent={true}
        coverScreen={true}
        style={{
          margin: 0,
          justifyContent: "flex-center",
          // backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            backgroundColor: "transparent",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            padding: 20,
          }}
        >
          {children}
        </View>
      </Modal>
    </View>
  );
};

export default ModalCompo;

const styles = StyleSheet.create({});
