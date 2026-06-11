import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("experience");

export const addExperience = service.addItem;
export const updateExperience = service.updateItem;
export const deleteExperience = service.deleteItem;
export const replaceExperience = service.replaceAll;
