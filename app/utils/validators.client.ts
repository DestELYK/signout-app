export const alphaValidator = (value?: string) => {
  if (/[^A-Z ]+/gi.test(value!)) {
    return "Invalid characters used in name";
  }
};

export const specialValidator = (value?: string) => {
  if (/[^A-Z0-9 ]+/gi.test(value!)) {
    return "Invalid characters used in name";
  }
};

export const qrCodeValidator = (value?: string) => {
  if (/[^A-Z0-9-]+/gi.test(value!)) {
    return "Invalid characters used in QR code";
  }
};

export const tagValidator = (value?: {id: number, name: string, color: string}[]) => {
    if (value?.length == 0) {
        return "Need at least 1 tag";
    }
}