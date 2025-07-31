import { View, Text } from 'react-native';

export function ToiletMarker({ isSelected }: { isSelected: boolean }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected ? '#10b981' : '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4b5563',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text style={{ fontSize: 20 }}>🚽</Text>
    </View>
  );
}
  