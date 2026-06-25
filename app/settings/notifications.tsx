import BackButton from '@/components/form/BackButton';
import CustomButton from '@/components/form/CustomButton';
import { SwitchCompo } from '@/components/SwitchCompo';
import useTokloman from '@/hooks/mutations/useTokloman';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { QueryKeys } from '@/interfaces/queries-key';
import { Toklomen } from '@/interfaces/user';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import { Rs, SIZES } from '@/util/comon';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TimeSlot = 'morning' | 'afternoon' | 'evening';

const DEFAULT_NOTIFICATION_TIMES: Record<TimeSlot, string> = {
  morning: "08:00",
  afternoon: "14:00",
  evening: "19:00",
};

const normalizeTime = (value?: string | null) => {
  if (!value) return "";

  const parts = value.replace(/[^\d]/g, " ").trim().split(/\s+/).map(Number);

  if (parts.length < 2) return "";

  const [hours, minutes] = parts;

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const timeStringToDate = (value?: string | null) => {
  const date = new Date();
  const normalized = normalizeTime(value) || "08:00";
  const [hours, minutes] = normalized.split(":").map(Number);

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

const dateToTimeString = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const resolveNotificationTime = (
  preferred?: string | null,
  fallback?: string | null,
) => normalizeTime(preferred) || normalizeTime(fallback);

const Page = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { data } = useQuery<Toklomen, Error>({
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

  const [activeTimePicker, setActiveTimePicker] = useState<TimeSlot | null>(null);

  const router = useRouter();

  const {user} = useUserStore()

  const {mutate, isPending} = useTokloman();

  useEffect(() => {
    setSevenDaysBefore(data?.notif_remind_seven ? true : false);
    setThreeDaysBefore(data?.notif_remind_three ? true : false);
    setTwoDaysBefore(data?.notif_remind_two ? true : false);
    setOneDayBefore(data?.notif_remind_one ? true : false);
  
    const resolvedMorningTime = resolveNotificationTime(data?.notif_time_one, data?.notif_monrning);
    const resolvedAfternoonTime = resolveNotificationTime(data?.notif_time_two, data?.notif_midday);
    const resolvedEveningTime = resolveNotificationTime(data?.notif_time_three, data?.notif_evening);

    setMorningNotif(Boolean(resolvedMorningTime));
    setAfternoonNotif(Boolean(resolvedAfternoonTime));
    setEveningNotif(Boolean(resolvedEveningTime));
    
    // coming time
    setMorningTime(resolvedMorningTime);
    setAfternoonTime(resolvedAfternoonTime);
    setEveningTme(resolvedEveningTime);
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
  }, [fadeAnim, slideAnim]);

  const getTimeValue = (slot: TimeSlot) => {
    if (slot === "morning") return morningTime;
    if (slot === "afternoon") return afternoonTime;
    return eveningTme;
  };

  const getPickerTimeValue = (slot: TimeSlot) =>
    normalizeTime(getTimeValue(slot)) || DEFAULT_NOTIFICATION_TIMES[slot];

  const setTimeValue = (slot: TimeSlot, value: string) => {
    if (slot === "morning") {
      setMorningTime(value);
      return;
    }

    if (slot === "afternoon") {
      setAfternoonTime(value);
      return;
    }

    setEveningTme(value);
  };

  const handleTimeSwitchChange = (
    slot: TimeSlot,
    setValue: (value: boolean) => void,
    nextValue: boolean,
  ) => {
    setValue(nextValue);

    if (nextValue && !normalizeTime(getTimeValue(slot))) {
      setTimeValue(slot, DEFAULT_NOTIFICATION_TIMES[slot]);
    }
  };

  // Gestion du changement d'heure
  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentPicker = activeTimePicker;

    if (event.type === "dismissed") {
      setActiveTimePicker(null);
      return;
    }

    if (selectedDate && currentPicker) {
      setTimeValue(currentPicker, dateToTimeString(selectedDate));
    }

    setActiveTimePicker(Platform.OS === "ios" ? currentPicker : null);
  };

  // Animation pour le bouton de sauvegarde
  const buttonScale = useRef(new Animated.Value(1)).current;
  

  // Sauvegarde des paramètres
  const saveSettings = () => {
    const morningValue = morningNotif
      ? normalizeTime(morningTime) || DEFAULT_NOTIFICATION_TIMES.morning
      : null;
    const afternoonValue = afternoonNotif
      ? normalizeTime(afternoonTime) || DEFAULT_NOTIFICATION_TIMES.afternoon
      : null;
    const eveningValue = eveningNotif
      ? normalizeTime(eveningTme) || DEFAULT_NOTIFICATION_TIMES.evening
      : null;

    const settings: Partial<Toklomen> = {
      notif_remind_seven: sevenDaysBefore? 7 : 0,
      notif_remind_three: threeDaysBefore ? 3 : 0,
      notif_remind_two: twoDaysBefore ? 2 : 0,
      notif_remind_one: oneDayBefore ? 1 : 0,

      notif_time_one: morningValue,
      notif_time_two: afternoonValue,
      notif_time_three: eveningValue,

      notif_monrning: morningValue,
      notif_midday: afternoonValue,
      notif_evening: eveningValue,
      
      
    };
    
     mutate(settings)
    console.log('Paramètres de notification sauvegardés:', settings);
  };

  // Rendu d'une option avec animation
  const renderOption = (
    title: string,
    icon: React.ReactNode,
    value: boolean,
    setValue: (value: boolean) => void,
    iconColor: string,
    timeSlot?: TimeSlot
  ) => {
    const normalizedTime = timeSlot ? normalizeTime(getTimeValue(timeSlot)) : "";
    const displayTitle = timeSlot && normalizedTime ? `${title} : ${normalizedTime}` : title;

    return (
      <>
      <Animated.View 
        style={[
          styles.option,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity
          activeOpacity={timeSlot ? 0.7 : 1}
          onPress={() => timeSlot && setActiveTimePicker(timeSlot)}
          style={styles.optionLeft}
        >
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            {icon}
          </View>
          <Text style={styles.optionText}>{displayTitle}</Text>
        </TouchableOpacity>
        {/* <Switch
          value={value}
          onValueChange={setValue}
          trackColor={{ false: '#e0e0e0', true: iconColor + '80' }}
          thumbColor={value ? iconColor : '#f4f3f4'}
          ios_backgroundColor="#e0e0e0"
        /> */}
        <SwitchCompo
          label=''
          value={value}
          onValueChange={(nextValue) =>
            timeSlot
              ? handleTimeSwitchChange(timeSlot, setValue, nextValue)
              : setValue(nextValue)
          }
          activeColor={iconColor}
          inactiveColor={theme.border}
          thumbColor={value ? '#FFFFFF' : theme.card}
        />
      </Animated.View>

      {timeSlot && activeTimePicker === timeSlot && (
            <Animated.View 
              style={[
                styles.timePickerContainer,
                { opacity: fadeAnim }
              ]}
            >
              <DateTimePicker
                value={timeStringToDate(getPickerTimeValue(timeSlot))}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={onTimeChange}
              />
            </Animated.View>
          )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} >

      <View
        // colors={['#f9f9ff', '#e8f0ff']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <BackButton backAction={() => router.back()} />
            <View style={styles.header}>
              <Text style={styles.title}>Mes Notifications</Text>
              <MaterialIcons name="notifications-active" size={32} color={theme.primary} />
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.card, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <MaterialIcons name="access-time" size={22} color={theme.primary} />
              <Text style={styles.sectionTitle}>{"Rappels avant l'événement"}</Text>
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
              <Ionicons name="time-outline" size={22} color={theme.success} />
              <Text style={styles.sectionTitle}>Moment</Text>
            </View>
            
            {renderOption(
              "Matin",
              <FontAwesome5 name="cloud-sun" size={18} color="#ED8936" />,
              morningNotif, 
              setMorningNotif,
              "#ED8936",
              "morning",
            )}
            
            {renderOption(
              "Après-midi",
              <Ionicons name="sunny-outline" size={20} color="#DD6B20" />,
              afternoonNotif, 
              setAfternoonNotif,
              "#DD6B20",
              "afternoon",
            )}
            
            {renderOption(
              "Soirée",
              <FontAwesome5 name="moon" size={18} color="#667EEA" />,
              eveningNotif, 
              setEveningNotif,
              "#667EEA",
              "evening",
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
            <CustomButton
              label='Sauvegarder'
              disabled={true}
              loading={isPending}
              action={saveSettings}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
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
    color: theme.text,
  },
  card: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    marginLeft: 10,
    color: theme.text,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    color: theme.text,
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
    shadowColor: theme.text,
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
    color: '#FFFFFF',
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
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Page;
