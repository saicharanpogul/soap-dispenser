import { getPathMetadata } from "@/constants/meta";
import { Metadata } from "next";
import Dispenser from "./page";

export async function generateMetadata(props: any): Promise<Metadata> {
  const meatdata = getPathMetadata("/");
  return meatdata;
}

export default Dispenser;
