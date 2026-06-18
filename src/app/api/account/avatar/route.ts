import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { jsonError, jsonSuccess, getErrorStatus } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  getCloudinaryFolder,
  replaceCloudinaryAsset
} from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Unauthorized.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Please choose an image to upload.", 400);
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return jsonError("User not found.", 404);
    }

    const uploaded = await replaceCloudinaryAsset(
      user.avatarPublicId ?? "",
      file,
      {
        folder: getCloudinaryFolder("avatars"),
        resourceType: "image",
        useFilename: true,
        uniqueFilename: true,
        overwrite: false
      }
    );

    user.avatarUrl = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
    await user.save();

    return jsonSuccess(
      {
        avatarUrl: user.avatarUrl,
        avatarPublicId: user.avatarPublicId
      },
      "Profile photo updated."
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update profile photo.",
      getErrorStatus(error)
    );
  }
}
