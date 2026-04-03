"use server";

import { unstable_noStore as noStore } from "next/cache";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { createSession, destroySession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
});

export async function login(formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  try {
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return { error: { email: ["Invalid email or password"] } };
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return { error: { email: ["Invalid email or password"] } };
    }

    // Create session
    await createSession(user._id.toString());

    return { success: true, user: { name: user.name, email: user.email } };
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: { email: ["An error occurred during login"] } };
  }
}

export async function signup(formData: FormData) {
  const validatedFields = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  try {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return { error: { email: ["Email already registered"] } };
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Create session
    await createSession(user._id.toString());

    return { success: true, user: { name: user.name, email: user.email } };
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return { error: { email: ["Email already registered"] } };
    }

    return { error: { email: ["An error occurred during signup"] } };
  }
}

export async function logout() {
  try {
    await destroySession();
  } catch (error) {
    console.error("Logout error:", error);
  }

  redirect("/login");
}

export async function getAuthUser() {
  noStore(); // Disable caching
  try {
    await connectDB();

    const cookiesStore = await cookies();
    const sessionToken = cookiesStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    const user = await User.findById(sessionToken).select("-password").lean();

    if (!user) {
      return null;
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Get auth user error:", error);
    return null;
  }
}
