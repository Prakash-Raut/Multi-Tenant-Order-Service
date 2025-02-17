import config from "config";
import type { Request } from "express";
import { type GetVerificationKey, expressjwt } from "express-jwt";
import type { Jwt } from "jsonwebtoken";
import jwksClient, { type SigningKey } from "jwks-rsa";
import type { AuthCookie } from "../types";

const client = jwksClient({
	jwksUri: config.get("auth.jwksUri"),
	cache: true,
	rateLimit: true,
	requestHeaders: {}, // Optional
	timeout: 30000, // Defaults to 30s
});

// Function to get the signing key
const getKey: GetVerificationKey = async (req: Request, token?: Jwt) => {
	if (!token?.header.kid) {
		throw new Error("No 'kid' found in token header");
	}

	const key: SigningKey = await client.getSigningKey(token.header.kid);
	const publicKey = key.getPublicKey();

	if (!publicKey) {
		throw new Error("Public key is undefined");
	}

	return publicKey;
};

const getTokenFromHeaderOrQuerystring = (req: Request) => {
	const authHeader = req.headers.authorization;

	// Bearer
	if (authHeader && authHeader.split(" ")[1] !== "undefined") {
		const token = authHeader.split(" ")[1];
		if (token) {
			return token;
		}
	} else if (req.query?.token) {
		return req.query.token as string;
	}

	const { accessToken } = req.cookies as AuthCookie;
	return accessToken;
};

export default expressjwt({
	secret: getKey,
	algorithms: ["RS256"],
	getToken: getTokenFromHeaderOrQuerystring,
});
