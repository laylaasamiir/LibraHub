import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, dp } from '../components/firebase'; 
import { doc, setDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

export default function RegisterForm({ onRegisterSuccess, onLoginPress }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [level, setLevel] = useState("");
    const [department, setDepartment] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPassword, setErrorPassword] = useState("");
    const [errorName, setErrorName] = useState("");

    const handleRegister = async () => {
        setErrorEmail(""); setErrorPassword(""); setErrorName("");
        let valid = true;

        if (!name) { setErrorName("Name is required"); valid = false; }
        if (!email) { setErrorEmail("Email is required"); valid = false; }
        if (password.length < 6) { setErrorPassword("Password must be at least 6 characters"); valid = false; }
        if (!valid) return;

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

      
            await setDoc(doc(dp, "users", res.user.uid), {
                name, email, role: "student", department, level, createdAt: Date.now(),
            });

            Alert.alert("Success", "Account created successfully");
            onRegisterSuccess();
        } catch (e) {
            console.log(e.code);
            switch (e.code) {
                case "auth/email-already-in-use": setErrorEmail("Email already registered"); break;
                case "auth/invalid-email": setErrorEmail("Invalid email format"); break;
                default: setErrorEmail("Registration failed. Please try again.");
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Student Information</Text>

            {errorName ? <Text style={styles.error}>{errorName}</Text> : null}
            <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />

            {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}
            <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            {errorPassword ? <Text style={styles.error}>{errorPassword}</Text> : null}
            <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

            <TextInput placeholder="Department" style={styles.input} value={department} onChangeText={setDepartment} />

            <View style={styles.pickerContainer}>
                <Picker selectedValue={level} onValueChange={(val) => setLevel(val)}>
                    <Picker.Item label="Choose Level" value="" />
                    <Picker.Item label="Level 1" value="1" />
                    <Picker.Item label="Level 2" value="2" />
                    <Picker.Item label="Level 3" value="3" />
                    <Picker.Item label="Level 4" value="4" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onLoginPress}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 25, justifyContent: 'center', flexGrow: 1, backgroundColor: '#f0f2f5' },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#2f68aa", textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 12, backgroundColor: "white" },
    pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 12, backgroundColor: "white" },
    button: { backgroundColor: "#2f68aa", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 10 },
    buttonText: { color: "white", fontWeight: "bold" },
    link: { marginTop: 15, textAlign: "center", color: "#2f68aa" },
    error: { color: "red", marginBottom: 5, fontSize: 12 }
});