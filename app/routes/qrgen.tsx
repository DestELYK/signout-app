// @ts-ignore
import { useEffect, useState } from "react";
import { QRCode } from "react-qr-code";
import { ItemFormValues, getItems } from "~/lib/test-data";

export default function Page() {
  const [items, setItems] = useState<ItemFormValues[]>([]);

  useEffect(() => {
    getItems().then((items) => {
      setItems(items);
    });
  }, []);

  return (
    <div>
      {items.map((item) =>
        item && item.qrCode ? (
          <div
            style={{
              height: "auto",
              margin: "0 auto",
              maxWidth: 64,
              width: "100%",
            }}
          >
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={item.qrCode.toString()}
            />
          </div>
        ) : null
      )}
    </div>
  );
}
