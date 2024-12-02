import { secretKey } from '@constants';
import CryptoJS from 'crypto-js';

const encryptValue = (value) => {
    return CryptoJS.AES.encrypt(value, secretKey).toString();
};

const decryptValue = (encryptedValue) => {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const sessionStorageWrapper = {
    setItem(key, value) {
        sessionStorage.setItem(key, value);
        const event = new Event('sessionStorageChange');
        event.key = key;
        event.newValue = value;
        window.dispatchEvent(event);
    },
    getItem(key) {
        return sessionStorage.getItem(key);
    },
    removeItem(key) {
        sessionStorage.removeItem(key);
        const event = new Event('sessionStorageChange');
        event.key = key;
        event.newValue = null;
        window.dispatchEvent(event);
    },
};

export const setSessionStorageWithExpiry = (key, value, ttl) => {
    const now = new Date();

    // Thêm TTL (thời gian hết hạn)
    const item = {
        value: encryptValue(value),
        expiry: now.getTime() + ttl,
    };

    sessionStorageWrapper.setItem(key, JSON.stringify(item));
};

export const getSessionStorageWithExpiry = (key) => {
    const itemStr = sessionStorageWrapper.getItem(key);

    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
        sessionStorageWrapper.removeItem(key);
        return null;
    }

    return decryptValue(item.value);
};
