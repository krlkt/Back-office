export const convertFileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const stringResult = reader.result
        ?.toString()
        .replace('data:', '')
        .replace(/^.+,/, '');
      if (!stringResult) {
        reject(new Error('Failed to read file'));
        return;
      }
      resolve(stringResult);
    };

    reader.onerror = (error) => reject(error);
  });

export const convertBase64ToPngSrc = (base64: string) => {
  return `data:image/png;base64, ${base64}`;
};
