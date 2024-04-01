import React from "react";
import { Admin, Resource } from "react-admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Sms,
  People,
  PictureAsPdf,
  Tag,
  Class,
  AccountBox,
  Diversity3,
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
      disableTelemetry
    >
      <Resource
        name="Admin"
        list={Pages.Admin.List}
        show={Pages.Admin.Show}
        edit={Pages.Admin.Edit}
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
        name="Merchant"
        create={Pages.Merchant.Create}
        list={Pages.Merchant.List}
        show={Pages.Merchant.Show}
        edit={Pages.Merchant.Edit}
        icon={Diversity3}
      />
      <Resource
        name="SmsService"
        list={Pages.SmsService.List}
        edit={Pages.SmsService.Edit}
        create={Pages.SmsService.Create}
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
        icon={PictureAsPdf}
      />
      <Resource
        name="Location"
        list={Pages.Location.List}
        show={Pages.Location.Show}
        edit={Pages.Location.Edit}
        create={Pages.Location.Create}
        icon={PictureAsPdf}
      />

      <Resource
        name="Membership"
        list={Pages.Membership.List}
        show={Pages.Membership.Show}
        create={Pages.Membership.Create}
        edit={Pages.Membership.Edit}
        icon={PictureAsPdf}
      />
      <Resource
        name="MembershipLog"
        list={Pages.MembershipLog.List}
        show={Pages.MembershipLog.Show}
        edit={Pages.MembershipLog.Edit}
        icon={PictureAsPdf}
      />
    </Admin>
  );
};
