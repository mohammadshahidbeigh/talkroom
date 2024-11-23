import {Request, Response} from "express";
import multer from "multer";
import {PrismaClient} from "@prisma/client";
import type {User} from ".prisma/client";
import prisma from "../models";

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
    fileSize: 500 * 1024 * 1024, // Increase to 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Add file type validation
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
}).single("file");

// Wrap the upload middleware to handle errors
export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: Function
) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File too large. Maximum size is 500MB",
        });
      }
      return res.status(400).json({
        error: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }
    next();
  });
};

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

    if (!file || !multerReq.user?.id) {
      res
        .status(400)
        .json({error: "No file uploaded or user not authenticated"});
      return;
    }

    // Create file record using Prisma client instead of raw query
    const dbFile = await prisma.file.create({
      data: {
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer,
        size: file.size,
        uploadedBy: multerReq.user.id,
      },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        size: true,
      },
    });

    // Generate URL using the file ID
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      dbFile.id
    }/${encodeURIComponent(file.originalname)}`;

    res.json({
      success: true,
      url: fileUrl,
      fileId: dbFile.id,
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

    // Add input validation
    if (!id || typeof id !== "string") {
      res.status(400).json({error: "Invalid file ID"});
      return;
    }

    const file = await prisma.file.findUnique({
      where: {id},
      select: {
        filename: true,
        mimetype: true,
        data: true,
        size: true,
      },
    });

    if (!file) {
      res.status(404).json({error: "File not found"});
      return;
    }

    // Set appropriate headers for the file
    res.set({
      "Content-Type": file.mimetype,
      "Content-Disposition": getContentDisposition(
        file.mimetype,
        file.filename
      ),
      "Content-Length": file.size,
      "Cache-Control": "public, max-age=31536000",
    });

    // Send the file data
    res.send(file.data);
  } catch (error) {
    console.error("File retrieval error:", error);
    res.status(500).json({error: "Failed to retrieve file"});
  }
};
