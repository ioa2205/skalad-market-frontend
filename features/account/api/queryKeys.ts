export const accountKeys = {
  all: ["account"] as const,
  profile: () => [...accountKeys.all, "profile"] as const,
  photo: () => [...accountKeys.all, "photo"] as const,
};
