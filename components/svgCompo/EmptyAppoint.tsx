// First, install the required package if you haven't already
// npm install react-native-svg
// or: yarn add react-native-svg

// Import at the top of your file
import { SvgXml } from 'react-native-svg';

// Define the SVG string in your component

const emptyAppointmentSvg = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <!-- Background elements -->
  <rect x="0" y="0" width="400" height="300" fill="#f8f9fa" rx="10" />
  
  <!-- Calendar outline -->
  <rect x="50" y="40" width="180" height="200" rx="8" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
  
  <!-- Calendar header -->
  <rect x="50" y="40" width="180" height="30" rx="8" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="2"/>
  
  <!-- Calendar days header -->
  <rect x="50" y="70" width="180" height="20" fill="#f8f8f8"/>
  
  <!-- Calendar grid lines -->
  <line x1="75" y1="70" x2="75" y2="240" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="100" y1="70" x2="100" y2="240" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="125" y1="70" x2="125" y2="240" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="150" y1="70" x2="150" y2="240" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="175" y1="70" x2="175" y2="240" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="200" y1="70" x2="200" y2="240" stroke="#e0e0e0" stroke-width="1"/>
  
  <line x1="50" y1="90" x2="230" y2="90" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="50" y1="115" x2="230" y2="115" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="50" y1="140" x2="230" y2="140" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="50" y1="165" x2="230" y2="165" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="50" y1="190" x2="230" y2="190" stroke="#e0e0e0" stroke-width="1"/>
  <line x1="50" y1="215" x2="230" y2="215" stroke="#e0e0e0" stroke-width="1"/>
  
  <!-- Selected date circle - without number -->
  <circle cx="163" cy="127" r="12" fill="#ff6b6b" fill-opacity="0.2" stroke="#ff6b6b" stroke-width="2"/>
  
  <!-- Mannequin/Dress form -->
  <path d="M280,120 C280,100 300,90 300,110 C300,140 320,150 320,180 C320,200 280,200 280,180 C280,150 300,140 300,110 C300,90 280,100 280,120" fill="#ffd6e0" stroke="#ff8fa3" stroke-width="2"/>
  <path d="M290,110 L310,110 C310,170 310,170 310,190 L290,190 C290,170 290,170 290,110" fill="none" stroke="#ff8fa3" stroke-width="1" stroke-dasharray="2,2"/>
  
  <!-- Measuring tape -->
  <path d="M260,200 C260,200 270,180 300,180 C330,180 340,200 340,200" fill="none" stroke="#ffc107" stroke-width="4" stroke-linecap="round"/>
  <path d="M262,195 L262,205" stroke="#ffc107" stroke-width="2"/>
  <path d="M270,193 L270,203" stroke="#ffc107" stroke-width="2"/>
  <path d="M280,190 L280,200" stroke="#ffc107" stroke-width="2"/>
  <path d="M290,188 L290,198" stroke="#ffc107" stroke-width="2"/>
  <path d="M300,188 L300,198" stroke="#ffc107" stroke-width="2"/>
  <path d="M310,188 L310,198" stroke="#ffc107" stroke-width="2"/>
  <path d="M320,190 L320,200" stroke="#ffc107" stroke-width="2"/>
  <path d="M330,193 L330,203" stroke="#ffc107" stroke-width="2"/>
  <path d="M338,195 L338,205" stroke="#ffc107" stroke-width="2"/>
  
  <!-- Thread spool -->
  <ellipse cx="250" cy="140" rx="15" ry="10" fill="#91a7ff" stroke="#5c7cfa" stroke-width="1"/>
  <rect x="245" y="135" width="10" height="10" fill="#f8f9fa" stroke="#5c7cfa" stroke-width="1"/>
  <path d="M250,150 C250,150 240,170 230,180" fill="none" stroke="#5c7cfa" stroke-width="1"/>
  
  <!-- Scissors -->
  <path d="M340,140 C335,135 325,145 330,150 L315,165 L330,150 C335,155 345,145 340,140" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
  <path d="M340,140 L325,125" stroke="#adb5bd" stroke-width="2" stroke-linecap="round"/>
  
</svg>`;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';

type Props = {}

const EmptyAppoint = (props: Props) => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center", gap: 10, position: "absolute", left: 0, right: 0, bottom: 0}}>
      <SvgXml xml={emptyAppointmentSvg} width="300" height="250" />
      <Text style={{textAlign: "center", fontSize: SIZES.md, color: Colors.app.black}}>Pas de rendez-vous pour cette date</Text>
      <Text style={{textAlign: "center", fontSize: 14, color: "#6c757d"}}></Text>
    </View>
  )
}

export default EmptyAppoint

const styles = StyleSheet.create({})

