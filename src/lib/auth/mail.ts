import { Resend } from "resend";

const resend = new Resend("re_H66ip8V1_Mfd7fRUTR1cjWMyNzsueaSNN");

export const sendVerificationEmail = async (email: string, token: string) => {
  const data = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirm your email",
    html: `
    <h1>YOUR LOGIN CODE FOR BUILDBILITY<h1/>

    <p>This code will only be valid for the next 10 minutes. If your
      otp is expired or does not work, you can use resend in the registration</p>
      <br><br>
    <p style={{fontFamily: "monospace",
      fontWeight: "700",
      padding: "1px 4px",
      backgroundColor: "#dfe1e4",
      letterSpacing: "-0.3px",
      fontSize: "21px",0
      borderRadius: "4px",
      color: "#3c4149",}}>
      ${token}</p> 
    `,
  });
  return data;
};
