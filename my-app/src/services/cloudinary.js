const uploadImageToCloudinary = async (file) => {
  try {
    // Convert file to base64
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // Create form data
    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("upload_preset", "ml_default");
    formData.append("cloud_name", "drj0wvueq");

    // Upload to Cloudinary using fetch
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/drj0wvueq/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Cloudinary response:", data);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export { uploadImageToCloudinary };
