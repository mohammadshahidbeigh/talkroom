import {Request, Response} from "express";
import multer from "multer";
import prisma from "../models";
import type {User} from ".prisma/client";

// Define a custom type for the authenticated request
interface AuthenticatedRequest extends Request {
  user: User;
}

// Define the multer request type
interface MulterRequest extends AuthenticatedRequest {
  file: Express.Multer.File;
}

// Define types for raw query results
interface FileQueryResult {
  id: string;
  filename: string;
  mimetype: string;
  data: Buffer;
  size: number;
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to determine content disposition
const getContentDisposition = (mimetype: string, filename: string): string => {
  // List of mimetypes that should be displayed inline
  const inlineTypes = [
    "image/",
    "video/",
    "audio/",
    "text/",
    "application/pdf",
  ];

  const shouldBeInline = inlineTypes.some((type) => mimetype.startsWith(type));
  const disposition = shouldBeInline ? "inline" : "attachment";

  // Ensure filename is properly encoded for headers
  const encodedFilename = encodeURIComponent(filename).replace(
    /['()]/g,
    escape
  );

  return `${disposition}; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`;
};

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    const file = multerReq.file;

    console.log("Received file:", file);

    if (!file || !multerReq.user?.id) {
      console.error("No file uploaded or user not authenticated");
      res
        .status(400)
        .json({error: "No file uploaded or user not authenticated"});
      return;
    }

    // Store file in database
    const dbFile = await prisma.$queryRaw<FileQueryResult[]>`
      INSERT INTO "File" (
        id,
        filename,
        mimetype,
        data,
        size,
        "uploadedBy",
        "createdAt"
      ) VALUES (
        gen_random_uuid(),
        ${file.originalname},
        ${file.mimetype},
        ${file.buffer},
        ${file.size},
        ${multerReq.user.id},
        NOW()
      ) RETURNING id, filename, mimetype, data, size`;

    console.log("File stored in DB:", {
      id: dbFile[0].id,
      filename: dbFile[0].filename,
      size: dbFile[0].size,
    });

    // Generate URL
    const safeFilename = encodeURIComponent(file.originalname);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      dbFile[0].id
    }/${safeFilename}`;

    console.log("Generated URL:", fileUrl);

    res.json({
      success: true,
      url: fileUrl,
      fileId: dbFile[0].id,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({error: "Failed to upload file"});
  }
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;
    const files = await prisma.$queryRaw<FileQueryResult[]>`
      SELECT id, filename, mimetype, data, size 
      FROM "File" 
      WHERE id = ${id}
    `;

    if (!files || files.length === 0) {
      res.status(404).json({error: "File not found"});
      return;
    }

    const file = files[0];

    // Set headers for proper file handling
    res.set({
      "Content-Type": file.mimetype,
      "Content-Disposition": getContentDisposition(
        file.mimetype,
        file.filename
      ),
      "Content-Length": file.size,
      "Cache-Control": "public, max-age=31536000",
      "Accept-Ranges": "bytes",
    });

    res.send(file.data);
  } catch (error) {
    console.error("File retrieval error:", error);
    res.status(500).json({error: "Failed to retrieve file"});
  }
};
