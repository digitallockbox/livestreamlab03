/**
 * Founder Session Authentication Middleware
 * Ensures only authenticated founders can access protected routes
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.livestreamlab.live";

export async function requireFounderSession() {
  try {
    // Check if user has valid founder session
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      credentials: "include"
    });

    if (!response.ok) {
      // Session invalid or expired
      console.warn("Founder session not found or expired");
      // Redirect to login (handled by component)
      return false;
    }

    const session = await response.json();
    
    if (!session.founder) {
      console.warn("User is not a founder");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Session verification failed:", error);
    return false;
  }
}

/**
 * Verify that a user has founder role
 */
export async function isFounder() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      credentials: "include"
    });

    if (!response.ok) return false;

    const session = await response.json();
    return session.founder === true;
  } catch (error) {
    console.error("Founder check failed:", error);
    return false;
  }
}

/**
 * Get current founder session data
 */
export async function getFounderSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      credentials: "include"
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Failed to get founder session:", error);
    return null;
  }
}
