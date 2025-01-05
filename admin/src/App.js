import React from "react";
import { Admin, Resource } from "react-admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  PictureAsPdf,
  Tag,
  Class,
  AccountBox,
  Diversity3,
  LocationOn,
  Discount,
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
        name="Merchant"
        create={Pages.Merchant.Create}
        list={Pages.Merchant.List}
        show={Pages.Merchant.Show}
        edit={Pages.Merchant.Edit}
        icon={Diversity3}
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
        edit={Pages.Location.Edit}
        create={Pages.Location.Create}
        icon={LocationOn}
      />
    </Admin>
  );
};
