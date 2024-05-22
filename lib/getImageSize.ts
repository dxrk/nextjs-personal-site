import sizeOf from "image-size";
import fs from "fs";
import path from "path";

export const getImageSize = (imagePath: string) => {
  if (typeof window === "undefined") {
    // Server-side
    return new Promise((resolve, reject) => {
      const fullPath = path.join(process.cwd(), "public", imagePath);
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          return reject(err);
        }
        const dimensions = sizeOf(data);
        resolve(dimensions);
      });
    });
  } else {
    // Client-side
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = imagePath;
    });
  }
};
