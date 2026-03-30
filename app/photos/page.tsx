import fs from "fs";
import path from "path";
import crypto from "crypto";
import sizeOf from "image-size";
import PhotoGallery, { type Photo } from "./photo-gallery";

export const dynamic = "force-dynamic";

function generateSeed() {
  return crypto.randomBytes(4).readUInt32BE();
}

export default function PhotosPage() {
  const portfolioDir = path.join(process.cwd(), "public", "portfolio");
  const files = fs.readdirSync(portfolioDir);
  const photos: Photo[] = files
    .filter((file) => /\.(png|jpe?g|svg)$/i.test(file))
    .map((file) => {
      const dims = sizeOf(path.join(portfolioDir, file));
      return {
        filename: file,
        width: dims.width ?? 1000,
        height: dims.height ?? 1000,
      };
    });

  return <PhotoGallery photos={photos} seed={generateSeed()} />;
}
