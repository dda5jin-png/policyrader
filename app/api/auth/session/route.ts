import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/session";

export async function GET() {
  const authState = await getAuthState();

  return NextResponse.json(authState, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
