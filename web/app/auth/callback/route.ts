import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
  returnPathname: "/command-center?session=refresh",
});
