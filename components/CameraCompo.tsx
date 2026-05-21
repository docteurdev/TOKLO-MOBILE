import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button, Pressable } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ShieldCheckIcon, CameraIcon, BoltIcon } from "react-native-heroicons/solid";
import useCamera from '@/hooks/useCamera';
import { Colors } from '@/constants/Colors';
import { TImage } from '@/interfaces/type';

type  CameraComponentProps = {
 setPhoto: React.Dispatch<React.SetStateAction<TImage | null>>
 closeCamera: () => void
}

const CameraComponent = ({setPhoto,  closeCamera}: CameraComponentProps) => {
  const { hasPermission, requestPermission, cameraType, toggleCameraType, toggleFlashMode, takePhoto, flashMode,cameraRef } = useCamera();


  async function handlePhoto(){
   const photo: string | null  = await takePhoto();
   if(photo){
    setPhoto({uri: photo, fileName: "", mineType: ""});
    closeCamera()
   }
   console.log("000000000000000", photo);
  }

  if (!hasPermission) {
    // Permissions are not granted yet
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Pressable onPress={requestPermission}>

         <ShieldCheckIcon fill={Colors.app.primary} size={100}/>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} flash={flashMode} >
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={()=> handlePhoto()} style={styles.button}> 
            <CameraIcon fill={Colors.app.primary} size={27} />
          </TouchableOpacity>
        </View>
      </CameraView>
        <View style={styles.extraButtonContainer} >
         <TouchableOpacity style={[styles.button, {backgroundColor: 'transparent'}]} onPress={toggleCameraType}>
           <Ionicons name="camera-reverse" size={27} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, {backgroundColor: 'transparent'}]} onPress={toggleFlashMode}>
            <BoltIcon fill={flashMode === "on"? Colors.app.primary: "white"} size={27} />
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: "center"
  },

  extraButtonContainer: {
    position: "absolute",
    gap: 10,
    right: 0,
    width: 40,
    height: "100%",
    backgroundColor: 'transparent',
    justifyContent: "flex-start",
    paddingTop: 100
  },

  button: {
    // flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: "center",
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 30,
    boxShadow: Colors.shadow.card
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CameraComponent;
