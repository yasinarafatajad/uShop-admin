import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    // Dynamic folder: /upload?folder=products → ushop-admin/products
    const subfolder = req.query.folder || "general";
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `ushop-admin/${subfolder}`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.log("Image upload failed:", err.message);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ success: false, message: "public_id is required" });
    }

    await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.log("Image delete failed:", err.message);
    res.status(500).json({ success: false, message: "Image delete failed" });
  }
};
