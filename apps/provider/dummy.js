// Dummy shim for native modules on Web
export const getItemAsync = async () => null;
export const setItemAsync = async () => {};
export const deleteItemAsync = async () => {};

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
