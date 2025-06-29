import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Svg, { 
  Rect, 
  Circle, 
  Defs, 
  LinearGradient, 
  Stop,
  G,
  Path
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Camera } from 'lucide-react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const AttractiveQRCode = ({ 
  value = 'https://example.com',
  size = width * 0.8,
  backgroundColor = '#ffffff',
  foregroundColor = '#000000',
  logoSize = 80,
  style,
  gradientColors = ['#7928CA', '#FF0080'],
  animateOnPress = true,
  cornerRadius = 10,
  showBorder = true,
  borderColor = '#e1e1e1',
  showScanIcon = true,
  hapticFeedback = true
}) => {
  const [qrMatrix, setQrMatrix] = useState([]);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    // Generate QR code matrix
    generateQRCodeMatrix(value);
  }, [value]);

  const generateQRCodeMatrix = (data) => {
    // This is a simplified version for demonstration
    // In a real app, you would use a library like 'qrcode' to generate the actual matrix
    
    // For demo purposes, creating a random matrix that looks like a QR code
    const matrixSize = 25; // Standard QR code size
    const matrix = Array(matrixSize).fill().map(() => 
      Array(matrixSize).fill().map(() => Math.random() > 0.7 ? 1 : 0)
    );
    
    // Ensure the three position detection patterns in corners
    // Top-left
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 || i === 6 || j === 0 || j === 6) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[i][j] = 1;
        } else {
          matrix[i][j] = 0;
        }
      }
    }
    
    // Top-right
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 || i === 6 || j === 0 || j === 6) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[i][matrixSize - j - 1] = 1;
        } else {
          matrix[i][matrixSize - j - 1] = 0;
        }
      }
    }
    
    // Bottom-left
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if ((i === 0 || i === 6 || j === 0 || j === 6) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[matrixSize - i - 1][j] = 1;
        } else {
          matrix[matrixSize - i - 1][j] = 0;
        }
      }
    }
    
    setQrMatrix(matrix);
  };

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (animateOnPress) {
      scale.value = withSequence(
        withTiming(0.95, { 
          duration: 100, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        withTiming(1, { 
          duration: 100, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        })
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const cellSize = (size - 40) / qrMatrix.length;

  const renderQRCells = () => {
    return qrMatrix.map((row, rowIndex) => {
      return row.map((cell, cellIndex) => {
        // Skip rendering cells where position patterns are
        const isPositionPattern = 
          // Top-left
          (rowIndex < 7 && cellIndex < 7) ||
          // Top-right
          (rowIndex < 7 && cellIndex >= qrMatrix.length - 7) ||
          // Bottom-left
          (rowIndex >= qrMatrix.length - 7 && cellIndex < 7);

        if (isPositionPattern) {
          return null;
        }

        if (cell) {
          return (
            <Rect
              key={`${rowIndex}-${cellIndex}`}
              x={cellIndex * cellSize + 20}
              y={rowIndex * cellSize + 20}
              width={cellSize - 1}
              height={cellSize - 1}
              rx={1}
              ry={1}
              fill="url(#gradient)"
            />
          );
        }
        return null;
      });
    });
  };

  const renderPositionPatterns = () => {
    const patternSize = 7 * cellSize;
    
    return (
      <>
        {/* Top-left position pattern */}
        <G>
          <Rect
            x={20}
            y={20}
            width={patternSize}
            height={patternSize}
            rx={cornerRadius}
            fill={gradientColors[0]}
          />
          <Rect
            x={20 + cellSize}
            y={20 + cellSize}
            width={patternSize - 2 * cellSize}
            height={patternSize - 2 * cellSize}
            rx={cornerRadius / 2}
            fill={backgroundColor}
          />
          <Rect
            x={20 + 2 * cellSize}
            y={20 + 2 * cellSize}
            width={patternSize - 4 * cellSize}
            height={patternSize - 4 * cellSize}
            rx={cornerRadius / 3}
            fill={gradientColors[0]}
          />
        </G>
        
        {/* Top-right position pattern */}
        <G>
          <Rect
            x={size - patternSize - 20}
            y={20}
            width={patternSize}
            height={patternSize}
            rx={cornerRadius}
            fill={gradientColors[1]}
          />
          <Rect
            x={size - patternSize - 20 + cellSize}
            y={20 + cellSize}
            width={patternSize - 2 * cellSize}
            height={patternSize - 2 * cellSize}
            rx={cornerRadius / 2}
            fill={backgroundColor}
          />
          <Rect
            x={size - patternSize - 20 + 2 * cellSize}
            y={20 + 2 * cellSize}
            width={patternSize - 4 * cellSize}
            height={patternSize - 4 * cellSize}
            rx={cornerRadius / 3}
            fill={gradientColors[1]}
          />
        </G>
        
        {/* Bottom-left position pattern */}
        <G>
          <Rect
            x={20}
            y={size - patternSize - 20}
            width={patternSize}
            height={patternSize}
            rx={cornerRadius}
            fill={gradientColors[1]}
          />
          <Rect
            x={20 + cellSize}
            y={size - patternSize - 20 + cellSize}
            width={patternSize - 2 * cellSize}
            height={patternSize - 2 * cellSize}
            rx={cornerRadius / 2}
            fill={backgroundColor}
          />
          <Rect
            x={20 + 2 * cellSize}
            y={size - patternSize - 20 + 2 * cellSize}
            width={patternSize - 4 * cellSize}
            height={patternSize - 4 * cellSize}
            rx={cornerRadius / 3}
            fill={gradientColors[1]}
          />
        </G>
      </>
    );
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          styles.qrContainer,
          animatedStyle,
          {
            borderRadius: 16,
            borderWidth: showBorder ? 1 : 0,
            borderColor: borderColor,
            padding: 8,
            backgroundColor: backgroundColor,
          },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="100%" y2="100%">
              <Stop offset="0" stopColor={gradientColors[0]} />
              <Stop offset="1" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>

          {/* Background */}
          <Rect
            x={10}
            y={10}
            width={size - 20}
            height={size - 20}
            rx={16}
            fill={backgroundColor}
          />

          {renderQRCells()}
          {renderPositionPatterns()}

          {/* Center Logo/Icon */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={logoSize / 2}
            fill={backgroundColor}
            stroke="url(#gradient)"
            strokeWidth={2}
          />
          
          {showScanIcon && (
            <G x={size / 2 - 12} y={size / 2 - 12}>
              <Path
                d="M7 3H5a2 2 0 0 0-2 2v2m10-4h2a2 2 0 0 1 2 2v2m-10 8H5a2 2 0 0 1-2-2v-2m14 0v2a2 2 0 0 1-2 2h-2"
                stroke="url(#gradient)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M8 12h.01"
                stroke="url(#gradient)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          )}
        </Svg>
      </Animated.View>
      {showScanIcon && (
        <Text style={styles.scanText}>Scannez moi</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scanText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.app.texteLight,
  }
});

export default AttractiveQRCode;