import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("volunteering");

export const addVolunteering = service.addItem;
export const updateVolunteering = service.updateItem;
export const deleteVolunteering = service.deleteItem;
export const replaceVolunteering = service.replaceAll;
