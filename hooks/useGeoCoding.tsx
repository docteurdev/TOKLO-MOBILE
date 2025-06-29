import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { geaCodingUrl, GoogleApiKey } from '@/util/comon'; 

const useGeoCoding = () => {
  const [address, setAddress] = useState('');

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    // const url = `${geaCodingUrl}latlng=${latitude},${longitude}&key=${GoogleApiKey}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${5.345317},${-4.024429}&key=${GoogleApiKey}`

    try {
      const response = await axios.get(url);
      const result = response.data.results[0];
      console.log("000000",response);
      
      if (result) {
        setAddress(result.formatted_address);
      } else {
        setAddress('No address found');
      }
    } catch (error) {
      console.error(error);
      setAddress('Error fetching address');
    }
  };

  return {
    address,
    getAddressFromCoordinates,
  }
};



export default useGeoCoding;
