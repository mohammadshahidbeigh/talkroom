import {PrismaClient} from ".prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "minimal",
});

interface PrismaError {
  code?: string;
  message: string;
}

// Wrapper function for safe queries
export const safeQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
  try {
    return await queryFn();
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      throw new Error("Record not found");
    }
    throw new Error("Database error");
  }
};

export default prisma;
