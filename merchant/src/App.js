import React, { useState, useEffect } from "react";
import { Admin, Resource } from "react-admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  SupportAgent,
  Sms,
  People,
  PictureAsPdf,
  Tag,
  Class,
  Brush,
  Description,
  Widgets,
  NotificationsActive,
  Groups,
  AccountBox,
  Paid,
  AccountBalance,
  LocalGasStationTwoTone,
  // AccountBalanceWallet,
  // CreditCard,
} from "@mui/icons-material/index.js";

import Pages from "./pages/index.js";
import Providers from "./providers/index.js";
import "./styles.scss";
import { Loader } from "./shared/components/index.js";

export const App = () => {
  if (window.location.href.includes("/admin/")) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<Pages.Block.BlockPreview />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const [pluginsLoaded, setPluginsLoaded] = useState(false);
  const [datexEnabled, setDatexEnabled] = useState(false);
  const [clientsEnabled, setClientsEnabled] = useState(false);
  const [brandMerchantsEnabled, setBrandMerchantsEnabled] = useState(false);
  const [filesEnabled, setFilesEnabled] = useState(false);
  const [gasBrandMerchantsEnabled, setGasBrandMerchantsEnabled] =
    useState(false);
  const [merchantPaymentGatewaysEnabled, setMerchantPaymentGatewaysEnabled] =
    useState(false);
  const [smsServicesEnabled, setSmsServicesEnabled] = useState(false);
  const [supportEnabled, setSupportEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [designEditorEnabled, setDesignEditorEnabled] = useState(false);
  const [pageEditorEnabled, setPageEditorEnabled] = useState(false);
  const [blocksEditorEnabled, setBlocksEditorEnabled] = useState(false);
  const [categoriesEditor, setCategoriesEditor] = useState(false);
  const [tagsEditor, setTagsEditor] = useState(false);

  const loadPlugins = (plugins) => {
    setDatexEnabled(plugins.datex);
    setClientsEnabled(plugins.clients);
    setBrandMerchantsEnabled(plugins.brandMerchants);
    setFilesEnabled(plugins.files);
    setGasBrandMerchantsEnabled(plugins.gasBrandMerchants);
    setMerchantPaymentGatewaysEnabled(plugins.merchantPaymentGateways);
    setSmsServicesEnabled(plugins.smsServices);
    setSupportEnabled(plugins.support);
    setNotificationsEnabled(plugins.notifications);
    setDesignEditorEnabled(plugins.designEditor);
    setPageEditorEnabled(plugins.pageEditor);
    setBlocksEditorEnabled(plugins.blocksEditor);
    setTagsEditor(plugins.tagsEditor);
    setCategoriesEditor(plugins.categoriesEditor);
  };

  window.addEventListener("login", () => {
    loadPlugins(JSON.parse(localStorage.getItem("plugins")));
  });

  useEffect(() => {
    const plugins = localStorage.getItem("plugins");

    if (plugins) {
      loadPlugins(JSON.parse(plugins));
    }
    setPluginsLoaded(true);
  }, []);

  if (!pluginsLoaded) return <Loader />;

  if (pluginsLoaded && datexEnabled) {
    return (
      <Admin
        authProvider={Providers.authProvider}
        dataProvider={Providers.dataProvider()}
        i18nProvider={Providers.i18nProvider}
        dashboard={Pages.Dashboard}
        disableTelemetry
      >
        <Resource
          name="Merchant"
          list={Pages.Merchant.List}
          show={Pages.Merchant.Show}
          edit={Pages.Merchant.Edit}
          icon={AccountBox}
        />
        <Resource
          name="Client"
          list={Pages.Client.List}
          show={Pages.Client.Show}
          edit={Pages.Client.Edit}
          create={Pages.Client.Create}
          icon={People}
        />
        <Resource
          name="BrandMerchant"
          list={Pages.BrandMerchant.List}
          show={Pages.BrandMerchant.Show}
          edit={Pages.BrandMerchant.Edit}
          create={Pages.BrandMerchant.Create}
          icon={Groups}
        />
        <Resource
          name="GasBrandMerchant"
          list={Pages.GasBrandMerchant.List}
          create={Pages.GasBrandMerchant.Create}
          show={Pages.GasBrandMerchant.Show}
          edit={Pages.GasBrandMerchant.Edit}
          icon={LocalGasStationTwoTone}
        />
        <Resource
          name="MerchantPaymentGateway"
          list={Pages.MerchantPaymentGateway.List}
          show={Pages.MerchantPaymentGateway.Show}
          edit={Pages.MerchantPaymentGateway.Edit}
          create={Pages.MerchantPaymentGateway.Create}
          icon={AccountBalance}
        />
        <Resource
          name="Trunc"
          list={Pages.Trunc.List}
          show={Pages.Trunc.Show}
          create={Pages.Trunc.Create}
          icon={Paid}
        />
        <Resource
          name="DatexTransaction"
          list={Pages.Transaction.List}
          show={Pages.Transaction.Show}
          icon={Paid}
        />
        <Resource
          name="SmsService"
          create={Pages.SmsService.Create}
          list={Pages.SmsService.List}
          edit={Pages.SmsService.Edit}
          icon={Sms}
        />
      </Admin>
    );
  }

  if (pluginsLoaded && !datexEnabled) {
    return (
      <Admin
        authProvider={Providers.authProvider}
        dataProvider={Providers.dataProvider()}
        i18nProvider={Providers.i18nProvider}
        dashboard={Pages.Dashboard}
        disableTelemetry
      >
        <Resource
          name="Merchant"
          list={Pages.Merchant.List}
          show={Pages.Merchant.Show}
          edit={Pages.Merchant.Edit}
          icon={AccountBox}
        />
        {clientsEnabled && (
          <Resource
            name="Client"
            list={Pages.Client.List}
            show={Pages.Client.Show}
            edit={Pages.Client.Edit}
            create={Pages.Client.Create}
            icon={People}
          />
        )}
        {brandMerchantsEnabled && (
          <Resource
            name="BrandMerchant"
            list={Pages.BrandMerchant.List}
            show={Pages.BrandMerchant.Show}
            edit={Pages.BrandMerchant.Edit}
            create={Pages.BrandMerchant.Create}
            icon={Groups}
          />
        )}
        {gasBrandMerchantsEnabled && (
          <Resource
            name="GasBrandMerchant"
            list={Pages.GasBrandMerchant.List}
            create={Pages.GasBrandMerchant.Create}
            show={Pages.GasBrandMerchant.Show}
            edit={Pages.GasBrandMerchant.Edit}
            icon={LocalGasStationTwoTone}
          />
        )}
        {merchantPaymentGatewaysEnabled && (
          <Resource
            name="MerchantPaymentGateway"
            list={Pages.MerchantPaymentGateway.List}
            show={Pages.MerchantPaymentGateway.Show}
            edit={Pages.MerchantPaymentGateway.Edit}
            create={Pages.MerchantPaymentGateway.Create}
            icon={AccountBalance}
          />
        )}
        {smsServicesEnabled && (
          <Resource
            name="SmsService"
            create={Pages.SmsService.Create}
            list={Pages.SmsService.List}
            edit={Pages.SmsService.Edit}
            icon={Sms}
          />
        )}
        {designEditorEnabled && (
          <Resource
            name="Design"
            list={Pages.Design.List}
            show={Pages.Design.Show}
            edit={Pages.Design.Edit}
            create={Pages.Design.Create}
            icon={Brush}
          />
        )}
        {pageEditorEnabled && (
          <Resource
            name="Page"
            create={Pages.Page.Create}
            show={Pages.Page.Show}
            list={Pages.Page.List}
            edit={Pages.Page.Edit}
            icon={Description}
          />
        )}
        {blocksEditorEnabled && (
          <Resource
            name="Block"
            list={Pages.Block.List}
            show={Pages.Block.Show}
            edit={Pages.Block.Edit}
            create={Pages.Block.Create}
            icon={Widgets}
          />
        )}
        {categoriesEditor && (
          <Resource
            name="Category"
            list={Pages.Category.List}
            show={Pages.Category.Show}
            edit={Pages.Category.Edit}
            create={Pages.Category.Create}
            icon={Class}
          />
        )}
        {tagsEditor && (
          <Resource
            name="Tag"
            list={Pages.Tag.List}
            show={Pages.Tag.Show}
            edit={Pages.Tag.Edit}
            create={Pages.Tag.Create}
            icon={Tag}
          />
        )}
        {filesEnabled && (
          <Resource
            name="File"
            list={Pages.File.List}
            show={Pages.File.Show}
            create={Pages.File.Create}
            icon={PictureAsPdf}
          />
        )}
        {supportEnabled && (
          <Resource name="Chat" list={Pages.Chat.List} icon={SupportAgent} />
        )}
        {notificationsEnabled && (
          <Resource
            name="Promotion"
            list={Pages.Promotion.List}
            show={Pages.Promotion.Show}
            edit={Pages.Promotion.Edit}
            create={Pages.Promotion.Create}
            icon={NotificationsActive}
          />
        )}
      </Admin>
    );
  }
};
