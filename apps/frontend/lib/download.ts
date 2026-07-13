import { api } from "./api";

export async function downloadImage(
  imageUrl: string,
  fileName: string,
  driveFileId?: string,
): Promise<boolean> {
  let blob: Blob;

  try {
    if (driveFileId && driveFileId !== "saved") {
      // Secure fetch via backend for Google Drive files to avoid CORS and corrupted files
      const response = await api.get(
        `/integrations/google-drive/file/${driveFileId}`,
        {
          responseType: "blob",
        },
      );
      blob = response.data;
    } else {
      // Normal fetch (e.g., for data URIs)
      let finalUrl = imageUrl;
      if (
        finalUrl &&
        !finalUrl.startsWith("http") &&
        !finalUrl.startsWith("data:") &&
        (!finalUrl.startsWith("/") || finalUrl.length > 500)
      ) {
        finalUrl = `data:image/png;base64,${finalUrl}`;
      }

      const response = await fetch(finalUrl);
      blob = await response.blob();
    }

    // Try to use modern File System Access API so user can choose where to save
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "PNG Image",
              accept: { "image/png": [".png"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true; // Success
      } catch (err: any) {
        // AbortError is thrown when user cancels the save dialog
        if (err.name === "AbortError" || err.message.includes("abort")) {
          return false; // Cancelled by user, not an error
        }
        console.warn(
          "showSaveFilePicker failed, falling back to legacy download",
          err,
        );
      }
    }

    // Legacy fallback for mobile / Safari / Firefox
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    return true;
  } catch (error) {
    console.error("Failed to download image:", error);
    throw error;
  }
}
