import qs from 'query-string';
import {
    CurrentcyPositions,
    DATE_FORMAT_DISPLAY,
    DATE_SHORT_MONTH_FORMAT,
    DEFAULT_FORMAT,
    DEFAULT_TABLE_ITEM_SIZE,
    THEMES,
    apiUrl,
} from '@constants';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import CryptoJS from 'crypto-js';
import pako from 'pako';
import forge from 'node-forge';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';

export const convertGlobImportToObject = (modules) =>
    modules
        .filter((module) => !!module.default)
        .reduce(
            (rs, cur) => ({
                ...rs,
                [cur.default.name]: cur.default,
            }),
            {},
        );

export const convertGlobImportToArray = (modules) =>
    modules.filter((module) => !!module.default).map((module) => module.default);

export const destructCamelCaseString = (string) => {
    const arrString = [...string];
    const newArrString = [];
    arrString.forEach((char, index) => {
        if (char.charCodeAt(0) > 90) {
            newArrString.push(char);
        } else {
            index && newArrString.push('-');
            newArrString.push(char.toLowerCase());
        }
    });
    return newArrString.join('');
};

export const convertUtcToLocalTime = (utcTime, inputFormat = DATE_FORMAT_DISPLAY, format = DATE_FORMAT_DISPLAY) => {
    try {
        if (utcTime) 
        // return moment(moment.utc(utcTime, inputFormat).toDate()).format(format);
        {
            const parsedUtcTime = dayjs(utcTime, inputFormat);
    
            // Cộng thêm 7 giờ (tương ứng với múi giờ +7)
            const localTime = parsedUtcTime.add(7, 'hour');
            
            // Trả về thời gian đã được định dạng theo format yêu cầu
            return localTime.format(format);
        }
        return '';
    } catch (err) {
        return '';
    }
};
export function convertUtcToIso(date) {
    return dayjs(convertUtcToLocalTime(date, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT);
}

export const getBrowserTheme = () => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDark ? THEMES.DARK : THEMES.LIGHT;
};

export const makeURL = (baseURL, params, pathParams) => {
    for (let key of Object.keys(pathParams || {})) {
        const keyCompare = `:${key}`;
        if (baseURL.indexOf(keyCompare) !== -1) {
            baseURL = baseURL.replace(keyCompare, pathParams[key]);
        }
    }

    if (params) {
        baseURL = baseURL + '?' + qs.stringify(params);
    }

    return baseURL;
};

export const parseURL = (url) => {
    try {
        return new URL(url);
    } catch (error) {
        return '';
    }
};

export const getYTEmbedLinkFromYTWatchLink = (watchLink) => {
    if (!watchLink) {
        return '';
    }

    const { v } = qs.parse(parseURL(watchLink).search);
    return v ? `https://www.youtube.com/embed/${v}?autoplay=1&mute=1` : watchLink;
};

export const getYoutubeVideoID = (url) => {
    let pattern = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
    return pattern.exec(url)?.[3];
};

