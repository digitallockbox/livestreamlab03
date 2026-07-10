/**
 * Creator Storage Engine — Module F
 *
 * Derives the full creator storage tree from a creator ID:
 *   creator_root        = /data/creators/<creatorId>/
 *   creator_videos      = .../videos/
 *   creator_thumbnails   = .../thumbnails/
 *   creator_autosplit    = .../autosplit/
 *   creator_token        = .../token/
 *   creator_metadata     = .../metadata/
 *
 * On the backend, login provisions these folders automatically.
 * The frontend uses these paths for upload routing and integrity checks.
 *
 * This module is pure — it computes paths from a creator ID. The actual
 * folder provisioning happens server-side on login.
 */

const CREATOR_STORAGE_ROOT = "/data/creators";

/**
 * Storage subdirectories under the creator root.
 */
export const STORAGE_DIRS = [
  "videos",
  "thumbnails",
  "autosplit",
  "token",
  "metadata",
];

/**
 * Root path for a creator's storage tree.
 */
export function getCreatorStorageRoot(creatorId) {
  return `${CREATOR_STORAGE_ROOT}/${creatorId}`;
}

/**
 * Full storage tree — all paths derived from the creator ID.
 */
export function getCreatorStorageTree(creatorId) {
  const root = getCreatorStorageRoot(creatorId);
  const tree = { creator_root: root };
  for (const dir of STORAGE_DIRS) {
    tree[`creator_${dir}`] = `${root}/${dir}`;
  }
  return tree;
}

/**
 * Build an upload payload for the creator upload endpoint.
 * The backend writes the file to the creator's video namespace.
 */
export function buildUploadPayload(filename, base64Data, subdir = "videos") {
  return {
    filename,
    data: base64Data,
    subdir,
  };
}

/**
 * Expected storage keys for an integrity check — returns the list
 * of storage keys that should exist after provisioning.
 */
export function getExpectedStorageKeys() {
  return ["creator_root", ...STORAGE_DIRS.map((d) => `creator_${d}`)];
}

/**
 * Check a returned storage object against expected keys.
 * Returns { ok, missing } where missing is an array of missing keys.
 */
export function checkStorageIntegrity(storage) {
  const expected = getExpectedStorageKeys();
  const missing = expected.filter((key) => !storage || !storage[key]);
  return { ok: missing.length === 0, missing };
}