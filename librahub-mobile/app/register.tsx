import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../components/firebase";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [studentCode, setStudentCode] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleRegister = async () => {
    setErrorName("");
    setErrorEmail("");
    setErrorPassword("");

    let valid = true;

    if (!name.trim()) {
      setErrorName("Name is required");
      valid = false;
    }

    if (!email.trim()) {
      setErrorEmail("Email is required");
      valid = false;
    }

    if (password.length < 6) {
      setErrorPassword("Password must be at least 6 characters");
      valid = false;
    }

    if (!valid) return;

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await updateProfile(res.user, {
        displayName: name.trim(),
      });

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: "student",
        department: department.trim(),
        level,
        studentCode: studentCode.trim(),
        createdAt: Date.now(),
      });

      Alert.alert("Success", "Account created successfully");

      router.replace("/(tabs)");
    } catch (e: any) {
      switch (e.code) {
        case "auth/email-already-in-use":
          setErrorEmail("Email already registered");
          break;

        case "auth/invalid-email":
          setErrorEmail("Invalid email format");
          break;

        case "auth/weak-password":
          setErrorPassword("Password is too weak, min 6 characters");
          break;

        case "auth/missing-password":
          setErrorPassword("Password is required");
          break;

        default:
          setErrorEmail("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Student Information</Text>

        {errorName ? <Text style={styles.inputError}>{errorName}</Text> : null}
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrorName("");
          }}
          style={styles.input}
        />

        {errorEmail ? (
          <Text style={styles.inputError}>{errorEmail}</Text>
        ) : null}
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorEmail("");
          }}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {errorPassword ? (
          <Text style={styles.inputError}>{errorPassword}</Text>
        ) : null}
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorPassword("");
          }}
          style={styles.input}
          secureTextEntry
        />

        <Text style={styles.label}>Department</Text>
        <TextInput
          placeholder="Department"
          value={department}
          onChangeText={setDepartment}
          style={styles.input}
        />

        <Text style={styles.label}>Student Code</Text>
        <TextInput
          placeholder="Student Code"
          value={studentCode}
          onChangeText={setStudentCode}
          style={styles.input}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Level</Text>
        <View style={styles.levelBox}>
          {["1", "2", "3", "4"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.levelBtn, level === item && styles.levelBtnActive]}
              onPress={() => setLevel(item)}
            >
              <Text
                style={[
                  styles.levelText,
                  level === item && styles.levelTextActive,
                ]}
              >
                Level {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Create account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Do you have an account? </Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  container: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 5,
  },

  title: {
    marginBottom: 20,
    color: "#2f68aa",
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },

  label: {
    width: "100%",
    marginBottom: 5,
    textAlign: "left",
    color: "#333",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    marginBottom: 15,
    padding: 11,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },

  inputError: {
    width: "100%",
    color: "#d32f2f",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 8,
  },

  levelBox: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },

  levelBtn: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  levelBtnActive: {
    backgroundColor: "#2f68aa",
    borderColor: "#2f68aa",
  },

  levelText: {
    color: "#333",
    fontWeight: "600",
  },

  levelTextActive: {
    color: "#fff",
  },

  button: {
    width: "100%",
    padding: 12,
    borderRadius: 5,
    backgroundColor: "#2f68aa",
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footer: {
    flexDirection: "row",
    marginTop: 15,
  },

  footerText: {
    fontSize: 14,
    color: "#333",
  },

  link: {
    color: "#2f68aa",
    fontWeight: "bold",
  },
});
