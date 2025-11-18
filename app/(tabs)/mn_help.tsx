import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen() {
  const router = useRouter();

  const HelpSection = ({ icon, title, content }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#68952A" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Help & Support</Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <HelpSection
            icon="camera-outline"
            title="How to Take Photos"
            content="For best results, take clear photos of mango leaves in good lighting. Ensure the leaf fills most of the frame and is in focus. Avoid shadows and blurry images."
          />

          <HelpSection
            icon="leaf-outline"
            title="Disease Detection"
            content="Our app can identify common mango leaf diseases including Anthracnose, Powdery Mildew, Bacterial Canker, and healthy leaves. Simply capture or upload a photo for instant analysis."
          />

          <HelpSection
            icon="medical-outline"
            title="Treatment Recommendations"
            content="After disease detection, you'll receive detailed treatment recommendations including preventive measures, organic solutions, and chemical treatments when necessary."
          />

          <HelpSection
            icon="time-outline"
            title="Early Detection Tips"
            content="Check your mango trees regularly, especially during humid seasons. Early detection is key to preventing disease spread. Look for spots, discoloration, or unusual patterns on leaves."
          />

          <HelpSection
            icon="shield-checkmark-outline"
            title="Accuracy & Limitations"
            content="While our AI model is trained on thousands of images, it's a diagnostic aid, not a replacement for professional advice. Consult an agricultural expert for severe cases."
          />

          <HelpSection
            icon="information-circle-outline"
            title="About the App"
            content="This app uses advanced machine learning to help farmers and gardeners identify mango leaf diseases quickly and accurately, promoting better crop health management."
          />
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need More Help?</Text>
          <Text style={styles.contactText}>
            For technical support or questions about disease treatment, contact your local agricultural extension office or plant pathologist.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 50 
  },
  backBtn: { 
    position: "absolute", 
    left: 20, 
    top: 50, 
    zIndex: 10 
  },
  title: { 
    fontSize: 30, 
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 20,
    color: "#1a4d2e"
  },
  scrollView: {
    flex: 1,
    width: "100%"
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  section: {
    marginBottom: 25
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
    color: "#1a4d2e"
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    marginLeft: 34
  },
  contactCard: {
    backgroundColor: "rgba(104, 149, 42, 0.2)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "#68952A"
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a4d2e"
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#2d5016"
  }
});