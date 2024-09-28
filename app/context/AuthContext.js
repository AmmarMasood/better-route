"use client";

import { useContext, createContext, useState, useEffect } from "react";
import {
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { USER_COLLECTION, auth, db } from "../lib/firebase";
import axios from "axios";
import axiosApiInstance from "../utils/axiosClient";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { doc, setDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initializeUser = async (user) => {
    try {
      // Save user details to Firestore
      await setDoc(doc(db, USER_COLLECTION, user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
      });
    } catch (error) {
      console.error("Error signing up with email and password", error);
      throw error;
    }
  };

  const emailPasswordSignup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const emailPasswordSignin = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  const sendVerificationEmail = () => {
    return sendEmailVerification(auth.currentUser);
  };

  const sendUserPasswordResetEmail = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const setToken = (token) => {
    localStorage.setItem("auth", token);
  };
  const getToken = () => {
    return localStorage.getItem("auth");
  };
  const logOut = async () => {
    await signOut(auth);
    localStorage.removeItem("auth");
    setUser(null);
    setProfile(null);
    router.push("/");
  };

  const getUser = async (force) => {
    const token = getToken();
    if (!token) return;
    if (profile && force !== true) return;
    setLoading(true);
    try {
      //get current user from firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
    } catch (err) {
      console.log(err);
      message.error("Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      await getUser();
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        logOut,
        emailPasswordSignup,
        emailPasswordSignin,
        sendVerificationEmail,
        setToken,
        loading,
        setLoading,
        getUser,
        initializeUser,
        sendUserPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
