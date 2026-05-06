import { View, Text, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../components/firebase";
import { useRouter } from "expo-router";

export default function LogoutScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <Text>Are you sure you want to logout?</Text>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: "red", marginTop: 10 }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}