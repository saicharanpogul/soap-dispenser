import { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../auth";
import { NextResponse } from "next/server";

const withProtect = (handler: any) => {
  return async (req: Request) => {
    try {
      const body = await req.json();
      const { publicKey } = body;
      if (!req.headers.get("authorization")) {
        return NextResponse.json(
          {
            success: false,
            message: "Not authorized.",
          },
          { status: 401 }
        );
      }
      if (!req.headers.get("signature")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid signature.",
          },
          { status: 401 }
        );
      }
      if (!publicKey) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid public key.",
          },
          { status: 401 }
        );
      }
      const token = req.headers.get("authorization")?.split(" ")[1];
      const signature = req.headers.get("signature") as string;
      const isVerified = isAuthenticated(token as string, publicKey);
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
export default withProtect;
