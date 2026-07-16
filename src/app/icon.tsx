import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: 9999,
            backgroundColor: "#010a13",
            backgroundImage:
              "linear-gradient(135deg, #010a13 0%, #0a1428 100%)",
            border: "2px solid #c89b3c",
            color: "#f0e6d2",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          D
        </div>
      </div>
    ),
    { ...size }
  );
}
