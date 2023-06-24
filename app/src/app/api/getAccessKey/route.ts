import forKey from "@/lib/middleware/forKey";
import * as jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = forKey(
  async (
    req: Request,
    context: { params: any },
    signature: string,
    publicKey: string
  ) => {
    try {
      console.log(context, signature, publicKey);
      const accessKey = jwt.sign(
        { publicKey },
        process.env.NEXT_PUBLIC_SECRET as string
      );
      console.log("accessKey", accessKey);
      return NextResponse.json({ success: true, accessKey }, { status: 200 });
    } catch (error: any) {
      console.log(error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
);
