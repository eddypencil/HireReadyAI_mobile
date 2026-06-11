import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("languages");

export const addLanguage = service.addItem;
export const updateLanguage = service.updateItem;
export const deleteLanguage = service.deleteItem;
export const replaceLanguages = service.replaceAll;
