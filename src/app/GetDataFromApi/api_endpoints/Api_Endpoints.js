export function getApiEndpoints(role) {
  return role === "user"
    ? {
        login_page: "auth/login",
        sign_up_page: "auth/signup",
      }
    : {
        login_page: "auth/login",
        sign_up_page: "auth/signup",
      };
}
