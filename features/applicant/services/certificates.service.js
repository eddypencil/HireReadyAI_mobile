import { createJsonbService } from "./jsonb-crud.service";

const service = createJsonbService("certificates");

export const addCertificate = service.addItem;
export const updateCertificate = service.updateItem;
export const deleteCertificate = service.deleteItem;
export const replaceCertificates = service.replaceAll;
