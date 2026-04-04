import { auth } from "@/lib/auth";
import { toNextResponse } from "better-auth/next-api";

export const GET = async (req: Request) => {
    return await terrorToNextResponse(auth.handler(req));
};

export const POST = async (req: Request) => {
    return await terrorToNextResponse(auth.handler(req));
};

// better-auth의 helper 함수가 toNextResponse인데, 타입 이슈 등이 있을 수 있으므로 직접 구현하거나 래핑합니다.
async function terrorToNextResponse(res: any) {
    return toNextResponse(res);
}
