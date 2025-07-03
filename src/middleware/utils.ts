export const randomString = async (length: number, format = 'AlphaNumeric') => {
  // format AlphaNumeric=String+number, Special=AlphaNumeric+Special characters
  length = Math.max(1, Math.min(1024, length));
  let result = '';
  const characters1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characters2 = '@ABCDEFGHIJKLMNOPQRSTUVWXYZ-*^abcdefghijklmnopqrstuvwxyz0123456789!$_';
  const characters = format?.substring(0, 1).toUpperCase() == 'S' ? characters2 : characters1;
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
