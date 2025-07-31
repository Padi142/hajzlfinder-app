import { useQuery } from 'convex/react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { formatTimeAgo } from '~/app/lib/utils';
import { api } from '~/convex/_generated/api';
import { Doc, Id } from '~/convex/_generated/dataModel';

export const BottomSheetContent = ({ hajzlId }: { hajzlId: Id<'hajzle'> | null }) => {
  if (!hajzlId) return null;
  const hajzl = useQuery(api.hajzl.getRestroom, { id: hajzlId });
  const accessCodes =
    useQuery(api.hajzl.getAccessCodes, {
      restroomId: hajzlId,
    }) || [];

  const [isHajzlVoteLoading, setIsHajzlVoteLoading] = useState(false);

  return (
    <View className="min-h-screen-safe-offset-10 max-h-[80vh] gap-4 p-4 pb-6">
      <View className="flex-col gap-3">
        <Text className="pr-2 text-3xl font-bold leading-tight text-gray-900">{hajzl?.name}</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-6">
            <View className="flex-row items-center">
              <Text className="mr-2 text-lg font-medium text-gray-700">{hajzl?.upvotes ?? 0}</Text>
              <TouchableOpacity
                className={`rounded-full p-2 ${isHajzlVoteLoading ? 'opacity-50' : 'active:scale-95'}`}
                disabled={isHajzlVoteLoading}>
                <Text className="text-2xl">👍</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-lg font-medium text-gray-700">
                {hajzl?.downvotes ?? 0}
              </Text>
              <TouchableOpacity
                className={`rounded-full p-2 ${isHajzlVoteLoading ? 'opacity-50' : 'active:scale-95'}`}
                disabled={isHajzlVoteLoading}>
                <Text className="text-2xl">👎</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <Text className="text-base leading-relaxed text-gray-600">{hajzl?.description}</Text>

      {hajzl?.type === 'free' && (
        <View className="rounded-xl border border-green-200 bg-green-50 p-4">
          <Text className="mb-1 text-base font-semibold text-green-800">Přístup</Text>
          <Text className="text-base font-medium text-green-700">Zdarma</Text>
        </View>
      )}

      {hajzl?.type === 'paid' && (
        <View className="rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="mb-1 text-base font-semibold text-red-800">Přístup</Text>
          <Text className="text-base font-medium text-red-700">{hajzl?.price} Kč</Text>
        </View>
      )}

      {(hajzl?.type === 'code' || !hajzl?.type) && (
        <View className="">
          <Text className="mb-3 text-lg font-semibold text-gray-900">Přidané kódy</Text>
          <View className="max-h-full min-h-[120px]">
            {accessCodes.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                nestedScrollEnabled={false}
                bounces={true}
                contentContainerStyle={{ gap: 8 }}>
                {accessCodes.map((code) => (
                  <View className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="font-mono text-lg font-bold text-gray-900">
                        {code.code ?? 'Neznámý kód'}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {formatTimeAgo(code.createdAt || Date.now())}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <Text className="mr-2 text-sm font-medium text-gray-700">
                          {code.upvotes}
                        </Text>
                        <TouchableOpacity className="rounded p-1">
                          <Text className="text-lg">👍</Text>
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="mr-2 text-sm font-medium text-gray-700">
                          {code.downvotes}
                        </Text>
                        <TouchableOpacity className="rounded p-1">
                          <Text className="text-lg">👎</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-base text-gray-500">Žádné kódy zatím nebyly přidány</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className="border-t border-gray-100 pt-2">
        <Text className="text-sm text-gray-500">
          Přidáno{' '}
          {new Date(hajzl?.createdAt || Date.now()).toLocaleDateString('cs-CZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
};
