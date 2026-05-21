import React, { useState } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { GoogleApiKey } from '@/util/comon';

function useGooglePlace(){
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Function to get place suggestions based on user input
  const fetchPlaces = async (input: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GoogleApiKey}&language=en`;

    try {
      const response = await axios.get(url);
      const results = response.data.predictions;
      console.log("oiiiiiiiiiiii",results, input)
      
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
    }
  };

  const handleInputChange = (input: string) => {
    setQuery(input);
    if (input.length > 2) {
      fetchPlaces(input);
    } else {
      setSuggestions([]);
    }
  };

  return {suggestions, handleInputChange}
};


export default useGooglePlace;
