type JwtPayload = {
    exp?: number;
};

export function getStoredAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access");
}

export function clearStoredAuthTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
}

function parseJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const json = typeof window !== "undefined"
            ? window.atob(padded)
            : Buffer.from(padded, "base64").toString("utf8");
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

export function hasValidAccessToken() {
    const token = getStoredAccessToken();
    if (!token) return false;

    const payload = parseJwtPayload(token);
    if (!payload?.exp) {
        clearStoredAuthTokens();
        return false;
    }

    const isExpired = payload.exp * 1000 <= Date.now();
    if (isExpired) {
        clearStoredAuthTokens();
        return false;
    }

    return true;
}
