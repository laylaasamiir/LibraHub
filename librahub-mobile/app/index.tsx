import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const handleStart = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📖</Text>

      <Text style={styles.title}>
        Welcome to <Text style={styles.brand}>LibraHub</Text>
      </Text>

      <Text style={styles.subtitle}>
        Borrow books, track your reading, and manage everything in one place.
      </Text>

      <Pressable style={styles.btn} onPress={handleStart}>
        <Text style={styles.btnText}>Get Started</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icon: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  brand: {
    color: "#1e3a8a",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 15,
    color: "#2563eb",
  },
});