import React from "react";
// import Reservation from "../modules/reservation/components/newReservation";
import {
  getBusinessInfo,
  getRoomDetails,
} from "../modules/staff/utils/staffData";
import NewReservation from "../modules/reservation/components/newReservation";

const page = async () => {
  const details = (await getRoomDetails()) || [];
  const businessInfo = await getBusinessInfo();

  return <NewReservation details={details} businessInfo={businessInfo} />;
};

export default page;
