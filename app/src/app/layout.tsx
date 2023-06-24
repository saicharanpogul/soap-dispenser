import { getPathMetadata } from "@/constants/meta";
import { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  fallback: ["Poppins"],
});

export async function generateMetadata(props: any): Promise<Metadata> {
  const meatdata = getPathMetadata("/");
  return meatdata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
