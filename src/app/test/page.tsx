"use client";
// import { add } from "@/lib/firebase/firestore";
import { update } from "@/lib/firebase/firestore";
// import { SignJWT } from "jose";

export default function Test() {
  const staff = [
    {
      name: "Michael Brown",
      email: "michael.brown@luxestay.com",
      password: "$2a$08$B4neJ9aZic6EQM/ibldFZ.lGEGJxo4AEMDMduzY4RC04ja95oMRSa",
      role: "manager",
      contact: "+1-310-555-5678",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T09:00:00")),
        end: JSON.stringify(new Date("2023-09-25T17:00:00")),
      },
    },
    {
      name: "Sarah Lee",
      email: "sarah.lee@luxestay.com",
      password: "$2a$08$B4neJ9aZic6EQM/ibldFZ.lGEGJxo4AEMDMduzY4RC04ja95oMRSa",
      role: "reception",
      contact: "+1-310-555-8765",
      newUser: "false",
      status: "offline",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T15:00:00")),
        end: JSON.stringify(new Date("2023-09-25T23:00:00")),
      },
    },
    {
      name: "David Chen",
      email: "david.chen@luxestay.com",
      password: "StaffP@ss003!",
      role: "attendant",
      contact: "+1-310-555-4321",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T07:00:00")),
        end: JSON.stringify(new Date("2023-09-25T15:00:00")),
      },
    },
    {
      name: "Emily Davis",
      email: "emily.davis@luxestay.com",
      password: "StaffP@ss004!",
      role: "attendant",
      contact: "+1-310-555-1234",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T06:00:00")),
        end: JSON.stringify(new Date("2023-09-25T14:00:00")),
      },
    },
    {
      name: "Robert Taylor",
      email: "robert.taylor@luxestay.com",
      password: "StaffP@ss005!",
      role: "attendant",
      contact: "+1-310-555-6789",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T22:00:00")),
        end: JSON.stringify(new Date("2023-09-26T06:00:00")),
      },
    },
    {
      name: "Laura Wilson",
      email: "laura.wilson@luxestay.com",
      password: "StaffP@ss006!",
      role: "attendant",
      contact: "+1-310-555-2468",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T08:00:00")),
        end: JSON.stringify(new Date("2023-09-25T16:00:00")),
      },
    },
    {
      name: "James Anderson",
      email: "james.anderson@luxestay.com",
      password: "StaffP@ss007!",
      role: "attendant",
      contact: "+1-310-555-1357",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T10:00:00")),
        end: JSON.stringify(new Date("2023-09-25T18:00:00")),
      },
    },
    {
      name: "Olivia Harris",
      email: "olivia.harris@luxestay.com",
      password: "StaffP@ss010!",
      role: "attendant",
      contact: "+1-310-555-8901",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T16:00:00")),
        end: JSON.stringify(new Date("2023-09-25T00:00:00")),
      },
    },
    {
      name: "William Scott",
      email: "william.scott@luxestay.com",
      password: "StaffP@ss011!",
      role: "concierge",
      contact: "+1-310-555-4567",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T10:00:00")),
        end: JSON.stringify(new Date("2023-09-25T18:00:00")),
      },
    },
    {
      name: "Sophia Adams",
      email: "sophia.adams@luxestay.com",
      password: "StaffP@ss012!",
      role: "attendant",
      contact: "+1-310-555-6743",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T07:00:00")),
        end: JSON.stringify(new Date("2023-09-25T15:00:00")),
      },
    },
    {
      name: "Daniel White",
      email: "daniel.white@luxestay.com",
      password: "StaffP@ss013!",
      role: "technician",
      contact: "+1-310-555-2123",
      newUser: "false",
      status: "offline",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T12:00:00")),
        end: JSON.stringify(new Date("2023-09-25T20:00:00")),
      },
    },
    {
      name: "Ethan Brooks",
      email: "ethan.brooks@luxestay.com",
      password: "StaffP@ss014!",
      role: "driver",
      contact: "+1-310-555-9988",
      newUser: "false",
      status: "online",
      canForgotPassword: false,
      notificationToken: "",
      orders: [],
      shiftDetails: {
        start: JSON.stringify(new Date("2023-09-25T05:00:00")),
        end: JSON.stringify(new Date("2023-09-25T13:00:00")),
      },
    },
  ];

  // let usr;
  const handleUser = async () => {
    const user = await update("vikumar.azad@gmail.com", staff, "info");
    // const secretKey = new TextEncoder().encode("Vikas@1234");

    // const payload = {
    //   email: "vikumar.azad@gmail.com",
    //   tableNo: "6",
    //   tax: { gstPercentage: "" },
    // };
    // // const hashedPassword = await hash("123456789", 8);
    // const token = await new SignJWT(payload)
    //   .setProtectedHeader({ alg: "HS256" }) // Set the signing algorithm
    //   // Do not set `.setExpirationTime()` to omit the expiration claim
    //   .sign(secretKey);

    // return token;
    console.log(user);
    // console.log(data);
  };
  // handleUser().then((token) => {
  //   console.log("JWT Token:", token);
  // });
  return (
    <div>
      {/* <h1>{JSON.stringify(usr)}</h1> */}
      <button onClick={() => handleUser()}>Click</button>
    </div>
  );
}
