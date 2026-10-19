import { z } from "zod";
import { CATEGORIES, STATUSES } from "./types";

const cleanText = (value: string) => value.replace(/[\u0000-\u001F\u007F]/g, "").trim();

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(240);
export const passwordSchema = z.string().min(10, "Use at least 10 characters.").max(128);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().transform(cleanText).pipe(z.string().min(2, "Add a display name.").max(60)),
});

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.") });

export const createIssueSchema = z.object({
  title: z.string().transform(cleanText).pipe(z.string().min(8, "Give the issue a little more detail.").max(120)),
  description: z.string().transform(cleanText).pipe(z.string().min(24, "Add at least a sentence so people can understand the issue.").max(5000)),
  category: z.enum(CATEGORIES),
  isAnonymous: z.boolean().default(false),
  imageUrl: z.union([z.string().url().max(2000), z.literal("")]).optional(),
  imageType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
  imageSize: z.number().int().max(5_000_000).optional(),
}).superRefine((data, ctx) => {
  if (data.imageUrl && (!data.imageType || !data.imageSize)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["imageUrl"], message: "Image type and size are required." });
  }
});

export const voteSchema = z.object({
  direction: z.enum(["up", "down"]).nullable(),
  isAnonymous: z.boolean().default(true),
});

export const commentSchema = z.object({
  body: z.string().transform(cleanText).pipe(z.string().min(2, "Write a little more.").max(1200)),
  isAnonymous: z.boolean().default(false),
});

export const reportSchema = z.object({
  reason: z.string().transform(cleanText).pipe(z.string().min(8).max(300)),
});

export const adminStatusSchema = z.object({
  status: z.enum(STATUSES),
  note: z.string().transform(cleanText).pipe(z.string().max(1000)).optional(),
});

export function parseJson<T extends z.ZodTypeAny>(schema: T, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { ok: false as const, error: result.error.issues[0]?.message ?? "Check the highlighted fields." };
  }
  return { ok: true as const, data: result.data as z.infer<T> };
}
