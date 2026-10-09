export const authRules = {
  email: value => typeof value === "string" && value.includes("@"),
  password: value => typeof value === "string" && value.length >= 8
};
