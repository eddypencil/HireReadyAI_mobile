import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../../../shared/services/supabase";

const BUCKET = "company_logos";

async function uploadFile(companyId, folder, fileUri) {
  const ext = fileUri.split(".").pop() || "jpg";
  const fileName = `${folder}/${companyId}-${Date.now()}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, byteArray, { upsert: true, contentType: `image/${ext}` });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return urlData.publicUrl;
}

export function uploadLogo(companyId, fileUri) {
  return uploadFile(companyId, "company_logos", fileUri);
}

export function uploadCover(companyId, fileUri) {
  return uploadFile(companyId, "company_covers", fileUri);
}
