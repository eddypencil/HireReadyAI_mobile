import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("education");

export const addEducation = service.addItem;
export const updateEducation = service.updateItem;
export const deleteEducation = service.deleteItem;
export const replaceEducation = service.replaceAll;
