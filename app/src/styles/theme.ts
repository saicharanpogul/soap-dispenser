"use client";
import { extendTheme } from "@chakra-ui/react";
import { Poppins } from "next/font/google";
import Button from "./components/button";
import Modal from "./components/modal";
import Popover from "./components/popover";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  fallback: ["Poppins"],
});

export const colors = {
  primary: {
    500: "#7FF4BC",
  },
  secondary: {},
  background: {
    100: "#1B1E23",
    500: "#37383F",
    900: "#0a0a0a",
  },
  error: {
    100: "#160705",
    500: "#EA4F30",
    900: "#FAEDEA",
  },
  warning: {
    100: "#170F02",
    500: "#F0AD2D",
    900: "#FDF4E7",
  },
  success: {
    100: "#091108",
    500: "#1EB871",
    900: "#EFF7EE",
  },
  text: {
    100: "#000000",
    500: "#C4C4C4",
    900: "#FFFFFF",
  },
  transparent: {
    main: "rgba(0, 0, 0, 0.5)",
    dark: "rgba(0, 0, 0, 0.7)",
  },
};

export const theme = extendTheme({
  components: {
    Button,
    Modal,
    Popover,
  },
  colors,
  styles: {
    global: () => ({
      "*, *::before, *::after": {
        WebkitTapHighlightColor: "transparent",
      },
      body: {
        bg: "background.900",
      },
    }),
  },
  fonts: {
    body: poppins.style.fontFamily,
    heading: poppins.style.fontFamily,
  },
});
