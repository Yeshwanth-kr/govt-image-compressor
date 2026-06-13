export const PORTAL_PRESETS = {
  ssc_photo: {
    name: "SSC Photo (CGL, CHSL, JE)",
    targetSizeKb: 50,
    width: 200,
    height: 230,
    description: "Strictly 20KB - 50KB, JPEG only. Clear background."
  },
  ssc_signature: {
    name: "SSC Signature",
    targetSizeKb: 20,
    width: 140,
    height: 60,
    description: "Strictly 10KB - 20KB. Black or blue ink."
  },
  upsc_photo: {
    name: "UPSC Photo (IAS, NDA, CDS)",
    targetSizeKb: 300,
    width: 350,
    height: 350,
    description: "Must be 20KB - 300KB. Dimensions must match exactly."
  },
  upsc_signature: {
    name: "UPSC Signature",
    targetSizeKb: 300,
    width: 350,
    height: 350,
    description: "Must be 20KB - 300KB. Clear white background."
  },
  ibps_photo: {
    name: "Banking Photo (IBPS, SBI PO/Clerk)",
    targetSizeKb: 50,
    width: 200,
    height: 230,
    description: "Strictly 20KB - 50KB. Crisp resolution."
  },
  ibps_signature: {
    name: "Banking Signature (IBPS, SBI)",
    targetSizeKb: 20,
    width: 140,
    height: 60,
    description: "Strictly 10KB - 20KB. White paper, black ink."
  },
  pan_card: {
    name: "NSDL / UTIITSL NSDL PAN Card Photo",
    targetSizeKb: 50,
    width: 211,
    height: 211,
    description: "Strictly 211 x 211 pixels, under 50KB."
  },
  driving_license: {
    name: "Sarathi Parivahan Driving License/LL",
    targetSizeKb: 20,
    width: 420,
    height: 525,
    description: "Strictly under 20KB for photo/signature."
  }
};