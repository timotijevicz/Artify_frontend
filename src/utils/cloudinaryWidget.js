export function openCloudinaryWidget({ onSuccess }) {
  if (!window.cloudinary) {
    alert("Cloudinary widget nije učitan. Proveri index.html script.");
    return;
  }

  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: "dfaxxpssz",
      uploadPreset: "artify_unsigned",
      folder: "artify",
      sources: ["local"],
      multiple: false,
      resourceType: "image",
      clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
      maxFileSize: 8 * 1024 * 1024, // 8MB
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary widget error:", error);
        alert("Greška pri upload-u slike.");
        return;
      }

      if (result && result.event === "success") {
        const url = result.info.secure_url;
        onSuccess(url);
      }
    }
  );

  widget.open();
}
