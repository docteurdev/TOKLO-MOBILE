/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  app:{
    primary: 'rgb(215 156 53)', //'#D2B445',//4630EB, '#1676f3', D2B445,
    primaryLight: '#6F5BFF',
    secondary: '#fafafa',
    texte: '#000000', 
    texteLight: '#596372',
    success: '#00C853',
    error: '#FF0000',
    warning: '#FFA500',
    info: '#00C853',
    disabled: '#D9D9D9',//#f7f9fc
    light: '#f7f9fc',
    black: '#000000',
    reduction:"#FF6B6B",

    available:{
      av_txt: "#00C566",
      av_bg: "#E6F9F0",
  
      unav_txt: "#ff794c",
      unav_bg: "#FFF2ED"
    },
    dashitem: {
      bg_1: "#eec1c6",
      t_1: '#e83f38',
      bg_2: "#d7f1fe",
      t_2: '#01a0fc',
      bg_3: "#ffcbac",
      t_3: '#f36d1e',
      bg_4: "#f2eaba",
      t_4: '#f2eaba',
  
      // bg_5: "#d7f1fe",
      // t_5: '#01a0fc',
      // bg_6: "#ffcbac",
      // t_6: '#f36d1e',
    }
    

  },
  shadow:{
    card: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)"
  }
};
