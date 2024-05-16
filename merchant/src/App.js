import React from "react";
import { Admin, Resource } from "react-admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  SupportAgent,
  Sms,
  People,
  PictureAsPdf,
  Tag,
  Class,
  AccountBox,
  LocationOn,
  Discount,
  CardMembership,
  WorkHistory,
} from "@mui/icons-material/index.js";

import Pages from "./pages/index.js";
import Providers from "./providers/index.js";
import "./styles.scss";

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
        name="SmsService"
        create={Pages.SmsService.Create}
        list={Pages.SmsService.List}
        edit={Pages.SmsService.Edit}
        icon={Sms}
      />

      <Resource
        name="Category"
        list={Pages.Category.List}
        show={Pages.Category.Show}
        edit={Pages.Category.Edit}
        create={Pages.Category.Create}
        icon={Class}
      />
      <Resource
        name="Tag"
        list={Pages.Tag.List}
        show={Pages.Tag.Show}
        edit={Pages.Tag.Edit}
        create={Pages.Tag.Create}
        icon={Tag}
      />

      <Resource
        name="File"
        list={Pages.File.List}
        show={Pages.File.Show}
        create={Pages.File.Create}
        icon={PictureAsPdf}
      />

      <Resource
        name="Discount"
        list={Pages.Discount.List}
        show={Pages.Discount.Show}
        edit={Pages.Discount.Edit}
        create={Pages.Discount.Create}
        icon={Discount}
      />

      <Resource
        name="Location"
        list={Pages.Location.List}
        show={Pages.Location.Show}
        create={Pages.Location.Create}
        edit={Pages.Location.Edit}
        icon={LocationOn}
      />

      <Resource
        name="Membership"
        list={Pages.Membership.List}
        show={Pages.Membership.Show}
        create={Pages.Membership.Create}
        edit={Pages.Membership.Edit}
        icon={CardMembership}
      />

      <Resource
        name="MembershipLog"
        list={Pages.MembershipLog.List}
        show={Pages.MembershipLog.Show}
        edit={Pages.MembershipLog.Edit}
        icon={WorkHistory}
      />

      <Resource name="Chat" list={Pages.Chat.List} icon={SupportAgent} />
    </Admin>
  );
};
