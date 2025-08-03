import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export async function getOrSetRandomId(): Promise<string> {
    // Generate a random UUID to serve as the random value
    const storedMappings = await AsyncStorage.getItem('mlem');
    const mappings: Record<string, string> = storedMappings ? JSON.parse(storedMappings) : {};

    const existingKey = mappings['mlem'];
    if (existingKey) {
        return existingKey;
    }
    const randomValue = Crypto.randomUUID();

    mappings['mlem'] = randomValue;
    await AsyncStorage.setItem('mlem', JSON.stringify(mappings));

    return randomValue;
}

export const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    let interval = Math.floor(seconds / 31536000)
    if (interval > 1) return `${interval} years ago`
    if (interval === 1) return `1 year ago`

    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return `${interval} months ago`
    if (interval === 1) return `1 month ago`

    interval = Math.floor(seconds / 86400)
    if (interval > 1) return `${interval} days ago`
    if (interval === 1) return `1 day ago`

    interval = Math.floor(seconds / 3600)
    if (interval > 1) return `${interval} hours ago`
    if (interval === 1) return `1 hour ago`

    interval = Math.floor(seconds / 60)
    if (interval > 1) return `${interval} minutes ago`
    if (interval === 1) return `1 minute ago`

    return `${Math.floor(seconds)} seconds ago`
}

export function request<TResponse>(
    url: string,
    // `RequestInit` is a type for configuring
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {}

    // This function is async, it will return a Promise:
): Promise<TResponse> {
    // Inside, we call the `fetch` function with
    // a URL and config given:
    return (
        fetch(url, config)
            // When got a response call a `json` method on it
            .then((response) => response.json())
            // and return the result data.
            .then((data) => data as TResponse)
    );

    // We also can use some post-response
    // data-transformations in the last `then` clause.
}
