import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  CardScreen,
  ProfileScreen,
  SettingScreen,
  HistoryScreen,
  PartnersScreen,
  RegisterScreen,
  ChangingPinScreen,
  LoginScreen,
  MenuScreen,
  SupportScreen,
  ExitScreen,
  ConfirmationScreen,
  OtpScreen,
  LoaderScreen,
  ResetPasswordScreen,
  ConfirmResetOTPScreen,
  ConfirmationResetScreen,
  ChangePassword,
  SwitchAccountScreen,
  AbonementListScreen,
  InformationScreen,
} from "./src/screens/index.js";
import Config from "./src/screens/config.js";
import { useTranslation } from "react-i18next";
import "./src/localization/i18n";

const Stack = createNativeStackNavigator();

const App = () => {
  const { t } = useTranslation();
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      console.log(token);
      if (!token && !authToken) {
        Alert.alert(t("Session.session"), t("Session.finished"));
        setTimeout(() => setIsLoading(false), 2000);
      }
      if (token) {
        setAuthToken(token);
        return axios
          .post(`${Config.baseUrl}/client/auth/checkAuth`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.status === 200) {
              return setTimeout(() => setIsLoading(false), 2000);
            }
          })
          .catch(() => {
            return AsyncStorage.removeItem("token").then(() => {
              setIsLoading(false);
              Alert.alert(t("Session.session"), t("Session.finished"));
              return setAuthToken("");
            });
          });
      }
    });
  }, []);

  if (isLoading) {
    return <LoaderScreen />;
  }

  let initialScreenName;

  if (authToken) {
    initialScreenName = "CardScreen";
  }
  if (!authToken) {
    initialScreenName = "Login";
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialScreenName}
        screenOptions={{
          headerShown: false,
          orientation: "portrait",
        }}
      >
        {!isLoading && (
          <>
            <Stack.Screen name="CardScreen" component={CardScreen} />

            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Settings" component={ChangingPinScreen} />
            <Stack.Screen name="Partners" component={PartnersScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OTPScreen" component={OtpScreen} />
            <Stack.Screen
              name="InformationScreen"
              component={InformationScreen}
            />
            <Stack.Screen
              name="AbonementListScreen"
              component={AbonementListScreen}
            />
            <Stack.Screen name="Menu" component={MenuScreen} />

            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen
              name="SwitchAccount"
              component={SwitchAccountScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen
              name="ConfirmResetOTP"
              component={ConfirmResetOTPScreen}
            />

            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="Exit">
              {(props) => {
                return <ExitScreen {...props} setAuthToken={setAuthToken} />;
              }}
            </Stack.Screen>

            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen
              name="ConfirmationReset"
              component={ConfirmationResetScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
