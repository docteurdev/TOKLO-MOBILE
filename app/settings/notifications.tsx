import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import BackButton from '@/components/form/BackButton';
import { useRouter } from 'expo-router';
import { Rs, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import { SwitchCompo } from '@/components/SwitchCompo';
import { QueryKeys } from '@/interfaces/queries-key';
import { useQuery } from '@tanstack/react-query';
import { IUser, Toklomen } from '@/interfaces/user';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { baseURL } from '@/util/axios';
import useTokloman from '@/hooks/mutations/useTokloman';
import { ActivityIndicator } from 'react-native';
import { defaultRemindTime } from '@/utils';
import BlowingBtn from '@/components/form/BlowingBtn';

const { width } = Dimensions.get('window');

const Page = () => {
  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { data, isLoading, error, refetch } = useQuery<Toklomen, Error>({
    queryKey: QueryKeys.tokloman.byTokloman,
    queryFn: async (): Promise<Toklomen> => {  // Explicit return type
      try {
        const resp = await axios.get(`${baseURL}/tokloMen/${Number(user?.id)}`);
        //  console.log("tokloMen°°°°°°", resp.data)
        return resp.data; // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });
  
  // États pour les jours avant notification
  const [sevenDaysBefore, setSevenDaysBefore] = useState(false);
  const [threeDaysBefore, setThreeDaysBefore] = useState( false);
  const [twoDaysBefore, setTwoDaysBefore] = useState( false);
  const [oneDayBefore, setOneDayBefore] = useState( false);
  

  // États pour les périodes de la journée
  const [morningNotif, setMorningNotif] = useState(false);
  const [afternoonNotif, setAfternoonNotif] = useState(false);
  const [eveningNotif, setEveningNotif] = useState(false);

  // Times
  const [morningTime, setMorningTime] = useState("");
  const [afternoonTime, setAfternoonTime] = useState("");
  const [eveningTme, setEveningTme] = useState("");

  // États pour l'heure personnalisée
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [customTimeEnabled, setCustomTimeEnabled] = useState(false);

  const router = useRouter();

  const {user} = useUserStore()

  const {mutate, isPending} = useTokloman();

  useEffect(() => {
    setSevenDaysBefore(data?.notif_remind_seven ? true : false);
    setThreeDaysBefore(data?.notif_remind_three ? true : false);
    setTwoDaysBefore(data?.notif_remind_two ? true : false);
    setOneDayBefore(data?.notif_remind_one ? true : false);
  
    setMorningNotif(data?.notif_monrning ? true : false);
    setAfternoonNotif(data?.notif_midday ? true : false);
    setEveningNotif(data?.notif_evening ? true : false);
    
    // coming time
    setMorningTime(data?.notif_monrning ? data?.notif_monrning : "");
    setAfternoonTime(data?.notif_midday ? data?.notif_midday : "");
    setEveningTme(data?.notif_evening ? data?.notif_evening : "");
  }, [data]);

  // Effect pour l'animation d'entrée
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Gestion du changement d'heure
  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  // Animation pour le bouton de sauvegarde
  const buttonScale = useRef(new Animated.Value(1)).current;
  

  // Sauvegarde des paramètres
  const saveSettings = () => {
    const settings: Toklomen = {
      notif_remind_seven: sevenDaysBefore? 7 : 0,
      notif_remind_three: threeDaysBefore ? 3 : 0,
      notif_remind_two: twoDaysBefore ? 2 : 0,
      notif_remind_one: oneDayBefore ? 1 : 0,

      notif_monrning: morningNotif? defaultRemindTime.notif_monrning : null,
      notif_midday: afternoonNotif? defaultRemindTime.notif_midday : null,
      notif_evening: eveningNotif? defaultRemindTime.notif_evening : null,
      
      
    };
    
     mutate(settings)
    console.log('Paramètres de notification sauvegardés:', settings);
  };

  // Rendu d'une option avec animation
  const renderOption = (title, icon, value, setValue, iconColor, isTime) => {
    return (
      <>
      <Animated.View 
        style={[
          styles.option,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.optionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            {icon}
          </View>
          <Text style={styles.optionText}>{title}</Text>
        </View>
        {/* <Switch
          value={value}
          onValueChange={setValue}
          trackColor={{ false: '#e0e0e0', true: iconColor + '80' }}
          thumbColor={value ? iconColor : '#f4f3f4'}
          ios_backgroundColor="#e0e0e0"
        /> */}
        <SwitchCompo label='' value={value} onValueChange={setValue} activeColor={"#f4f3f4"} thumbColor={value ? iconColor : '#f4f3f4'} />
      </Animated.View>

      {/* {value && isTime && (
            <Animated.View 
              style={[
                styles.timePickerContainer,
                { opacity: fadeAnim }
              ]}
            >
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <LinearGradient
                  colors={[Colors.app.primary, '#5A67D8']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.timeGradient}
                >
                  <MaterialIcons name="access-time" size={20} color="white" />
                  <Text style={styles.timeText}>
                    {`${selectedTime.getHours()}:${selectedTime.getMinutes().toString().padStart(2, '0')}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </Animated.View>
          )} */}
      </>
    );
  };

  return (
    <View
      // colors={['#f9f9ff', '#e8f0ff']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <BackButton backAction={() => router.back()} />
          <View style={styles.header}>
            <Text style={styles.title}>Mes Notifications</Text>
            <MaterialIcons name="notifications-active" size={32} color={Colors.app.primary} />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.card, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="access-time" size={22} color="#5A67D8" />
            <Text style={styles.sectionTitle}>Rappels avant l'événement</Text>
          </View>
          
          {renderOption(
            "7 jours avant", 
            <MaterialIcons name="event" size={20} color="#5A67D8" />, 
            sevenDaysBefore, 
            setSevenDaysBefore,
            "#5A67D8"
          )}
          
          {renderOption(
            "3 jours avant", 
            <MaterialIcons name="event" size={20} color="#7367F0" />,
            threeDaysBefore, 
            setThreeDaysBefore,
            "#7367F0"
          )}
          
          {renderOption(
            "2 jours avant", 
            <MaterialIcons name="event" size={20} color="#9F7AEA" />,
            twoDaysBefore, 
            setTwoDaysBefore,
            "#9F7AEA"
          )}
          
          {renderOption(
            "1 jour avant", 
            <MaterialIcons name="event" size={20} color="#B794F4" />,
            oneDayBefore, 
            setOneDayBefore,
            "#B794F4"
          )}
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.card, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={22} color={Colors.app.available.av_txt} />
            <Text style={styles.sectionTitle}>Moment de la journée</Text>
          </View>
          
          {renderOption(
            `Matin ${ morningTime &&':  ' + morningTime}`,
            <FontAwesome5 name="cloud-sun" size={18} color="#ED8936" />,
            morningNotif, 
            setMorningNotif,
            "#ED8936",
            "isTime",
          )}
          
          {renderOption(
            `Après-midi ${ afternoonTime &&':  ' + afternoonTime}`,
            <Ionicons name="sunny-outline" size={20} color="#DD6B20" />,
            afternoonNotif, 
            setAfternoonNotif,
            "#DD6B20",
            "isTime",
          )}
          
          {renderOption(
            `Dans la soirée ${eveningTme &&':  ' + eveningTme}`,
            <FontAwesome5 name="moon" size={18} color="#667EEA" />,
            eveningNotif, 
            setEveningNotif,
            "#667EEA",
            "isTime",
          )}
          
          {/* {renderOption(
            "Heure personnalisée", 
            <MaterialIcons name="schedule" size={20} color="#4C51BF" />,
            customTimeEnabled, 
            setCustomTimeEnabled,
            "#4C51BF"
          )} */}
          
         
        </Animated.View>
        
        <Animated.View 
          style={{
            transform: [{ scale: buttonScale }]
          }}
        >
          <BlowingBtn label='Sauvegarder' isPending={isPending} handlePress={saveSettings} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white"
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
   boxShadow: Colors.shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: Rs(36),
    height: Rs(36),
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: SIZES.md,
    color: '#333',
  },
  timePickerContainer: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#7367F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Page;