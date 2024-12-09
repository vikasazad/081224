interface ContactInfo {
  countryCode: string;
  phoneNumber: string;
  email: string;
}

interface PersonalInfo {
  ownerName: string;
  country: string;
  zipCode: string;
  contactInfo: ContactInfo;
  address: string;
  password: string;
}

interface BusinessInfo {
  id: string;
  businessName: string;
  businessType: string;
  role: string;
  isVerified: string;
  canForgotPassword: boolean;
  formattedNumber: string;
  image: string;
  newUser: boolean;
  gst: string;
  countryCode: string;
  phone: string;
  email: string;
  password: string;
  panNo: string;
}

export interface NewUser {
  personalInfo: PersonalInfo;
  hotel: object; // You can replace `object` with a more specific type if needed
  restaurant: object; // Same as above
  business: BusinessInfo;
  staff: any[]; // Replace `any[]` with a more specific type if needed
}

export interface UserRegistration {
  firstname: string;
  lastname: string;
  email: string;
  countryCode: string;
  phone: string;
  businessName: string;
  businessType: string;
  password: string;
  formattedNumber: string;
}
export interface UserData {
  firstname: string;
  lastname: string;
  email: string;
  countryCode: string;
  phone: string;
  businessName: string;
  businessType: string;
  password: string;
  confirmPassword: string;
}

export interface UserRegistrationSocial {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  businessName: string;
  businessType: string;
  image?: string; // Optional field
  role?: string; // Optional field
  formattedNumber?: string; // Optional field
}

export interface PhoneOtpResponse {
  verificationProcess: null;
  verificationId: string;
}

export interface StaffLogin {
  adminEmail: string;
  password: string;
  staffEmail: string;
}
