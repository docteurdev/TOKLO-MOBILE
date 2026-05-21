import { useState, useCallback, useRef } from 'react';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';

interface UseCameraResult {
  hasPermission: boolean;
  requestPermission: () => void;
  cameraType: CameraType;
  toggleCameraType: () => void;
  flashMode: FlashMode;
  toggleFlashMode: () => void;
  takePhoto: () => Promise<string | null>;
  cameraRef: React.RefObject<CameraView>;
}

const useCamera = (): UseCameraResult => {
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const hasPermission = permission?.granted || false;

  const toggleCameraType = useCallback(() => {
    setCameraType((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const toggleFlashMode = useCallback(() => {
    setFlashMode((current) => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current) {
      console.warn('Camera not initialized');
      return null;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        exif: true
      });
      return photo.uri;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }, []);

  return {
    hasPermission,
    requestPermission: () => requestPermission(),
    cameraType,
    toggleCameraType,
    flashMode,
    toggleFlashMode,
    takePhoto,
    cameraRef
  };
};

export default useCamera;