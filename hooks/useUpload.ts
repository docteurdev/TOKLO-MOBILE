import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { UploadImgProps } from '@/interfaces/type';
import { uriToBase64 } from '@/util/comon';

const useUpload = (isSignle = false) => {
  const [selectedImages, setImage] = useState<UploadImgProps[]>([]);
  const [base64Images, setBase64Images] = useState<string[]>([]);
  const [singleImage, setSingleImage] = useState<UploadImgProps | null >();

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: isSignle? false: true,
        quality: 1,
      });
  
      if (!result.canceled) {
        if (isSignle) {
          const newImage = {
            uri: result.assets[0].uri,
            fileName: result.assets[0].fileName,
            mineType: result.assets[0].mimeType
          };
          setSingleImage(newImage);
          return newImage; // Return the image immediately
        } else {
          // ... rest of your multiple image handling code ...
        }
      }
      return null;
    } catch (error) {
      console.error('Error picking images:', error);
      return null;
    }
  };

  const handleRemoveImg = (url: string) => {
    setImage(prev => prev.filter(img => img.uri !== url));
    // Also remove the corresponding base64 image
    const index = selectedImages.findIndex(img => img.uri === url);
    if (index !== -1) {
      setBase64Images(prev => prev.filter((_, i) => i !== index));
    }
  };

  const resetsingleImage = () => {
    setSingleImage(null);
  };

  return {
    selectedImages,
    handleRemoveImg,
    pickImage,
    singleImage,
    resetsingleImage,
    base64Images
  };
};

export default useUpload;