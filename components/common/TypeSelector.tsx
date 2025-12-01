import { useState } from "react";
import { Pressable, View, Text } from "react-native";

const TypeSelector = () => {
  const [type, setType] = useState<"expense" | "income">("income");

  return (
    <View className="flex-row m-4 bg-blue-300 rounded-xl overflow-hidden">
      <Pressable
        className={`flex-1 items-center py-3 rounded-2xl ${
          type === "expense" ? "bg-[#6194F2]" : "bg-blue-300"
        } active:opacity-70`}
        onPress={() => setType("expense")}
      >
        <Text
          className={`text-xl font-bold ${
            type === "expense" ? "text-white text-xl" : "text-white"
          }`}
        >
          Gastos
        </Text>
      </Pressable>
      <Pressable
        className={`flex-1 items-center py-3 rounded-2xl ${
          type === "income" ? "bg-[#6194F2]" : "bg-blue-300"
        } active:opacity-70`}
        onPress={() => setType("income")}
      >
        <Text
          className={`text-xl font-bold ${
            type === "income" ? "text-white text-xl" : "text-white"
          }`}
        >
          Ingresos
        </Text>
      </Pressable>
    </View>
  );
};

export default TypeSelector;
