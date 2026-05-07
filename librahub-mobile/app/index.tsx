import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const features = [
    {
      icon: "🔍",
      title: "Search Books",
      desc: "Find any book in the library quickly and easily.",
    },
    {
      icon: "📋",
      title: "Track Borrowing",
      desc: "See all your borrowed books and due dates.",
    },
    {
      icon: "🔔",
      title: "Get Alerts",
      desc: "Never miss a return date with smart reminders.",
    },
  ];

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />

        <Text style={styles.heroIcon}>📖</Text>

        <Text style={styles.heroTitle}>
          Welcome to <Text style={styles.brand}>LibraHub</Text>
        </Text>

        <Text style={styles.heroSubtitle}>
          Borrow books, track your reading, and manage everything in one place.
        </Text>

        <View style={styles.heroButtons}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={styles.btnOutline}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.btnOutlineText}>Login</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>What you can do</Text>

        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>© 2026 LibraHub. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  hero: {
    minHeight: 520,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: "#fdf2f3",
    position: "relative",
    overflow: "hidden",
  },

  circleTop: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(239,149,157,0.15)",
  },

  circleBottom: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(13,110,253,0.10)",
  },

  heroIcon: {
    fontSize: 56,
    marginBottom: 20,
  },

  heroTitle: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 46,
  },

  brand: {
    color: "#0d6efd",
  },

  heroSubtitle: {
    color: "#6b7280",
    fontSize: 17,
    maxWidth: 340,
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 27,
  },

  heroButtons: {
    width: "100%",
    maxWidth: 280,
    gap: 16,
    zIndex: 2,
  },

  btnPrimary: {
    backgroundColor: "#0d6efd",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    alignItems: "center",
  },

  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },

  btnOutline: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ef959d",
    backgroundColor: "transparent",
    alignItems: "center",
  },

  btnOutlineText: {
    color: "#ef959d",
    fontSize: 15,
    fontWeight: "600",
  },

  features: {
    paddingVertical: 80,
    paddingHorizontal: 24,
  },

  featuresTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 48,
  },

  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
    marginBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },

  featureTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },

  featureDesc: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
    textAlign: "center",
  },

  footer: {
    textAlign: "center",
    padding: 24,
    color: "#9ca3af",
    fontSize: 13,
  },
});
