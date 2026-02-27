import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, dp } from '../components/firebase'; 
import { doc, getDoc } from "firebase/firestore";

export default function LoginScreen({ onLoginSuccess, onRegisterPress }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const docRef = doc(dp, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                onLoginSuccess(userData);
            } else {
                Alert.alert("No user data found.");
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    return (
        <View style={styles.page}>
            <View style={styles.main}>
                <View style={styles.container}>
                    <Image source={require('../assets/book.jpg')} style={styles.icon} />
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
                        <TouchableOpacity onPress={onRegisterPress}>
                            <Text style={styles.link}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { backgroundColor: '#f0f2f5', flex: 1 },
    main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: {
        backgroundColor: 'white',
        paddingVertical: 30,
        paddingHorizontal: 40,
        borderRadius: 10,
        width: 350,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    icon: { marginBottom: 15, width: 110, height: 110, resizeMode: 'contain' },
    title: { marginBottom: 20, color: '#2f68aa', fontSize: 24, fontWeight: 'bold' },
    input: { width: '100%', marginBottom: 15, padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' },
    button: { padding: 10, borderRadius: 5, backgroundColor: '#2f68aa', alignItems: 'center', width: '100%', marginTop: 10 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    footer: { marginTop: 15, flexDirection: 'row' },
    link: { color: '#2f68aa', textDecorationLine: 'underline' },
});