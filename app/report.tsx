import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { 
  ExclamationCircleIcon, 
  ShieldExclamationIcon, 
  ChatBubbleBottomCenterIcon, 
  SparklesIcon, 
  UserIcon, 
  ArrowLeftIcon,
  PhotoIcon,
  ClockIcon,
  CheckIcon
} from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '@/components/form/BackButton';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

const Page = () => {
  const [reportType, setReportType] = useState(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  

  const reportTypes = [
    { id: 'inappropriate', name: 'Prise de messures', icon: <ShieldExclamationIcon size={24} color="#FF4949" /> },
    { id: 'bug', name: 'Enregistrement de client', icon: <ExclamationCircleIcon size={24} color="#FF8C00" /> },
    { id: 'harassment', name: 'Commande terminée', icon: <ChatBubbleBottomCenterIcon size={24} color="#8A2BE2" /> },
    { id: 'delivred', name: 'Commande livrée', icon: <ChatBubbleBottomCenterIcon size={24} color="#8A2BE2" /> },
    { id: 'suggestion', name: 'Suggestion', icon: <SparklesIcon size={24} color="#4CAF50" /> },
    { id: 'other', name: 'Other', icon: <UserIcon size={24} color="#4169E1" /> },
  ];
  
  const pickImage = async () => {
    // Request permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permissions to upload images');
        return;
      }
    }
    
    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      if (images.length >= 3) {
        Alert.alert('Limit reached', 'You can only upload up to 3 images');
      } else {
        setImages([...images, result.assets[0].uri]);
      }
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = () => {
    if (!reportType) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }
    
    if (description.trim().length < 10) {
      Alert.alert('Error', 'Please provide a detailed description (at least 10 characters)');
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it shortly.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset form and navigate back
              setReportType(null);
              setDescription('');
              setImages([]);
              navigation?.goBack();
            }
          }
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
           <BackButton backAction={() => {
           router.back();
           } } />
          <Text style={styles.headerTitle}> Rapporter une annomalie </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Quel problème voulez-vous signaler ?</Text>
          
          <View style={styles.reportTypeContainer}>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.reportTypeButton,
                  reportType === type.id && styles.selectedReportType,
                ]}
                onPress={() => setReportType(type.id)}
              >
                <View style={styles.reportTypeIconContainer}>
                  {type.icon}
                </View>
                <Text style={styles.reportTypeName}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            multiline
            numberOfLines={5}
            placeholder="Veuillez décrire le problème que vous rencontrez..."
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.sectionTitle}>Fournissez des captures d'écran du problème (Optionnel)</Text>
          <Text style={styles.sectionSubtitle}>Ajoutez au plus 3 captures d'écran</Text>
          
          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <ClockIcon size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <PhotoIcon size={24} color="#999" />
                <Text style={styles.addImageText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!reportType || description.trim().length < 10) && styles.disabledButton,
              submitting && styles.submittingButton
            ]}
            onPress={handleSubmit}
            disabled={!reportType || description.trim().length < 10 || submitting}
          >
            {submitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <>
                <CheckIcon size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportTypeButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedReportType: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#0096FF',
  },
  reportTypeIconContainer: {
    marginRight: 12,
  },
  reportTypeName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#0096FF',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submittingButton: {
    backgroundColor: '#67B7F7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Page;