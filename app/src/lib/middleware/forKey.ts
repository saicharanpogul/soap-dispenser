import { NextResponse } from "next/server";
import { isSignatureAuthenticated } from "../auth";

const forKey = (handler: any) => {
  return async (req: Request) => {
    try {
      const body = await req.json();
      const { publicKey } = body;
      console.log(body);
      if (!req.headers.get("signature")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid signature.",
          },
          { status: 401 }
        );
      }
      // @ts-ignore
      if (!body!.publicKey) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid public key.",
          },
          { status: 401 }
        );
      }
      const signature = req.headers.get("signature");
      const isVerified = isSignatureAuthenticated(
        signature as string,
        publicKey
      );
      if (!isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Signature verification failed.",
          },
          { status: 401 }
        );
      }
      return handler(req, {}, signature, publicKey);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized.",
        },
        { status: 401 }
      );
    }
  };
};
export default forKey;
