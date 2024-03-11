import React from "react";
import {
  useUpdate,
  useRecordContext,
  useGetOne,
  useTranslate,
} from "react-admin";
import { Loader } from "../../shared/components/index.js";

const SubmitButton = () => {
  const t = useTranslate();
  const merchantId = localStorage.getItem("id");
  const record = useRecordContext();
  const diff = { newbie: false };
  const [update, { isLoading, error }] = useUpdate();

  const handleSubmit = () => {
    update("Merchant", { id: merchantId, data: diff, previousData: record });
    localStorage.setItem("newbie", diff.newbie);
  };

  if (error) {
    throw new Error(error);
  }

  return (
    <div style={{ justifyContent: "center", display: "flex" }}>
      <button
        className="skip-button"
        type="submit"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        <span className="circle" aria-hidden="true">
          <span className="icon arrow"></span>
        </span>
        <span className="button-text">{t("resources.Dashboard.skip")}</span>
      </button>
    </div>
  );
};

const OtherDashboard = () => {
  const t = useTranslate();
  const { data, isLoading, error } = useGetOne("Merchant", {
    id: localStorage.getItem("id"),
  });

  if (!data && isLoading) return <Loader />;

  if (data?.newbie && !error && !isLoading) {
    return (
      <div>
        <div style={{ justifyContent: "center", display: "flex" }}>
          <SubmitButton />
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <h1>{t("resources.Dashboard.name")}</h1>
      </div>
    );
  }
};

export default OtherDashboard;
