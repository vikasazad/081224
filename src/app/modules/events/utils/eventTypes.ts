// Types
export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  pricePerPlate: number;
  isVeg?: boolean;
}

export interface EventMenuItem {
  id: string;
  categoryId: string;
  categoryName: string;
  cuisineName: string;
  name: string;
  description: string;
  nature: string;
  portion: string;
  price: { [key: string]: string };
  images: string[];
  tags: string[];
  discountAmount?: string;
  discountType?: string;
}

export interface EventMenu {
  [category: string]: EventMenuItem[];
}

export interface EventVenue {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: { min: number; max: number };
  area: string;
  pricePerDay: number;
  pricePerHour: number;
  amenities: string[];
  suitableFor: string[];
  imageUrl: string;
}

export interface StaffMember {
  name: string;
  contact: string;
  role: string;
  status: string;
  active?: boolean;
}

export interface EventBooking {
  eventId: string;
  eventType: string;
  venue: { id: string; name: string; pricePerDay: number };
  name: string;
  phone: string;
  email?: string;
  numberOfPeople: number;
  startDate: string;
  endDate: string;
  relationshipManager: { name: string; contact: string };
  foodNature: "veg" | "nonveg" | "mixed";
  pricePerPlate: number;
  paymentType: "cash" | "online";
  menu: EventMenu;
  createdAt: string;
  status: string;
  business: {
    name: string;
    phone: string;
    website: string;
  };
  payment: {
    paymentStatus: string;
    mode: string;
    paymentId: string;
    referenceId: string;
    timeOfTransaction: string;
    price: number;
    priceAfterDiscount: string;
    paymentType: string;
    subtotal: number;
    totalPrice: number;
    gst: {
      gstAmount: number;
      gstPercentage: number;
      cgstAmount: number;
      cgstPercentage: number;
      sgstAmount: number;
      sgstPercentage: number;
    };
    discount: [
      {
        type: string;
        amount: number;
        code: string;
        discount: number;
      },
    ];
  };
  transctions: {
    location: string;
    against: string;
    attendant: string;
    bookingId: string;
    payment: {
      paymentStatus: string;
      mode: string;
      paymentId: string;
      referenceId: string;
      timeOfTransaction: string;
      price: number;
      priceAfterDiscount: string;
      paymentType: string;
      subtotal: number;
      totalPrice: number;
      gst: {
        gstAmount: number;
        gstPercentage: number;
        cgstAmount: number;
        cgstPercentage: number;
        sgstAmount: number;
        sgstPercentage: number;
      };
      discount: [
        {
          type: string;
          amount: number;
          code: string;
          discount: number;
        },
      ];
    };
  }[];
}

export interface SettingsVenue {
  id: string;
  name: string;
  type: "indoor" | "outdoor";
  area: string;
  price: number;
}

export interface EventSettings {
  enabledEventTypes: string[];
  enabledFoodOptions: string[];
  venues: SettingsVenue[];
}
