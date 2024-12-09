import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { findIfStaffLogin, findUserByEmail } from "@/lib/firebase/firestore";
// if role is admin then direct auth and login
// if email is not mainEmail or not in staff then -> email not found
// if email is not mainEmail but from staff then authenticate and redirect to create password page
// let the user login only when he is verified else throw error of please verify your email
// if registration done through any provider then we want be able to now anything about their business

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        staffEmail: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        console.log("From Auth", credentials);
        if (
          credentials?.email &&
          credentials?.staffEmail &&
          credentials?.password
        ) {
          console.log("HERE IN STAFF");
          const email = credentials.email as string;
          const staffemail = credentials.staffEmail as string; // Use the correct variable for staffemail
          const password = credentials.password as string;

          if (!email || !staffemail || !password) {
            throw new Error("Please provide email, staff email, and password");
          }

          const existingAdmin = await findUserByEmail(email);
          console.log("existingAdmin", existingAdmin);
          if (!existingAdmin)
            throw new Error("Couldn't find for Buildbility Account!");

          const isValidStaff = await findIfStaffLogin(email, staffemail);
          console.log("isValidStaff", isValidStaff);
          if (!isValidStaff)
            throw new Error("Couldn't find for Buildbility Account!");

          if (staffemail === isValidStaff.email) {
            console.log("PASSWORD", {
              password,
              staff: isValidStaff.password,
              pass: await compare(password, isValidStaff.password),
            });
            if (await compare(password, isValidStaff.password)) {
              const newUser: any = {
                id: existingAdmin.personalInfo.contactInfo.email,
                email: existingAdmin.personalInfo.contactInfo.email,
                password: existingAdmin.personalInfo.password,
                image: existingAdmin.business.image,
                role: isValidStaff.role,
                newUser: existingAdmin.business.newUser,
                isverified: existingAdmin.business.isverified,
                canForgotPassword: existingAdmin.business.canForgotPassword,
                staff: isValidStaff,
              };

              return newUser; // Return staff user if password matches
            } else {
              throw new Error("Couldn't find for Buildbility Account!");
            }
          }
        }

        if (credentials?.email && credentials?.password) {
          console.log("HEREIN NORMAL");
          const email = credentials.email as string;
          const password = credentials.password as string;

          if (!email || !password) {
            throw new Error("Please provide both email and password");
          }

          const existingUser = await findUserByEmail(email);
          if (!existingUser || !existingUser.personalInfo.password) {
            throw new Error("Couldn't find for Buildbility Account!");
          }

          if (email === existingUser.personalInfo.contactInfo.email) {
            if (await compare(password, existingUser.personalInfo.password)) {
              const newUser: any = {
                id: existingUser.personalInfo.contactInfo.email,
                email: existingUser.personalInfo.contactInfo.email,
                password: existingUser.personalInfo.password,
                image: existingUser.business.image,
                role: existingUser.business.role,
                newUser: existingUser.business.newUser,
                isverified: existingUser.business.isverified,
                canForgotPassword: existingUser.business.canForgotPassword,
              };

              return newUser; // Return admin user if password matches
            } else {
              throw new Error("Incorrect email or password");
            }
          }
        }

        return null; // Return the validated user
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider === "google") {
        try {
          if (typeof user.email === "string") {
            const findUser = await findUserByEmail(user.email);
            // console.log("herejerejetrejeyejeyejeyejeyejy1", findUser);
            if (findUser) {
              user.password = findUser.personalInfo.password || "";
              user.role = findUser.business.role;
              user.isverified = findUser.business.isverified;
              user.canForgotPassword = findUser.business.canForgotPassword;
            }
            user.newUser = !findUser;
          }
        } catch (error) {
          console.error("Error finding user:", error);
          return false; // Stop sign-in if there's an error
        }
      }

      return true;
    },

    session: async ({ token, session }) => {
      if (token.sub && session.user) {
        console.log("here2");
        // console.log("herejerejetrejeyejeyejeyejeyejy2", session);
        session.user = { ...session.user, ...token } as any;
      }
      return session;
    },

    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        console.log("here3");
        // console.log("herejerejetrejeyejeyejeyejeyejy3", token, user);
        token = { ...token, ...user };
      }
      if (trigger === "update") {
        // This will be run after using  update method
        console.log("Look its running");
        return { ...token, ...session.user };
      }

      return token;
    },
  },

  // events: {
  //   async signIn({ isNewUser, profile, account, user }) {
  //     //3
  //     // console.log("isthis new user->>>>", {
  //     //   isNewUser: isNewUser, //given undefined
  //     //   Profile: profile, // gives provider details, email, important email_verified
  //     //   Account: account,
  //     //   User: user,
  //     // });
  //   },
  // },
});
