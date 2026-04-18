import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { auth } from "../../components/firebase";

export default function Profile() {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile 👤</Text>

      <Text>Email:</Text>
      <Text style={styles.value}>{user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  value: {
    fontSize: 16,
    marginTop: 5,
  },
});