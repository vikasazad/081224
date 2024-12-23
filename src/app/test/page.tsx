"use client";
// import { add } from "@/lib/firebase/firestore";
import { update } from "@/lib/firebase/firestore";
// import { SignJWT } from "jose";

export default function Test() {
  const tables = {
    twoseater: [
      {
        diningDetails: {
          customer: {
            name: "John Doe",
            email: "john.doe@email.com",
            phone: "+1234567890",
          },
          orders: [
            {
              orderId: "OR:123",
              specialRequirement: "Make pina collada extra sour",
              items: [
                {
                  itemId: "gac1",
                  itemName: "Pizza",
                  portionSize: "Large",
                  price: "20",
                },
                {
                  itemId: "mac1",
                  itemName: "Salad",
                  portionSize: "Small",
                  price: "10",
                },
              ],
              attendant: "Alice Smith",
              status: "open",
              timeOfRequest: "2024-10-03T10:10:00.000Z",
              timeOfFullfilment: "2024-10-03T10:25:00.000Z",
              status: "paid",
              payment: {
                transctionId: "XUSie83",
                paymentStatus: "pending",
                mode: "room charge",
                paymentId: "RO24092101",
                price: "27",
                priceAfterDiscount: "27",
                timeOfTransaction: "2024-10-02T07:00:00.000Z",
                gst: {
                  gstAmount: "100",
                  gstPercentage: "18%",
                  cgstAmount: "50",
                  cgstPercentage: "9%",
                  sgstAmount: "50",
                  sgstPercentage: "9%",
                },
                discount: {
                  type: "none",
                  amount: 0,
                  code: "",
                },
              },
            },
          ],
          status: "paid",
          location: "T13",
          attendant: "Sarah Johnson",
          timeSeated: "2024-09-21T15:47:00.000Z",
          timeLeft: "2024-09-26T04:47:00.000Z",
          aggregator: "makeMyTrip",
          aggregatorLogo:
            "https://cdn.worldvectorlogo.com/logos/bookingcom-1.svg",
          noOfGuests: "2",
          capicity: "4",
          payment: {
            transctionId: "XUSie83",
            paymentStatus: "pending",
            mode: "room charge",
            paymentId: "RO24092101",
            price: "27",
            priceAfterDiscount: "27",
            timeOfTransaction: "2024-10-02T07:00:00.000Z",
            gst: {
              gstAmount: "100",
              gstPercentage: "18%",
              cgstAmount: "50",
              cgstPercentage: "9%",
              sgstAmount: "50",
              sgstPercentage: "9%",
            },
            discount: {
              type: "none",
              amount: 0,
              code: "",
            },
          },
        },
        issuesReported: {
          maintenance: {
            issueId: "IS:124",
            status: "Completed",
            category: "maintenance",
            name: "Wobbly Table",
            description: "Customer reported table is unstable",
            reportTime: "2024-09-25T09:47:00.000Z",
            resolutionTime: "2024-09-25T10:00:00.000Z",
            attendant: "Mike Brown",
          },
        },
        transctions: [
          {
            location: "104",
            against: "SE:7889",
            attendant: "Mishra",
            orderId: "BO:123",
            payment: {
              paymentStatus: "complete",
              mode: "online",
              paymentId: "TXN123456",
              timeOfTransaction: "2024-09-29T10:00:00.000Z",
              price: "30",
              priceAfterDiscount: "27",
              gst: {
                gstAmount: "100",
                gstPercentage: "18%",
                cgstAmount: "50",
                cgstPercentage: "9%",
                sgstAmount: "50",
                sgstPercentage: "9%",
              },
              discount: {
                type: "coupon",
                amount: 3,
                code: "SAVE10",
              },
            },
          },
        ],
      },
    ],
    fourseater: [
      {
        diningDetails: {
          customer: {
            name: "John Doe",
            email: "john.doe@email.com",
            phone: "+1234567890",
          },
          orders: [
            {
              orderId: "OR:123",
              specialRequirement: "Make pina collada extra sour",
              items: [
                {
                  itemId: "gac1",
                  itemName: "Pizza",
                  portionSize: "Large",
                  price: "20",
                },
                {
                  itemId: "mac1",
                  itemName: "Salad",
                  portionSize: "Small",
                  price: "10",
                },
              ],
              attendant: "Alice Smith",
              status: "open",
              timeOfRequest: "2024-10-03T10:10:00.000Z",
              timeOfFullfilment: "2024-10-03T10:25:00.000Z",
              status: "paid",
              payment: {
                transctionId: "XUSie83",
                paymentStatus: "pending",
                mode: "room charge",
                paymentId: "RO24092101",
                price: "27",
                priceAfterDiscount: "27",
                timeOfTransaction: "2024-10-02T07:00:00.000Z",
                gst: {
                  gstAmount: "100",
                  gstPercentage: "18%",
                  cgstAmount: "50",
                  cgstPercentage: "9%",
                  sgstAmount: "50",
                  sgstPercentage: "9%",
                },
                discount: {
                  type: "none",
                  amount: 0,
                  code: "",
                },
              },
            },
          ],
          status: "paid",
          location: "T13",
          attendant: "Sarah Johnson",
          timeSeated: "2024-09-21T15:47:00.000Z",
          timeLeft: "2024-09-26T04:47:00.000Z",
          aggregator: "makeMyTrip",
          aggregatorLogo:
            "https://cdn.worldvectorlogo.com/logos/bookingcom-1.svg",
          noOfGuests: "2",
          capicity: "4",
          payment: {
            transctionId: "XUSie83",
            paymentStatus: "pending",
            mode: "room charge",
            paymentId: "RO24092101",
            price: "27",
            priceAfterDiscount: "27",
            timeOfTransaction: "2024-10-02T07:00:00.000Z",
            gst: {
              gstAmount: "100",
              gstPercentage: "18%",
              cgstAmount: "50",
              cgstPercentage: "9%",
              sgstAmount: "50",
              sgstPercentage: "9%",
            },
            discount: {
              type: "none",
              amount: 0,
              code: "",
            },
          },
        },
        issuesReported: {
          maintenance: {
            issueId: "IS:124",
            status: "Completed",
            category: "maintenance",
            name: "Wobbly Table",
            description: "Customer reported table is unstable",
            reportTime: "2024-09-25T09:47:00.000Z",
            resolutionTime: "2024-09-25T10:00:00.000Z",
            attendant: "Mike Brown",
          },
        },
        transctions: [
          {
            location: "104",
            against: "SE:7889",
            attendant: "Mishra",
            orderId: "BO:123",
            payment: {
              paymentStatus: "complete",
              mode: "online",
              paymentId: "TXN123456",
              timeOfTransaction: "2024-09-29T10:00:00.000Z",
              price: "30",
              priceAfterDiscount: "27",
              gst: {
                gstAmount: "100",
                gstPercentage: "18%",
                cgstAmount: "50",
                cgstPercentage: "9%",
                sgstAmount: "50",
                sgstPercentage: "9%",
              },
              discount: {
                type: "coupon",
                amount: 3,
                code: "SAVE10",
              },
            },
          },
        ],
      },
    ],
    sixseater: [
      {
        diningDetails: {
          customer: {
            name: "John Doe",
            email: "john.doe@email.com",
            phone: "+1234567890",
          },
          orders: [
            {
              orderId: "OR:123",
              specialRequirement: "Make pina collada extra sour",
              items: [
                {
                  itemId: "gac1",
                  itemName: "Pizza",
                  portionSize: "Large",
                  price: "20",
                },
                {
                  itemId: "mac1",
                  itemName: "Salad",
                  portionSize: "Small",
                  price: "10",
                },
              ],
              attendant: "Alice Smith",
              status: "open",
              timeOfRequest: "2024-10-03T10:10:00.000Z",
              timeOfFullfilment: "2024-10-03T10:25:00.000Z",
              status: "paid",
              payment: {
                transctionId: "XUSie83",
                paymentStatus: "pending",
                mode: "room charge",
                paymentId: "RO24092101",
                price: "27",
                priceAfterDiscount: "27",
                timeOfTransaction: "2024-10-02T07:00:00.000Z",
                gst: {
                  gstAmount: "100",
                  gstPercentage: "18%",
                  cgstAmount: "50",
                  cgstPercentage: "9%",
                  sgstAmount: "50",
                  sgstPercentage: "9%",
                },
                discount: {
                  type: "none",
                  amount: 0,
                  code: "",
                },
              },
            },
          ],
          status: "paid",
          location: "T13",
          attendant: "Sarah Johnson",
          timeSeated: "2024-09-21T15:47:00.000Z",
          timeLeft: "2024-09-26T04:47:00.000Z",
          aggregator: "makeMyTrip",
          aggregatorLogo:
            "https://cdn.worldvectorlogo.com/logos/bookingcom-1.svg",
          noOfGuests: "2",
          capicity: "4",
          payment: {
            transctionId: "XUSie83",
            paymentStatus: "pending",
            mode: "room charge",
            paymentId: "RO24092101",
            price: "27",
            priceAfterDiscount: "27",
            timeOfTransaction: "2024-10-02T07:00:00.000Z",
            gst: {
              gstAmount: "100",
              gstPercentage: "18%",
              cgstAmount: "50",
              cgstPercentage: "9%",
              sgstAmount: "50",
              sgstPercentage: "9%",
            },
            discount: {
              type: "none",
              amount: 0,
              code: "",
            },
          },
        },
        issuesReported: {
          maintenance: {
            issueId: "IS:124",
            status: "Completed",
            category: "maintenance",
            name: "Wobbly Table",
            description: "Customer reported table is unstable",
            reportTime: "2024-09-25T09:47:00.000Z",
            resolutionTime: "2024-09-25T10:00:00.000Z",
            attendant: "Mike Brown",
          },
        },
        transctions: [
          {
            location: "104",
            against: "SE:7889",
            attendant: "Mishra",
            orderId: "BO:123",
            payment: {
              paymentStatus: "complete",
              mode: "online",
              paymentId: "TXN123456",
              timeOfTransaction: "2024-09-29T10:00:00.000Z",
              price: "30",
              priceAfterDiscount: "27",
              gst: {
                gstAmount: "100",
                gstPercentage: "18%",
                cgstAmount: "50",
                cgstPercentage: "9%",
                sgstAmount: "50",
                sgstPercentage: "9%",
              },
              discount: {
                type: "coupon",
                amount: 3,
                code: "SAVE10",
              },
            },
          },
        ],
      },
    ],
  };

  // let usr;
  const handleUser = async () => {
    const user = await update("vikumar.azad@gmail.com", tables, "restaurant");
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
