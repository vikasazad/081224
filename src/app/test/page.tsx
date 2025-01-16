"use client";
// import { add } from "@/lib/firebase/firestore";
import { update } from "@/lib/firebase/firestore";
// import { SignJWT } from "jose";

export default function Test() {
  const tables = {
    categories: {
      "Room upgrades": {
        roomupgrades: [
          {
            typeName: "Room Upgrades",
            description: "You can upgrade into new room with minimal price",
            availableOptions: [
              {
                name: "deluxe",
                price: 90,
                images: [],
                amenities: [],
                discount: "new year",
              },
            ],
          },
        ],
      },
      Wellness: {
        messages: [
          {
            typeName: "Swedish Massage",
            description:
              "Relaxing full-body massage to reduce stress and tension",
            price: 80,
            startTime: "10:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
          {
            typeName: "Deep Tissue Massage",
            description: "Intensive massage targeting deep muscle layers",
            price: 95,
            startTime: "10:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
          {
            typeName: "Hot Stone Massage",
            description: "Therapeutic massage using heated stones",
            price: 110,
            startTime: "11:00",
            endTime: "19:00",
            duration: "75 minutes",
          },
          {
            typeName: "Aromatherapy Massage",
            description: "Relaxing massage with essential oils",
            price: 90,
            startTime: "10:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
        ],
        facialTreatments: [
          {
            typeName: "Customized Facial",
            description: "Personalized facial treatment for your skin type",
            price: 75,
            startTime: "09:00",
            endTime: "18:00",
            duration: "45 minutes",
          },
          {
            typeName: "Anti-Aging Facial",
            description: "Advanced facial to reduce signs of aging",
            price: 120,
            startTime: "10:00",
            endTime: "19:00",
            duration: "75 minutes",
          },
        ],
        bodyTreatments: [
          {
            typeName: "Full Body Scrub",
            description: "Exfoliating treatment for smooth, glowing skin",
            price: 85,
            startTime: "11:00",
            endTime: "18:00",
            duration: "60 minutes",
          },
        ],
        hydrotherapy: [
          {
            typeName: "Hydrotherapy Session",
            description: "Therapeutic water-based treatment",
            price: 65,
            startTime: "09:00",
            endTime: "21:00",
            duration: "45 minutes",
          },
        ],
        personalTraining: [
          {
            typeName: "Personal Training Session",
            description: "One-on-one fitness session with a certified trainer",
            price: 70,
            startTime: "06:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
        ],
        groupClasses: [
          {
            typeName: "Group Yoga Class",
            description: "Instructor-led yoga session for all levels",
            price: 20,
            startTime: "07:00",
            endTime: "19:00",
            duration: "60 minutes",
          },
          {
            typeName: "Group Pilates Class",
            description: "Core-strengthening Pilates session",
            price: 25,
            startTime: "08:00",
            endTime: "18:00",
            duration: "45 minutes",
          },
        ],
        outdoorActivities: [
          {
            typeName: "Guided Nature Hike",
            description: "Scenic outdoor hike with an experienced guide",
            price: 40,
            startTime: "08:00",
            endTime: "16:00",
            duration: "120 minutes",
          },
        ],
        detoxPrograms: [
          {
            typeName: "3-Day Detox Program",
            description:
              "Comprehensive detoxification program including specialized diet and treatments",
            price: 450,
            duration: "3 days",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        weightLossPrograms: [
          {
            typeName: "Nutrition Consultation",
            description: "Personalized dietary advice from a nutritionist",
            price: 85,
            startTime: "09:00",
            endTime: "17:00",
            duration: "60 minutes",
          },
        ],
        stressManagementPrograms: [
          {
            typeName: "Guided Meditation Session",
            description: "Learn and practice meditation techniques",
            price: 30,
            startTime: "07:00",
            endTime: "20:00",
            duration: "45 minutes",
          },
        ],
        hairAndNailSalons: [
          {
            typeName: "Professional Hair Styling",
            description: "Haircut and styling by experienced stylists",
            price: 60,
            startTime: "09:00",
            endTime: "19:00",
            duration: "60 minutes",
          },
          {
            typeName: "Classic Manicure",
            description: "Nail care and polish for hands",
            price: 35,
            startTime: "10:00",
            endTime: "18:00",
            duration: "45 minutes",
          },
        ],
        makeupServices: [
          {
            typeName: "Professional Makeup Application",
            description: "Expert makeup application for any occasion",
            price: 75,
            duration: "60 minutes",
            startTime: "09:00",
            endTime: "20:00",
          },
        ],
        acupuncture: [
          {
            typeName: "Acupuncture Session",
            description: "Traditional Chinese medicine treatment",
            price: 90,
            startTime: "10:00",
            endTime: "18:00",
            duration: "60 minutes",
          },
        ],
        reiki: [
          {
            typeName: "Reiki Healing Session",
            description: "Energy healing treatment for relaxation",
            price: 70,
            startTime: "11:00",
            endTime: "19:00",
            duration: "60 minutes",
          },
        ],
        ayurveda: [
          {
            typeName: "Ayurvedic Consultation",
            description: "Personalized Ayurvedic health assessment",
            price: 100,
            startTime: "09:00",
            endTime: "17:00",
            duration: "90 minutes",
          },
        ],
        juiceBars: [
          {
            typeName: "Fresh Pressed Juice",
            description: "Healthy, freshly squeezed fruit and vegetable juices",
            price: 8,
            startTime: "07:00",
            endTime: "21:00",
            duration: "5 minutes",
          },
        ],
        meditationSessions: [
          {
            typeName: "Guided Meditation Sessions",
            description:
              "Expert-led meditation sessions for relaxation and mindfulness",
            price: 30,
            duration: "45 minutes",
            startTime: "07:00",
            endTime: "20:00",
          },
        ],
        relaxationLounges: [
          {
            typeName: "Stress Reduction Workshop",
            description:
              "Group workshop teaching various stress management techniques",
            price: 75,
            duration: "3 hours",
            startTime: "14:00",
            endTime: "17:00",
          },
        ],
        sleepPrograms: [
          {
            typeName: "Sleep Enhancement Package",
            description: "Comprehensive program to improve sleep quality",
            price: 200,
            duration: "1 week",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        wellnessRetreats: [
          {
            typeName: "Weekend Wellness Retreat",
            description:
              "Immersive wellness experience including various treatments and activities",
            price: 600,
            duration: "2 days",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        healthAndWellnessSeminars: [
          {
            typeName: "Health and Wellness Educational Seminars",
            description:
              "Informative seminars on various health and wellness topics",
            price: 50,
            duration: "90 minutes",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        chiropracticServices: [
          {
            typeName: "Chiropractic Assessment and Treatment",
            description:
              "Initial consultation and treatment with a licensed chiropractor",
            price: 120,
            duration: "60 minutes",
            startTime: "09:00",
            endTime: "17:00",
          },
        ],
        physicalTherapy: [
          {
            typeName: "Physical Therapy Evaluation and Treatment",
            description:
              "One-on-one session with a licensed physical therapist",
            price: 110,
            duration: "60 minutes",
            startTime: "08:00",
            endTime: "18:00",
          },
        ],
        craniosacralTherapy: [
          {
            typeName: "Craniosacral Therapy Session",
            description: "Gentle bodywork focusing on the craniosacral system",
            price: 95,
            duration: "60 minutes",
            startTime: "10:00",
            endTime: "18:00",
          },
        ],
        waterAerobics: [
          {
            typeName: "Group Water Aerobics",
            description: "Low-impact fitness class conducted in the pool",
            price: 25,
            duration: "45 minutes",
            startTime: "09:00",
            endTime: "11:00",
          },
        ],
        saunasAndSteamRooms: [
          {
            typeName: "Private Sauna Experience",
            description: "Relaxing session in a private sauna",
            price: 30,
            duration: "30 minutes",
            startTime: "07:00",
            endTime: "21:00",
          },
        ],
      },
      Recreational: {
        messages: [
          {
            typeName: "Swedish Massage",
            description:
              "Relaxing full-body massage to reduce stress and tension",
            price: 80,
            startTime: "10:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
          {
            typeName: "Deep Tissue Massage",
            description: "Intensive massage targeting deep muscle layers",
            price: 95,
            startTime: "10:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
          {
            typeName: "Hot Stone Massage",
            description: "Therapeutic massage using heated stones",
            price: 110,
            startTime: "11:00",
            endTime: "19:00",
            duration: "75 minutes",
          },
          {
            typeName: "Aromatherapy Massage",
            description: "Relaxing massage with essential oils",
            price: 90,
            startTime: "10:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
        ],
        facialTreatments: [
          {
            typeName: "Customized Facial",
            description: "Personalized facial treatment for your skin type",
            price: 75,
            startTime: "09:00",
            endTime: "18:00",
            duration: "45 minutes",
          },
          {
            typeName: "Anti-Aging Facial",
            description: "Advanced facial to reduce signs of aging",
            price: 120,
            startTime: "10:00",
            endTime: "19:00",
            duration: "75 minutes",
          },
        ],
        bodyTreatments: [
          {
            typeName: "Full Body Scrub",
            description: "Exfoliating treatment for smooth, glowing skin",
            price: 85,
            startTime: "11:00",
            endTime: "18:00",
            duration: "60 minutes",
          },
        ],
        hydrotherapy: [
          {
            typeName: "Hydrotherapy Session",
            description: "Therapeutic water-based treatment",
            price: 65,
            startTime: "09:00",
            endTime: "21:00",
            duration: "45 minutes",
          },
        ],
        personalTraining: [
          {
            typeName: "Personal Training Session",
            description: "One-on-one fitness session with a certified trainer",
            price: 70,
            startTime: "06:00",
            endTime: "20:00",
            duration: "60 minutes",
          },
        ],
        groupClasses: [
          {
            typeName: "Group Yoga Class",
            description: "Instructor-led yoga session for all levels",
            price: 20,
            startTime: "07:00",
            endTime: "19:00",
            duration: "60 minutes",
          },
          {
            typeName: "Group Pilates Class",
            description: "Core-strengthening Pilates session",
            price: 25,
            startTime: "08:00",
            endTime: "18:00",
            duration: "45 minutes",
          },
        ],
        outdoorActivities: [
          {
            typeName: "Guided Nature Hike",
            description: "Scenic outdoor hike with an experienced guide",
            price: 40,
            startTime: "08:00",
            endTime: "16:00",
            duration: "120 minutes",
          },
        ],
        detoxPrograms: [
          {
            typeName: "3-Day Detox Program",
            description:
              "Comprehensive detoxification program including specialized diet and treatments",
            price: 450,
            duration: "3 days",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        weightLossPrograms: [
          {
            typeName: "Nutrition Consultation",
            description: "Personalized dietary advice from a nutritionist",
            price: 85,
            startTime: "09:00",
            endTime: "17:00",
            duration: "60 minutes",
          },
        ],
        stressManagementPrograms: [
          {
            typeName: "Guided Meditation Session",
            description: "Learn and practice meditation techniques",
            price: 30,
            startTime: "07:00",
            endTime: "20:00",
            duration: "45 minutes",
          },
        ],
        hairAndNailSalons: [
          {
            typeName: "Professional Hair Styling",
            description: "Haircut and styling by experienced stylists",
            price: 60,
            startTime: "09:00",
            endTime: "19:00",
            duration: "60 minutes",
          },
          {
            typeName: "Classic Manicure",
            description: "Nail care and polish for hands",
            price: 35,
            startTime: "10:00",
            endTime: "18:00",
            duration: "45 minutes",
          },
        ],
        makeupServices: [
          {
            typeName: "Professional Makeup Application",
            description: "Expert makeup application for any occasion",
            price: 75,
            duration: "60 minutes",
            startTime: "09:00",
            endTime: "20:00",
          },
        ],
        acupuncture: [
          {
            typeName: "Acupuncture Session",
            description: "Traditional Chinese medicine treatment",
            price: 90,
            startTime: "10:00",
            endTime: "18:00",
            duration: "60 minutes",
          },
        ],
        reiki: [
          {
            typeName: "Reiki Healing Session",
            description: "Energy healing treatment for relaxation",
            price: 70,
            startTime: "11:00",
            endTime: "19:00",
            duration: "60 minutes",
          },
        ],
        ayurveda: [
          {
            typeName: "Ayurvedic Consultation",
            description: "Personalized Ayurvedic health assessment",
            price: 100,
            startTime: "09:00",
            endTime: "17:00",
            duration: "90 minutes",
          },
        ],
        juiceBars: [
          {
            typeName: "Fresh Pressed Juice",
            description: "Healthy, freshly squeezed fruit and vegetable juices",
            price: 8,
            startTime: "07:00",
            endTime: "21:00",
            duration: "5 minutes",
          },
        ],
        meditationSessions: [
          {
            typeName: "Guided Meditation Sessions",
            description:
              "Expert-led meditation sessions for relaxation and mindfulness",
            price: 30,
            duration: "45 minutes",
            startTime: "07:00",
            endTime: "20:00",
          },
        ],
        relaxationLounges: [
          {
            typeName: "Stress Reduction Workshop",
            description:
              "Group workshop teaching various stress management techniques",
            price: 75,
            duration: "3 hours",
            startTime: "14:00",
            endTime: "17:00",
          },
        ],
        sleepPrograms: [
          {
            typeName: "Sleep Enhancement Package",
            description: "Comprehensive program to improve sleep quality",
            price: 200,
            duration: "1 week",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        wellnessRetreats: [
          {
            typeName: "Weekend Wellness Retreat",
            description:
              "Immersive wellness experience including various treatments and activities",
            price: 600,
            duration: "2 days",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        healthAndWellnessSeminars: [
          {
            typeName: "Health and Wellness Educational Seminars",
            description:
              "Informative seminars on various health and wellness topics",
            price: 50,
            duration: "90 minutes",
            startTime: "08:00",
            endTime: "16:00",
          },
        ],
        chiropracticServices: [
          {
            typeName: "Chiropractic Assessment and Treatment",
            description:
              "Initial consultation and treatment with a licensed chiropractor",
            price: 120,
            duration: "60 minutes",
            startTime: "09:00",
            endTime: "17:00",
          },
        ],
        physicalTherapy: [
          {
            typeName: "Physical Therapy Evaluation and Treatment",
            description:
              "One-on-one session with a licensed physical therapist",
            price: 110,
            duration: "60 minutes",
            startTime: "08:00",
            endTime: "18:00",
          },
        ],
        craniosacralTherapy: [
          {
            typeName: "Craniosacral Therapy Session",
            description: "Gentle bodywork focusing on the craniosacral system",
            price: 95,
            duration: "60 minutes",
            startTime: "10:00",
            endTime: "18:00",
          },
        ],
        waterAerobics: [
          {
            typeName: "Group Water Aerobics",
            description: "Low-impact fitness class conducted in the pool",
            price: 25,
            duration: "45 minutes",
            startTime: "09:00",
            endTime: "11:00",
          },
        ],
        saunasAndSteamRooms: [
          {
            typeName: "Private Sauna Experience",
            description: "Relaxing session in a private sauna",
            price: 30,
            duration: "30 minutes",
            startTime: "07:00",
            endTime: "21:00",
          },
        ],
      },
      Transportation: {
        "Airport Shuttle": [
          {
            typeName: "Airport Shuttle Service",
            description: "Convenient transportation to and from the airport",
            price: 25,
            duration: "Varies based on airport distance",
            airportList: ["LXY", "NDL", "MBY"],
            bookingPolicy: "Reservation required at least 24 hours in advance",
          },
        ],
        "Local Area Shuttle": [
          {
            typeName: "Local Attraction Shuttle",
            description:
              "Transportation to popular local attractions and shopping areas",
            price: 15,
            duration: "Varies based on destination",
            bookingPolicy: "Departures every hour from 9:00 AM to 5:00 PM",
          },
        ],
        "Luxury Car Rental": [
          {
            typeName: "Premium Car Rental Service",
            description: "High-end car rentals for guests",
            price: 150,
            duration: "24-hour rental period",
            bookingPolicy: "Valid driver's license and credit card required",
          },
        ],
        "Bicycle Rental": [
          {
            typeName: "Hotel Bicycle Rental",
            description: "Rent bicycles for exploring the local area",
            price: 20,
            duration: "Up to 8 hours",
            includedItems: "Helmet, lock, and city map",
            bookingPolicy: "Waiver must be signed before rental",
          },
        ],
      },
      "Personal Shopping": {
        "Personal Shopping": [
          {
            typeName: "Personal Shopping",
            description: "smooth ride towards airport",
            keyBenefits:
              "Convenience: Leave the planning and logistics to us while you enjoy a stress-free shopping day.",
            timeline:
              "8:00 AM - 9:00 AM: Start your day with a gourmet breakfast at the hotel, meeting your personal shopper to discuss your preferences",
            pricingPerPerson: "Standard Package: 50 per person",
            bookingAndCancellationPolicy:
              "Cancellation: Cancellations made within 24 hours of the scheduled service will incur a 50% cancellation fee. No-shows will be charged the full price",
            testimonials:
              "An unforgettable shopping experience! The personal shopper knew exactly what I was looking for and took me to the best places in town.",
          },
        ],
      },
      Laundry: {
        "Laundry Service": [
          {
            typeName: "Washing & Drying",
            description:
              "Professional washing and drying service for your clothes",
            price: 15,
            minTime: "2 hours",
          },
        ],
        "Dry Cleaning": [
          {
            typeName: "Dry Cleaning",
            description:
              "Expert dry cleaning for delicate fabrics and formal wear",
            price: 25,
            minTime: "24 hours",
          },
        ],
        "Pressing Service": [
          {
            typeName: "Ironing Service",
            description:
              "Get your clothes professionally pressed and wrinkle-free",
            price: 10,
            minTime: "1 hour",
          },
        ],
        "Stain Removal": [
          {
            typeName: "Specialized Stain Treatment",
            description: "Advanced stain removal for tough spots and spills",
            price: 20,
            minTime: "3 hours",
          },
        ],
        "ShoeShine Service": [
          {
            typeName: "Shoe Shine Service",
            description:
              "Professional shoe polishing to keep your footwear looking sharp",
            price: 12,
            minTime: "30 minutes",
          },
        ],
      },
      Tours: {
        "City Tour": [
          {
            typeName: "City Tour",
            description: "smooth ride towards airport",
            keyBenefits:
              "Convenience: Leave the planning and logistics to us while you enjoy a stress-free shopping day.",
            timeline:
              "8:00 AM - 9:00 AM: Start your day with a gourmet breakfast at the hotel, meeting your personal shopper to discuss your preferences",
            duration: "3 hours",
            pricingPerPerson: "Standard Package: 50 per person",
            bookingAndCancellationPolicy:
              "Cancellation: Cancellations made within 24 hours of the scheduled service will incur a 50% cancellation fee. No-shows will be charged the full price",
            testimonials:
              "An unforgettable shopping experience! The personal shopper knew exactly what I was looking for and took me to the best places in town.",
          },
        ],
        "Food and Wine Tour": [
          {
            typeName: "Local Culinary Experience Tour",
            description: "Guided tour of local cuisine and wine tasting",
            pricingPerPerson: 85,
            duration: "3 hours",
            keyBenefits:
              "Taste local specialties, wine pairing, culinary history and culture insights",
            timeline: "Tuesday, Thursday, and Saturday at 6:00 PM",
            bookingAndCancellationPolicy:
              "Cancellation: Cancellations made within 24 hours of the scheduled service will incur a 50% cancellation fee. No-shows will be charged the full price",
            testimonials:
              "An unforgettable shopping experience! The personal shopper knew exactly what I was looking for and took me to the best places in town.",
          },
        ],
      },
    },
  };

  // let usr;
  const handleUser = async () => {
    const user = await update("vikumar.azad@gmail.com", tables, "hotel");
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
