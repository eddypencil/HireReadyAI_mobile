import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("skills");

export const addSkill = service.addItem;
export const updateSkill = service.updateItem;
export const deleteSkill = service.deleteItem;
export const replaceSkills = service.replaceAll;
