import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // Vercel 배포 환경에서는 브라우저의 현재 도메인을 사용하고, 환경 변수가 있으면 이를 우선합니다.
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000")
});
