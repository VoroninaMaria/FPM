import buildGraphQLProvider from "ra-data-graphql-simple";
import Config from "../config.js";

const getToken = () => localStorage.getItem("token");

const baseDataProvider = () =>
  buildGraphQLProvider({
    clientOptions: {
      uri: `${Config.serverUrl}api/merchant/graphql`,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  });

const getFileBase64 = (file, callback) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(callback(reader.result));

    reader.onerror = () => {
      reject("Fail");
    };
    reader.readAsDataURL(file);
  });
};

const dataProvider = () => ({
  getList: (resource, params) =>
    baseDataProvider().then((dp) => dp.getList(resource, params)),
  getOne: (resource, params) =>
    baseDataProvider().then((dp) => dp.getOne(resource, params)),
  getMany: (resource, params) =>
    baseDataProvider().then((dp) => dp.getMany(resource, params)),
  getManyReference: (resource, params) =>
    baseDataProvider().then((dp) => dp.getManyReference(resource, params)),
  create: (resource, params) => {
    if (params.data.attachments) {
      return getFileBase64(params.data.attachments.rawFile, (result) => {
        params.data.data = result;
        delete params.data["attachments"];

        return baseDataProvider().then((dp) => dp.create(resource, params));
      });
    }

    return baseDataProvider().then((dp) => dp.create(resource, params));
  },
  update: (resource, params) =>
    baseDataProvider().then((dp) => dp.update(resource, params)),
  updateMany: (resource, params) =>
    baseDataProvider().then((dp) => dp.updateMany(resource, params)),
  delete: (resource, params) =>
    baseDataProvider().then((dp) => dp.delete(resource, params)),
  deleteMany: (resource, params) =>
    baseDataProvider().then((dp) => dp.deleteMany(resource, params)),
});

export default dataProvider;
