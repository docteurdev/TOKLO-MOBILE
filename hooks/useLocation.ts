import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';

type Props = {};

type LocationType = Location.LocationObject | null;

const useLocation = () => {
  const [location, setLocation] = useState<LocationType>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [address, setAddress] = useState('');
  const [displayindAddress, setdisplayindAddress] = useState('');


  // Function to get address from coordinates using Expo's reverseGeocodeAsync
  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<void> => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const { city, region, country, street, postalCode } = geocode[0];
        const fullAddress = `${city}, ${region}, ${country}`;
        setAddress(fullAddress);
      } else {
        setAddress('No address found');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Error fetching address');
    }
  };


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      setLocation(location);
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      setdisplayindAddress(`${geocode[0]?.country}, ${geocode[0]?.city}, ${geocode[0]?.district}`);
      // console.log(geocode);
      
    })();
  }, []);

  return { location, errorMsg, getAddressFromCoordinates, address, displayindAddress };
};

export default useLocation;

const styles = StyleSheet.create({});
