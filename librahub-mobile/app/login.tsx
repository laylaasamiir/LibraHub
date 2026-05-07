import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../components/firebase";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const getFriendlyErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/missing-password":
        return "Please enter your password.";
      case "auth/operation-not-allowed":
        return "Email/password login is not enabled.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setErrorMessage("No user data found.");
        return;
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      setErrorMessage(getFriendlyErrorMessage(error.code));
    }
  };

  const handleResetPassword = async () => {
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetMessage("Please enter your email.");
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(auth, resetEmail.trim());

      setResetMessage("✅ Password reset email sent successfully.");
    } catch (error: any) {
      setResetMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.container}>
        <Image source={require("../assets/book.jpg")} style={styles.icon} />

        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage("");
          }}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => {
            setResetEmail(email);
            setResetMessage("");
            setResetVisible(true);
          }}
        >
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={resetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setResetVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Reset Password</Text>

            <Text style={styles.modalText}>
              Enter your email to receive a password reset link.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={resetEmail}
              onChangeText={(text) => {
                setResetEmail(text);
                setResetMessage("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {resetMessage ? (
              <Text
                style={[
                  styles.resetMessage,
                  resetMessage.startsWith("✅") && styles.successMessage,
                ]}
              >
                {resetMessage}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, resetLoading && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={resetLoading}
            >
              <Text style={styles.buttonText}>
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setResetVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderRadius: 12,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    elevation: 4,
  },

  icon: {
    width: 110,
    height: 110,
    marginBottom: 15,
    resizeMode: "contain",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2f68aa",
    marginBottom: 22,
  },

  label: {
    width: "100%",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 14,
    borderRadius: 6,
    backgroundColor: "#fff",
  },

  forgot: {
    color: "#2f68aa",
    fontWeight: "600",
    alignSelf: "flex-end",
    marginBottom: 10,
  },

  errorMessage: {
    width: "100%",
    color: "#e74c3c",
    backgroundColor: "#fdecea",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#2f68aa",
    padding: 13,
    width: "100%",
    alignItems: "center",
    borderRadius: 6,
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footer: {
    flexDirection: "row",
    marginTop: 18,
  },

  footerText: {
    color: "#333",
  },

  link: {
    color: "#2f68aa",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 340,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },

  closeBtn: {
    position: "absolute",
    right: 14,
    top: 12,
  },

  closeText: {
    fontSize: 18,
    color: "#777",
    fontWeight: "bold",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2f68aa",
    marginBottom: 10,
  },

  modalText: {
    color: "#555",
    textAlign: "center",
    marginBottom: 18,
  },

  resetMessage: {
    width: "100%",
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  successMessage: {
    color: "green",
  },

  cancelText: {
    marginTop: 14,
    color: "#777",
    fontWeight: "600",
  },
});
