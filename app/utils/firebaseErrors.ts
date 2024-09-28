export function mapAuthCodeToMessage(authCode: string) {
  switch (authCode) {
    case "Firebase: Error (auth/invalid-login-credentials).":
      return "Invalid credentials provided.";
    case "Firebase: Error (auth/invalid-email).":
      return "Invalid email address.";
    case "Firebase: Password should be at least 6 characters (auth/weak-password).":
      return "Password should be at least 6 characters.";
    default:
      return authCode;
  }
}
