// Decodes a JWT's payload to read its `exp` claim, without pulling in a
// jwt-decode dependency — we only ever need this one field.
export function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(""),
      ),
    );

    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}
