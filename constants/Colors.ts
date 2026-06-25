/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#12171B",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
  toklo: {
    light: {
      background: "#FFFDF8",
      card: "#FFFFFF",
      primary: "#4F7A65",
      primaryLight: "#EDF4F0",
      gold: "#D8A032",
      goldLight: "#FFF7E8",
      border: "#F0E3CC",
      text: "#1F2937",
      muted: "#6B7280",
      success: "#4F7A65",
      danger: "#E57373",
    },
    dark: {
      background: "#0F1412",
      card: "#171D1A",
      primary: "#8ABAA2",
      primaryLight: "#1E2D27",
      gold: "#D8A032",
      goldLight: "#2C2415",
      border: "#2D3833",
      text: "#F8FAFC",
      muted: "#A3ABB5",
      success: "#8ABAA2",
      danger: "#F08C8C",
    },
  },
  app: {
    primary: "#0F554B",
    primaryLight: "#6F5BFF",
    tertiary: "#D8A032",
    secondary: "#fafafa",
    background: "#ffffff",
    texte: "#000000",
    texteLight: "#596372",
    success: "#00C853",
    error: "#FF0000",
    warning: "#FFA500",
    info: "#00C853",
    disabled: "#D9D9D9", //#f7f9fc
    light: "#f7f9fc",
    black: "#000000",
    reduction: "#FF6B6B",

    available: {
      av_txt: "#00C566",
      av_bg: "#E6F9F0",

      unav_txt: "#ff794c",
      unav_bg: "#FFF2ED",
    },
    dashitem: {
      bg_1: "#eec1c6",
      t_1: "#e83f38",
      bg_2: "#d7f1fe",
      t_2: "#01a0fc",
      bg_3: "#ffcbac",
      t_3: "#f36d1e",
      bg_4: "#f2eaba",
      t_4: "#f2eaba",

      // bg_5: "#d7f1fe",
      // t_5: '#01a0fc',
      // bg_6: "#ffcbac",
      // t_6: '#f36d1e',
    },
  },
  shadow: {
    card: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)",
  },
};
