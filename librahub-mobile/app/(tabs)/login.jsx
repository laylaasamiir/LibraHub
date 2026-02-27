import React, { useState } from "react";
import { View } from "react-native";
import LoginScreen from "../../components/LoginScreen";
import RegisterScreen from "../../components/RegisterScreen";
export default function AppLoginScreen() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {showRegister ? (
        <RegisterScreen
          onRegisterSuccess={() => setShowRegister(false)} 
          onLoginPress={() => setShowRegister(false)} 
        />
      ) : (
        <LoginScreen 
          onLoginSuccess={(user) => console.log(user)} 
          onRegisterPress={() => setShowRegister(true)} 
        />
      )}
    </View>
  );
}