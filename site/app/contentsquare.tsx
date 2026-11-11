"use client";
import { useEffect } from "react";
import { injectContentsquareScript } from "@contentsquare/tag-sdk";

/** Tag Contentsquare, chargé côté navigateur uniquement. */
export default function Contentsquare() {
  useEffect(() => {
    injectContentsquareScript({ clientId: "dd7b3cd13824e" });
  }, []);
  return null;
}
