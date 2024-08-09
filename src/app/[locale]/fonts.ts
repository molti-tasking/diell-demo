import { Radio_Canada } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
export const radioCanada = Radio_Canada({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-radio-canada",
});
