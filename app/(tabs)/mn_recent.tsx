import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecentScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Recent</Text>
      <Text style={styles.text}>No recent items yet.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, alignItems: "center" },
  backBtn: { position: "absolute", left: 20, top: 50 },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 15 },
  text: { fontSize: 18, color: "#333" },
});
