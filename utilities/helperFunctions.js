export const generateRandom4DigitNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

export const removeSpecialCharacters = (str) => {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
}