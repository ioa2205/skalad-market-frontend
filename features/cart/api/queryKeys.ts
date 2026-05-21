export const cartKeys = {
  all: ["cart"] as const,
  submit: () => [...cartKeys.all, "submit"] as const,
};
