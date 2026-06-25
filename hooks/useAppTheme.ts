import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function useAppTheme() {
  const colorScheme = useColorScheme();
  return Colors.toklo[colorScheme === "dark" ? "dark" : "light"];
}

export type AppTheme = ReturnType<typeof useAppTheme>;
