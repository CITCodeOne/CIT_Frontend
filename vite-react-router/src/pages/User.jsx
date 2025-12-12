import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { normalizeDataUrl, setProfilePicture } from "../components/GetOrSetProfilePicture";
import { useParams } from "react-router-dom";
import UserBanner from "../components/UserBanner";
import useAuthStatus from "../hooks/useAuthStatus";
import { getStoredToken } from "../components/extractJwtData";

// Adapts backend DTO (id, name, email, time, profileImage, …) to the shape the UI consumes.
const normalizeUserPayload = (payload) => {
  if (!payload) return null; // Guard against empty responses.

  return {
    ...payload,
    uid: payload.id ? String(payload.id) : "",
    user_name: payload.name ?? "",
    email: payload.email ?? "",
    createdAt: payload.time ?? "",
    profile_image: payload.profileImage ?? "",
    ratingsCount: payload.ratingsCount ?? 0,
    bookmarksCount: payload.bookmarksCount ?? 0,
    role: payload.role ?? "",
  };
};
export default function User() {
  const { userId: routeUserId } = useParams(); // `/user/:userId` parameter.
  const authDetails = useAuthStatus(); // Snapshot of current auth state.
  const { isSignedIn, userId: authUserId } = authDetails; // Destructure for easier use.

  // Tracks latest user profile plus loading and edit state.
  const [userData, setUserData] = useState(null); // Normalized payload.
  const [loading, setLoading] = useState(true); // Spinner toggle.
  const [errorMessage, setErrorMessage] = useState(null); // Friendly error text.
  const [isEditMode, setIsEditMode] = useState(false); // Client-side edit toggle.

  // Local preview file handling for avatar uploads.
  const fileInputRef = useRef(null); // Hidden file input element.
  const imageObjectUrlRef = useRef(null); // Stores current blob URL in use.
  const [profileImageOverride, setProfileImageOverride] = useState(null); // Blob preview URL.

  // Releases any blob URLs created for preview when no longer needed.
  const clearProfileImageOverride = useCallback(() => {
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }
    setProfileImageOverride(null);
  }, []);

  // Cleanup guard on unmount so we never leak object URLs.
  useEffect(() => () => {
    clearProfileImageOverride();
  }, [clearProfileImageOverride]);

  // Fetches the user whenever the route param changes.
  useEffect(() => {
    if (!routeUserId) {
      setUserData(null);
      setLoading(false);
      setIsEditMode(false);
      setErrorMessage("User not found.");
      clearProfileImageOverride();
      return;
    }

    const controller = new AbortController(); // Allows abort when route changes.
    const { signal } = controller; // Extract abort signal.

    async function loadUserProfile() { //
      try {
        setLoading(true); 
        setErrorMessage(null);
        clearProfileImageOverride();

        const response = await fetch(
          `https://localhost:5001/api/v2/users/${routeUserId}`,
          { signal } // Pass abort signal to fetch.
        );

        if (!response.ok) {
          throw new Error("User not found.");
        }

        const payload = await response.json();
        const normalized = normalizeUserPayload(payload); // Maps json to frontend object

        setUserData(normalized);
        setIsEditMode(false);
      } catch (error) {
        if (signal.aborted) {
          return;
        }

        console.error("Failed to load user profile", error);
        setUserData(null);
        setIsEditMode(false);

        const message =
          error instanceof Error ? error.message : "Failed to load user profile.";
        setErrorMessage(message);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadUserProfile();

    return () => {
      controller.abort(); // Cancel in-flight fetch on cleanup.
    };
  }, [routeUserId, clearProfileImageOverride]); // Re-run when route param changes.

  // Determines if viewer owns this profile.
  const userUid = userData?.uid ?? ""; // Always compare against string.
  const isOwnProfile = isSignedIn && String(authUserId ?? "") === String(userUid);

  // Protects against stale edit state when opening other profiles.
  // This happens when navigating from one profile to another while in edit mode.
  useEffect(() => {
    if (!isOwnProfile && isEditMode) {
      setIsEditMode(false);
    }
  }, [isOwnProfile, isEditMode]);

  // Toggles edit mode for own profile.
  const handleToggleEditMode = useCallback(() => {
    if (!isOwnProfile) return;
    setIsEditMode((previous) => !previous);
  }, [isOwnProfile]);

  // Copies profile URL to clipboard (share button).
  const handleShareClick = useCallback(async () => {
    if (!userUid || typeof window === "undefined") return;

    const shareUrl = `${window.location.origin}/user/${userUid}`;

    if (!navigator?.clipboard?.writeText) {
      window.prompt("Copy this profile URL", shareUrl);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Profile URL copied to clipboard");
    } catch (error) {
      console.error("Failed to share profile URL", error);
      window.prompt("Copy this profile URL", shareUrl);
    }
  }, [userUid, userData?.user_name]);

  // Opens hidden file input so owner can select new avatar.
  const handleAvatarClick = useCallback(() => {
    if (!isOwnProfile || !isEditMode) return;
    fileInputRef.current?.click();
  }, [isOwnProfile, isEditMode]);

  // Builds a temporary preview from an uploaded file.
  const handleAvatarFileChange = useCallback(
    async (event) => {
      if (!isOwnProfile || !isEditMode) return;

      const file = event.target.files?.[0];
      if (!file) return;

      clearProfileImageOverride();

      const objectUrl = URL.createObjectURL(file); // Blob URL for local preview.
      imageObjectUrlRef.current = objectUrl;
      setProfileImageOverride(objectUrl);

      event.target.value = "";
      const token = getStoredToken();
      if (!token || !userUid) {
        console.warn("Cannot upload profile picture without auth token or user id");
        return;
      }

      try {
        await setProfilePicture({ userId: userUid, token, file });
        console.info("Profile picture uploaded successfully");
      } catch (error) {
        console.error("Failed to upload profile picture", error);
      }
    },
    [clearProfileImageOverride, isEditMode, isOwnProfile, userUid]
  );

  // Chooses between local preview and backend-supplied base64 image.
  const profileImageSrc = useMemo(() => {
    if (profileImageOverride) { // If user has a local preview, use that.
      return profileImageOverride;
    }

    const raw = userData?.profile_image; // Backend stores base64 (or nothing).
    if (!raw) { // No image provided.
      return null; // Will fallback to default avatar in UserBanner.
    }

    const dataUrl = normalizeDataUrl(String(raw).trim());
    if (!dataUrl) {
      return null;
    }

    return dataUrl;
  }, [profileImageOverride, userData?.profile_image]); // Recompute when override or user data changes.

  if (loading) {
    return (
      <main className="container py-4">
        <div>Loading...</div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="container py-4">
        <div>{errorMessage ?? "User not found."}</div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="d-none"
        onChange={handleAvatarFileChange}
      />

      <UserBanner
        user_name={userData.user_name}
        email={userData.email}
        createdAt={userData.createdAt}
        ratingsCount={userData.ratingsCount}
        bookmarksCount={userData.bookmarksCount}
        profile_image={profileImageSrc ?? undefined}
        role={userData.role}
        isOwnProfile={isOwnProfile}
        isEditMode={isEditMode}
        onEditClick={handleToggleEditMode}
        onAvatarClick={handleAvatarClick}
        onShareClick={handleShareClick}
      />
    </main>
  );
}
