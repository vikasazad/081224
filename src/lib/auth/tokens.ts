import { sendVerificationEmail } from "./mail";
export const generateVerificationToken = async (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 600000);
  const verificationToken = { email, otp, expires };
  const otpSend = await sendVerificationEmail(
    verificationToken.email,
    verificationToken.otp
  );
  if (otpSend.error === null) {
    return verificationToken;
  }
  return false;
};
