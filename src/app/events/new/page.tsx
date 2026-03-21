import React from 'react'
import NewEvents from '../../modules/events/components/newEvents'
import { getEventMenuData, getEventMenuPackages, getEventSettings } from '../../modules/events/utils/eventsApi';
import { getBusinessInfo } from '@/app/modules/staff/utils/staffData';

const page = async () => {
  const menu = await getEventMenuData();
  const menuPackages = await getEventMenuPackages();
  const settings = await getEventSettings();
   const businessInfo = await getBusinessInfo();
  return (
    <NewEvents menu={menu} menuPackages={menuPackages} settings={settings} businessInfo={businessInfo} />
  )
}

export default page