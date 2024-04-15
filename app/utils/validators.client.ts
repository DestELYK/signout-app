import { isColorValid } from "@mantine/core";

export const blankValueValidator = (value?: string) => {
  if (!value || value.length === 0) {
    return "Field cannot be blank";
  }
};

export const personNameValidator = (value: string) => {
  if (/[^A-Z ]+/gi.test(value)) {
    return "Invalid characters used in name";
  }
};

export const itemNameValidator = (value: string) => {
  if (/[^A-Z0-9- ]+/gi.test(value)) {
    return "Invalid characters used in name";
  }
};

export const itemDescriptionValidator = (value: string, limit: number = 50) => {
  if (limit != 0 && value.length > limit) {
    return `Item description is over the limit (${limit} characters)`;
  } else if (/[^A-Z0-9- ]+/gi.test(value!)) {
    return "Invalid characters used in description";
  }
};

export const qrCodeValidator = (value: string) => {
  if (/[^A-Z0-9-]+/gi.test(value)) {
    return "Invalid characters used in QR code";
  }
};

export const tagNameValidator = (value: string) => {
  if (/[^A-Z0-9- ]+/gi.test(value)) {
    return "Invalid characters used in tag name";
  }
};

export const tagCategoryValidator = (value: string) => {
  if (/[^A-Z ]+/gi.test(value)) {
    return "Invalid characters used in tag category";
  }
};

export const tagColorValidator = (value: string) => {
  if (!isColorValid(value)) {
    return "Invalid characters used";
  }
};
