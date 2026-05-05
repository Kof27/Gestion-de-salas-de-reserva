const API_BASE = "http://localhost:4000";

// Deduplication flag: prevents multiple toasts/redirects when several
// concurrent requests all return 401 at the same time.
let expiryHandled = false;

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

function buildHeaders(extra?: HeadersInit): Record<string, string> {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra as Record<string, string> | undefined),
    };
}

export async function apiFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const { headers: extraHeaders, ...rest } = options;

    const response = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers: buildHeaders(extraHeaders as HeadersInit | undefined),
    });

    if (response.status === 401 && !expiryHandled) {
        expiryHandled = true;
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.dispatchEvent(new CustomEvent("auth:expired"));
        }
        // Reset after 3 s to allow future auth errors to be reported
        setTimeout(() => {
            expiryHandled = false;
        }, 3000);
    }

    return response;
}
