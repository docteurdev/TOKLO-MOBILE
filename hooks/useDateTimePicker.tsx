import { useState } from 'react';
import { Platform } from 'react-native';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';

type Mode = 'date' | 'time';

interface UseDateTimePickerResult {
  date: Date | null;
  selectedHour: number | null;
  selectedMinute: number | null;
  showDatepicker: () => void;
  showTimepicker: () => void;
  DatePicker: () => JSX.Element | null;
  formattedDateTime: string;
}

const useDateTimePicker = (onDateChange?: (date: Date) => void): UseDateTimePickerResult => {
  const [date, setDate] = useState<Date | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('date');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

  const showMode = (currentMode: Mode) => {
    setShow(true);
    setMode(currentMode);
  };

  const onChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');

    if (!currentDate) return;

    if (mode === 'date') {
      setDate(currentDate);
      if (Platform.OS === 'android') {
        // Automatically show time picker after date selection on Android
        setTimeout(() => {
          showTimepicker();
        }, 100);
      }
    } else if (mode === 'time') {
      setSelectedHour(currentDate.getHours());
      setSelectedMinute(currentDate.getMinutes());
      
      // If we already have a date, combine it with the new time
      if (date) {
        const combinedDate = new Date(date);
        combinedDate.setHours(currentDate.getHours());
        combinedDate.setMinutes(currentDate.getMinutes());
        setDate(combinedDate);
        onDateChange?.(combinedDate);
      }
    }
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const DatePicker = () => {
    if (show) {
      return (
        <DateTimePicker
          value={date || new Date()}
          mode={mode}
          display="default"
          onChange={onChange}
        />
      );
    }
    return null;
  };

  // Format the datetime for display
  const formattedDateTime = date
    ? `${date.toLocaleDateString()} ${selectedHour?.toString().padStart(2, '0')}:${selectedMinute?.toString().padStart(2, '0')}`
    : '';

  return {
    date,
    selectedHour,
    selectedMinute,
    showDatepicker,
    showTimepicker,
    DatePicker,
    formattedDateTime,
  };
};

export default useDateTimePicker;