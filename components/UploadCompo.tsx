import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

const FileUploadComponent = ({ onFileSelected, allowedTypes = ['image/*', 'application/pdf'] }) => {
  const [fileInfo, setFileInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const resetUpload = () => {
    setFileInfo(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  };

  const handleFilePicker = async () => {
    
     
  };

  const handleImagePicker = async () => {
    
  };

  const handleCameraPicker = async () => {
   
  };

  const handleFileSelection = async (file) => {
    try {
      // Get file size in a readable format
      const fileSize = file.fileSize || 0;
      let readableSize;
      
      if (fileSize < 1024) {
        readableSize = `${fileSize} B`;
      } else if (fileSize < 1024 * 1024) {
        readableSize = `${(fileSize / 1024).toFixed(1)} KB`;
      } else {
        readableSize = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
      }

      // Get file type more reliably
      const fileType = file.mimeType || 
                      file.type || 
                      (file.uri && file.uri.split('.').pop()) || 
                      'unknown';

      // Prepare file info object
      const newFileInfo = {
        uri: file.uri,
        name: file.name || file.uri.split('/').pop() || 'file',
        type: fileType,
        size: readableSize,
        rawSize: fileSize,
      };

      setFileInfo(newFileInfo);
      setUploadError(null);
      
      // Simulate upload process
      simulateUpload(newFileInfo);
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadError('Error processing file. Please try again.');
    }
  };

  const simulateUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      
      // Simulate a brief pause at 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUploading(false);
      
      // Call the callback with the file info
      if (onFileSelected) {
        onFileSelected(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Error uploading file. Please try again.');
      setUploading(false);
    }
  };

  const getFileTypeIcon = () => {
    if (!fileInfo) return null;
    
    const type = fileInfo.type.toLowerCase();
    
    if (type.includes('image')) {
      return <Ionicons name="image" size={24} color="#3498db" />;
    } else if (type.includes('pdf')) {
      return <MaterialCommunityIcons name="file-pdf-box" size={24} color="#e74c3c" />;
    } else if (type.includes('doc') || type.includes('word')) {
      return <MaterialCommunityIcons name="file-word" size={24} color="#2980b9" />;
    } else if (type.includes('xls') || type.includes('sheet')) {
      return <MaterialCommunityIcons name="file-excel" size={24} color="#27ae60" />;
    } else if (type.includes('ppt') || type.includes('presentation')) {
      return <MaterialCommunityIcons name="file-powerpoint" size={24} color="#d35400" />;
    } else {
      return <MaterialCommunityIcons name="file-outline" size={24} color="#7f8c8d" />;
    }
  };

  const isImage = fileInfo && fileInfo.type && fileInfo.type.toLowerCase().includes('image');

  return (
    <View style={styles.container}>
      
        <Text style={styles.title}>logo</Text>
         <View style={styles.placeholderContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="cloud-upload" size={36} color="#3498db" />
              </View>
            </View>
      <Text style={styles.title}> Bannière</Text>
      <View style={styles.uploadCard}>
        {!fileInfo ? (
          <>
            <View style={styles.placeholderContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="cloud-upload" size={36} color="#3498db" />
              </View>
            </View>
            
          </>
        ) : (
          <View style={styles.filePreviewContainer}>
            {isImage ? (
              <Image 
                source={{ uri: fileInfo.uri }} 
                style={styles.imagePreview} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.fileIconContainer}>
                {getFileTypeIcon()}
              </View>
            )}
            
            <View style={styles.fileInfoContainer}>
              <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                {fileInfo.name}
              </Text>
              <Text style={styles.fileSize}>{fileInfo.size}</Text>
            </View>
            
            {uploading ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
            ) : (
              <View style={styles.uploadCompleteContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                </View>
                <Text style={styles.uploadCompleteText}>Upload complete</Text>
                
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={resetUpload}
                  >
                    <MaterialCommunityIcons name="refresh" size={20} color="#3498db" />
                    <Text style={styles.actionButtonText}>New File</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        
      </View>
      
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    // alignItems: 'center',
  },
  uploadCard: {
    width: width - 32,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  alternativeOptions: {
    alignItems: 'center',
  },
  orText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  iconButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  iconButtonText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  filePreviewContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileInfoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    maxWidth: width - 80,
  },
  fileSize: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'right',
  },
  uploadCompleteContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  successIconContainer: {
    marginBottom: 8,
  },
  uploadCompleteText: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '500',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#3498db',
    fontSize: 14,
    marginLeft: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdedec',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginLeft: 8,
  },
  supportedFormatsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  supportedFormatsText: {
    fontSize: 12,
    color: '#777',
  },
  maxSizeText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});

export default FileUploadComponent;