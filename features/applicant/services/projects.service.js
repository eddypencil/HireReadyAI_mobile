import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("projects");

export const addProject = service.addItem;
export const updateProject = service.updateItem;
export const deleteProject = service.deleteItem;
export const replaceProjects = service.replaceAll;
