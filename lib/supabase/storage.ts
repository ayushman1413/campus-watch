import { supabase } from "./supabaseClient";

export async function uploadItemImage(file: File) {
  const { data: { user } } = await supabase.auth.getUser();

  // unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
  const filePath = `items/${fileName}`;

  const { error } = await supabase.storage
    .from("item-images")
    .upload(filePath, file);

  if (error) throw error;

  // get public URL
  const { data } = supabase.storage
    .from("item-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
