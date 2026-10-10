import type { FastifyReply, FastifyRequest } from "fastify";
import { SignJWT, jwtVerify } from "jose";
import { ROLE_RANK, type RoleName } from "../lib/context.js";
import { forbidden, unauthorized } from "../lib/errors.js";
import type { Config } from "../config.js";
import { eq } from "drizzle-orm";
import { schema } from "../db/client.js";

const ISSUER = "sakasuru-api";

export async function signAccessToken(config: Config, userId: string, role: RoleName, sessionId: string) {
  return new SignJWT({ role, sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${config.ACCESS_TOKEN_TTL_MIN}m`)
    .sign(new TextEncoder().encode(config.JWT_SECRET));
}

export async function verifyAccessToken(config: Config, token: string) {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.JWT_SECRET), { issuer: ISSUER, algorithms: ["HS256"] });
  return { userId: String(payload.sub), role: payload.role as RoleName, sessionId: payload.sid as string | undefined };
}

/** preHandler: require a valid Bearer access token. */
export async function authenticate(req: FastifyRequest, _reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw unauthorized();
  try {
    req.auth = await verifyAccessToken(req.server.ctx.config, header.slice(7));
  } catch {
    throw unauthorized("token_invalid");
  }
}

/** preHandler factory: require at least the given role (RBAC hierarchy). */
export function requireRole(min: RoleName) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth) await authenticate(req, reply);
    // Re-read the role from the database so revoked privileges take effect immediately.
    const [row] = await req.server.ctx.db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, req.auth!.userId));
    if (!row) throw unauthorized();
    const role = row.role as RoleName;
    req.auth!.role = role;
    if ((ROLE_RANK[role] ?? 0) < ROLE_RANK[min]) throw forbidden();
  };
}
