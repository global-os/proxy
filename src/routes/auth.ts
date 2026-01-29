import { Hono } from "hono";
import { auth } from "../auth.js";

export type AuthType = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export function createRouter() {
  return new Hono<{ Bindings: AuthType }>({
    strict: false,
  });
}

const router = createRouter();

router.on(["POST", "GET"], "/*", (c) => {
  console.log('auth handler')
  return auth.handler(c.req.raw);
});

router.on(["POST", "GET"], "/**", (c) => {
  console.log('auth handler')
  return auth.handler(c.req.raw);
});

export default router;