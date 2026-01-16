"use client";

import MrBenRedesignPreview from "./MrBenRedesignPreview";

export default function Page() {
  return (
    <>
      <MrBenRedesignPreview />
      <div
        style={{
          position: "fixed",
          bottom: 8,
          right: 8,
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        BUILD_STAMP: 6c8aa20
      </div>
    </>
  );
}
