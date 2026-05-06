import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please enter email and password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      
      router.replace("/(tabs)");

    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.main}>
        <View style={styles.container}>

          <Image
            source={require("../assets/book.jpg")}
            style={styles.icon}
          />

          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          
          <View style={styles.footer}>
            <Text>Don't have an account? </Text>

            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f0f2f5" },
  main: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    width: 350,
    alignItems: "center",
  },

  icon: {
    width: 110,
    height: 110,
    marginBottom: 15,
    resizeMode: "contain",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f68aa",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },

  button: {
    backgroundColor: "#2f68aa",
    padding: 12,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  footer: {
    flexDirection: "row",
    marginTop: 15,
  },

  link: {
    color: "#2f68aa",
    fontWeight: "bold",
  },
});