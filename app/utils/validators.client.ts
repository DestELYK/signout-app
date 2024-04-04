export const nameValidator = (value?: string) => {
  if (!value || value.length === 0) {
    return "Name cannot be blank";
  } else if (!/[A-Z ]+/gi.test(value!)) {
    return "Invalid characters used in name";
  }
};

export const qrCodeValidator = (value?: string) => {
  if (!/[A-Z0-9-]+/gi.test(value!)) {
    return "Invalid characters used in QR code";
  }
};

export const tagValidator = (value?: {id: number, name: string, color: string}[]) => {
    if (value?.length == 0) {
        return "Need at least 1 tag";
    }
}