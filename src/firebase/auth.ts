// firebase/authService.ts
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./config";
import { User } from "../types";

export const signInWithGoogle = async (): Promise<User | undefined> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Cast result.user to your custom User type
    const user: User = result.user as User;
    console.log(user); // User details after signing in
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return undefined;
  }
};
