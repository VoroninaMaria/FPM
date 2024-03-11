import { useState, useEffect } from "react";
import { SafeAreaView, ActivityIndicator, StyleSheet } from "react-native";
import { Layout } from "./index.js";
import * as actions from "./utils/actions";
import Client from "./utils/Client";
import md5 from "md5";

const Main = () => {
  const [schema, setSchema] = useState(null);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [currentPageOptions, setCurrentPageOptions] = useState({});
  const [userPhone, setUserPhone] = useState("");
  const [timerTick, setTimerTick] = useState(false);

  const getClientConfig = () =>
    Client.getConfig()
      .then((response) => {
        let pageId = response.data.default_page_id;

        setSchema(response.data);

        if (window.location.href.includes("/preview/")) {
          pageId = window.location.href.split("/").pop();
        }

        setCurrentPageId(pageId);
      })
      .catch(() => {
        throw new Error("Error fetching config");
      });

  const updatetimerTick = () => {
    setTimerTick(!timerTick);
  };

  useEffect(() => {
    Client.getConfigMD5()
      .then((response) => {
        if (response.data.md5 !== md5(JSON.stringify(schema))) {
          getClientConfig();
        }
      })
      .catch(() => {
        throw new Error("Error fetching config MD5");
      });

    setTimeout(updatetimerTick, 5000);
  }, [timerTick]);

  const redirect = ({ page, options = {} }) => {
    setCurrentPageId(page);
    setCurrentPageOptions(options);
  };

  const storage = {
    router: { currentPageId, currentPageOptions },
    auth: {},
    actions,
    callbacks: {
      redirect,
      setUserPhone,
      userPhone,
    },
  };

  if (!schema) {
    return (
      <SafeAreaView>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styless.container}>
      <Layout
        {...schema.pages[currentPageId]}
        options={currentPageOptions}
        storage={storage}
      />
    </SafeAreaView>
  );
};

export default Main;

const styless = StyleSheet.create({
  container: {
    flex: 1,
  },
});