export const formatNumber = (value, setting) => {
    if (value) {
        const decimalPosition = value.toString().indexOf('.');
        if (decimalPosition > 0) {
            const intVal = value.toString().substring(0, decimalPosition);
            const decimalVal = value.toString().substring(decimalPosition + 1);
            return `${intVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimalVal}`;
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (value === 0) return 0;
    return '';
};

export const formatDateString = (dateString, formatDate = DATE_SHORT_MONTH_FORMAT) => {
    return dayjs(dateString).format(formatDate);
};

export const removeAccents = (str) => {
    if (str)
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    return str;
};

export const validateUsernameForm = (rule, username) => {
    return /^[a-z0-9_]+$/.exec(username)
        ? Promise.resolve()
        : Promise.reject('Username chỉ bao gồm các ký tự a-z, 0-9, _');
};

export const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

export function ensureArray(value) {
    if (value === null || value === undefined) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return [value];
}

export const removePathParams = (paths) => {
    return ensureArray(paths).map((path) => {
        if (typeof path !== 'string') return path;
        return path.replaceAll(/\/:[a-zA-Z]+/g, '');
    });
};

export const validatePermission = (
    requiredPermissions = [],
    userPermissions = [],
    requiredKind,
    excludeKind = [],
    userKind,
    profile,
    path,
    separate,
) => {
    if (ensureArray(excludeKind).length > 0) {
        if (ensureArray(excludeKind).some((kind) => kind == userKind)) return false;
    }
    if (requiredKind) {
        if (requiredKind !== userKind) return false;
    }
    if (!requiredPermissions || requiredPermissions?.length == 0) return true;
    let permissionsSavePage = [];
    if (separate && requiredPermissions.length > 0) {
        permissionsSavePage.push(path?.type === 'create' ? requiredPermissions[0] : requiredPermissions[1]);
    } else {
        permissionsSavePage = requiredPermissions;
    }
    return removePathParams(permissionsSavePage).every((item) => userPermissions?.includes(item?.replace(apiUrl, '/')));
};

export function generatePassword(options) {
    const { length, numbers, uppercase, lowercase, symbols, strict } = options;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    let validChars = '';

    if (uppercase) {
        validChars += uppercaseChars;
    }
    if (lowercase) {
        validChars += lowercaseChars;
    }
    if (numbers) {
        validChars += numberChars;
    }
    if (symbols) {
        validChars += symbolChars;
    }

    if (validChars.length === 0) {
        throw new Error('At least one character type should be selected.');
    }

    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * validChars.length);
        password += validChars.charAt(randomIndex);
    }

    if (strict) {
        // Ensure at least one character of each type is present
        if (uppercase && !/[A-Z]/.test(password)) {
            return generatePassword(options);
        }
        if (lowercase && !/[a-z]/.test(password)) {
            return generatePassword(options);
        }
        if (numbers && !/\d/.test(password)) {
            return generatePassword(options);
        }
        if (symbols && !/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(password)) {
            return generatePassword(options);
        }
    }

    return password;
}
export function copyToClipboard1(text) {
    var textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
}

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const formatMoney = (value, setting = {}) => {
    if ((value || value === 0) && !isNaN(value)) {
        const groupSeparator = setting.groupSeparator || '.';
        const decimalSeparator = setting.decimalSeparator || ',';
        const currentcy = setting.currentcy || 'đ';
        const currentcyPosition = setting.currentcyPosition || CurrentcyPositions.BACK;
        value = setting.currentDecimal ? (+value).toFixed(setting.currentDecimal) : (+value).toFixed(2);
        // value = (+value).toFixed(0);
        const decimalPosition = value.toString().indexOf('.');
        if (decimalPosition > 0) {
            const intVal = value.toString().substring(0, decimalPosition);
            const decimalVal = value.toString().substring(decimalPosition + 1);
            value = `${intVal.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)}${decimalSeparator}${decimalVal}`;
        } else {
            value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
        }
        if (currentcyPosition === CurrentcyPositions.FRONT) {
            return `${currentcy} ${value}`;
        } else {
            return `${value} ${currentcy}`;
        }
    }
    return '';
};

export const priceValue = (value) => {
    return formatMoney(value, {
        groupSeparator: ',',
        currencySymbol: 'đ',
        currentcyPosition: 'BACK',
        currentDecimal: '0',
    });
};

