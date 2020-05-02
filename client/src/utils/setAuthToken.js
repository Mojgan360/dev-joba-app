import axiox from "axios";
const setAuthToken = (token) => {
  if (token) {
    axiox.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axiox.defaults.headers.common["x-auth-token"];
  }
};
export default setAuthToken;
