import { supabase } from "../../../shared/services/supabase";

export function createJsonbService(field) {
  const getField = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(field)
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data?.[field] || [];
  };

  const setField = async (userId, items) => {
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: items })
      .eq("id", userId);
    if (error) throw error;
  };

  return {
    async addItem(userId, item) {
      const items = await getField(userId);
      items.push(item);
      await setField(userId, items);
    },

    async updateItem(userId, index, item) {
      const items = await getField(userId);
      items[index] = item;
      await setField(userId, items);
    },

    async deleteItem(userId, index) {
      const items = await getField(userId);
      items.splice(index, 1);
      await setField(userId, items);
    },

    async replaceAll(userId, items) {
      await setField(userId, items);
    },
  };
}
