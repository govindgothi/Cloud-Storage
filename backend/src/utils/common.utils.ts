import crypto from 'crypto';

export const generateSixDigitCode = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const generateRandomUUId = ():string =>{
  return crypto.randomUUID()
}


export const getFileExtension = (filename: string): string | null => {
  const lastDotIndex = filename.lastIndexOf(".");

  if (
    lastDotIndex <= 0 ||                 // no dot or hidden file
    lastDotIndex === filename.length - 1 // filename ends with dot
  ) {
    return null;
  }

  return filename.substring(lastDotIndex + 1);
}