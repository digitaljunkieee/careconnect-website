import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { workerDocumentUploadSchema } from "@/lib/validators/worker";
import { uploadWorkerVerificationDocument } from "@/lib/workflows";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "WORKER" || !session.user.id) {
      return jsonError("Unauthorized.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const documentName = formData.get("documentName");

    if (!(file instanceof File)) {
      return jsonError("Please choose a file to upload.", 400);
    }

    const parsed = workerDocumentUploadSchema.safeParse({
      documentName: typeof documentName === "string" ? documentName : ""
    });

    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.flatten());
    }

    const result = await uploadWorkerVerificationDocument(
      session.user.id,
      file,
      parsed.data.documentName
    );

    return jsonSuccess(result, "Document uploaded successfully.", 201);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to upload document.",
      getErrorStatus(error)
    );
  }
}