export const encryptValue = (secretKey, inputStr) => {
    try {
        // Parse the secret key
        const key = CryptoJS.enc.Utf8.parse(secretKey);

        // Encrypt the input string
        const encrypted = CryptoJS.AES.encrypt(inputStr, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        const encryptedBase64 = encrypted.toString();
        return encryptedBase64;

    } catch (error) {
        console.error(error);
    }
    return null;
};

export const decryptValue = (secretKey, encryptedStr) => {
    try {
        let decrypted = CryptoJS.AES.decrypt(encryptedStr, CryptoJS.enc.Utf8.parse(secretKey), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        return decryptedText;
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const encryptRSA = (publicKeyStr, data) => {
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyStr
        .match(/.{1,64}/g)
        .join('\n')}\n-----END PUBLIC KEY-----`;
    try {
        const publicKey = forge.pki.publicKeyFromPem(formatPemPrivateKey(publicKeyPem));
        const encryptedBytes = publicKey.encrypt(data, 'RSAES-PKCS1-V1_5');
        return forge.util.encode64(encryptedBytes);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const decryptRSA = (privateKeyStr, encryptedData) => {
    // const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyStr
    //     .match(/.{1,64}/g)
    //     .join('\n')}\n-----END PRIVATE KEY-----`;
    try {
        const privateKey = forge.pki.privateKeyFromPem(formatPemPrivateKey(privateKeyStr));
        const decryptedBytes = privateKey.decrypt(forge.util.decode64(encryptedData), 'RSAES-PKCS1-V1_5');
        return decryptedBytes;
    } catch (error) {
        console.error('error decryptRSA: ', error);
        return null;
    }
};

export const orderNumber = (pagination, index, size = DEFAULT_TABLE_ITEM_SIZE) => {
    const page = pagination?.current ? pagination.current - 1 : 1;
    return page * size + (index + 1);
};

export const sortArray = (data, name) => {
    const sortedDataCustom = data.sort((a, b) => b[name] - a[name]);
    return sortedDataCustom;
};

const formatPemPrivateKey = (privateKeyStr) => {
    const hasPemHeader = privateKeyStr.includes('-----BEGIN PRIVATE KEY-----');
    const hasPemFooter = privateKeyStr.includes('-----END PRIVATE KEY-----');

    if (!hasPemHeader || !hasPemFooter) {
        const base64Key = privateKeyStr.replace(/\n|\r/g, '');
        const formattedKey = base64Key.match(/.{1,64}/g).join('\n');
        return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }
    return privateKeyStr;
};

export const removePemFormat = (privateKeyStr) => {
    const hasPemHeader = privateKeyStr.includes('-----BEGIN PRIVATE KEY-----');
    const hasPemFooter = privateKeyStr.includes('-----END PRIVATE KEY-----');

    let cleanedKeyStr = privateKeyStr;

    if (hasPemHeader && hasPemFooter) {
        cleanedKeyStr = cleanedKeyStr
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .trim();
    }

    return cleanedKeyStr;
};

export const formatDateLocalToUtc = (dueDate, formatDate = DEFAULT_FORMAT, lastDay = true) => {
    const dueDateWithTime = dayjs(dueDate).set('hour', 0).set('minute', 0).set('second', 0);

    // const dueDateInUTC = dueDateWithTime.utc();
    const dueDateMinus7Hours = lastDay ? dueDateWithTime.subtract(7, 'hours') : dueDate.subtract(7, 'hours');

    const formattedDueDateInUTC = dueDateMinus7Hours.format(formatDate);
    return formattedDueDateInUTC;
};

export const beforeUpload = (file) => {
    const maxFileSize = 2 * 1024 * 1024; // Giới hạn là 2MB
    const formatFile = [ 'png','jpg','jpeg','jfif' ];
    const lastDotIndex = file.name.lastIndexOf('.');

    const fileExtension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex + 1) : '';
    console.log(fileExtension);
    if (!formatFile.includes(fileExtension)) {
        showErrorMessage('Sai định dạng file!');
        return false;
    }
    if (file.size > maxFileSize) {
        // Hiển thị thông báo lỗi nếu file vượt quá kích thước giới hạn
        showErrorMessage('File phải nhỏ hơn 2MB!');
        return false;
    }
    return true;
};

export const copyToClipboard = (text) => {
    const dataToCopy = !!text;
    if (dataToCopy) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showSucsessMessage('Text copied to clipboard');
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
                showErrorMessage('Failed to copy text');
            });
    } else showErrorMessage('There is no data to copy !');
};

export const innerHeight = window.innerHeight;

export const formatMoneyValue = (value, currentcy = 'đ', groupSeparator = ',', decimalSeparator = '.') => {
    return formatMoney(value ? value : 0, {
        groupSeparator: groupSeparator,
        decimalSeparator: decimalSeparator,
        currentcy: currentcy,
        currentDecimal: '0',
    });
};

export const sumMoney = (data, kind) => {
    const totalAmount = data?.reduce((accumulator, item) => {
        if (item?.kind === kind) return accumulator + Number(item.money);
        else return accumulator;
    }, 0);

    return totalAmount;
};

export const validCheckFields = (fieldsToSet) => {
    const validFields = Object.fromEntries(
        Object.entries(fieldsToSet).filter(([_, value]) => value !== null && value !== undefined),
    );
    const checkValue = Object.keys(validFields).length > 0 ? validFields : false;
    return checkValue;
};

export function limitCharacters(value, numOfCharacters) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    if (value?.length <= numOfCharacters) {
        return value; // Trả về chuỗi không thay đổi nếu số ký tự nhỏ hơn hoặc bằng numOfCharacters
    } else {
        return value.slice(0, numOfCharacters) + '...'; // Trả về một phần của chuỗi với số ký tự được giới hạn
    }
}

export function generateColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`; // Đảm bảo mã màu có 6 ký tự
}

