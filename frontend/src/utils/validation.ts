// utils/validation.ts

export const emailValidation = {
  required: "Email is required",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
  },
};

// utils/validation.ts

export const passwordValidation = {
  required: "Password is required",

  minLength: {
    value: 8,
    message: "Password must be at least 8 characters",
  },

  pattern: {
    value:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    message:
      "Must include uppercase, lowercase, number, and special character",
  },

  validate: {
    noSpaces: (value: string) =>
      !/\s/.test(value) || "Password should not contain spaces",
  },
};

export const nameValidation = {
  required: "Name is required",
  minLength: {
    value: 2,
    message: "Name must be at least 2 characters",
  },
};
