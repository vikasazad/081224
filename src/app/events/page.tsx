import React from 'react'
import Events from '../modules/events/components/events'
import { getEventMenuData, getEventMenuPackages, getEventSettings } from '../modules/events/utils/eventsApi';
import { getInventoryData } from '../modules/inventory/store/utils/InventoryApi';


export default async function page() {
  const menu = await getEventMenuData();
  const menuPackages = await getEventMenuPackages();
  const settings = await getEventSettings();
  const inventoryData:any = await getInventoryData();
  return (
    <Events menu={menu} menuPackages={menuPackages} settings={settings} inventory={inventoryData?.inventory?.store?.items || []} />
  )
}

