import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "DJADULS — Khairul Baharuddin, The Full-Stack Vanguard, Software Engineer";

const CORNER = 40;
const CORNER_SIZE = 44;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "#010a13",
          backgroundImage:
            "linear-gradient(135deg, #010a13 0%, #0a1428 55%, #010a13 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: CORNER,
            left: CORNER,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderTop: "3px solid #c89b3c",
            borderLeft: "3px solid #c89b3c",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: CORNER,
            right: CORNER,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderTop: "3px solid #c89b3c",
            borderRight: "3px solid #c89b3c",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: CORNER,
            left: CORNER,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderBottom: "3px solid #c89b3c",
            borderLeft: "3px solid #c89b3c",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: CORNER,
            right: CORNER,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderBottom: "3px solid #c89b3c",
            borderRight: "3px solid #c89b3c",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#0bc4e3",
          }}
        >
          Software Engineer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 130,
            fontWeight: 700,
            color: "#f0e6d2",
            letterSpacing: 4,
            marginTop: 14,
          }}
        >
          DJADULS
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#c89b3c",
            letterSpacing: 6,
            marginTop: 8,
          }}
        >
          Khairul Baharuddin
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#cdbe91",
            marginTop: 20,
          }}
        >
          The Full-Stack Vanguard
        </div>
      </div>
    ),
    { ...size }
  );
}
