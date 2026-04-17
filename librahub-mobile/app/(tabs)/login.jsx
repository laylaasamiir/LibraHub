import React, { useState } from "react";
import { View } from "react-native";
import LoginScreen from "../../components/LoginScreen";
import ProfileScreen from "../../components/ProfileScreen";
 import RegisterScreen from "../../components/RegisterScreen";

export default function AppLoginScreen() {
  
  const [showRegister, setShowRegister] = useState(false);
   
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
   
  const [currentUser, setCurrentUser] = useState(null);

 
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowRegister(false);  
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {isLoggedIn ? (
        
        <ProfileScreen user={currentUser} onLogout={handleLogout} />
      ) : showRegister ? (
       
        <RegisterScreen
          onRegisterSuccess={() => setShowRegister(false)}
          onLoginPress={() => setShowRegister(false)}
        />
      ) : (
         
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onRegisterPress={() => setShowRegister(true)}
        />
      )}
    </View>
  );
}