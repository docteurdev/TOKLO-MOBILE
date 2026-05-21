import React, { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

export default function useOpenBrowser() {
 const [result, setResult] = useState<WebBrowser.WebBrowserResult | null>(null);
 
 const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync('http://192.168.43.62:3000/dev_coumbassa');
    setResult(result);
  };
  return {_handlePressButtonAsync, result}
}
