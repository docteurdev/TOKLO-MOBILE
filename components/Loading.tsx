import { Colors } from '@/constants/Colors';
import React from 'react';
import { 
  View, 
  Modal,
  StyleSheet,
  Text,
  ModalProps
} from 'react-native';
import { Swing } from 'react-native-animated-spinkit';

/**
 * Props for the LoadingScreen component
 */
interface LoadingScreenProps {
  /**
   * Controls whether the loading modal is visible
   * @default true
   */
  visible?: boolean;
  
  /**
   * Background color of the modal container
   * @default "rgba(0, 0, 0, 0.7)"
   */
  backgroundColor?: string;
  
  /**
   * Color of the loading indicator
   * @default "#FFFFFF"
   */
  indicatorColor?: string;
  
  /**
   * Size of the loading indicator
   * @default 48
   */
  indicatorSize?: number;
  
  /**
   * Optional message to display under the spinner
   */
  message?: string;
  
  /**
   * Color of the message text
   * @default "#FFFFFF"
   */
  textColor?: string;
  
  /**
   * Animation type for the modal
   * @default "slide"
   */
  animationType?: "none" | "slide" | "fade";
  
  /**
   * Whether the modal background is transparent
   * @default true
   */
  transparent?: boolean;
}

/**
 * A simple loading overlay component using Modal and Swing animation
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  visible = true,
  backgroundColor = 'white',
  indicatorColor = Colors.app.primary,
  indicatorSize = 48,
  message,
  textColor = '#FFFFFF',
  animationType = 'slide',
  transparent = true,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
        <Swing 
          size={indicatorSize} 
          color={Colors.app.primary}
        />
        
        {message && (
          <Text style={[styles.message, { color: textColor }]}>
            {message}
          </Text>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 100,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  }
});

export default LoadingScreen;