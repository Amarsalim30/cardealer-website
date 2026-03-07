const DEFAULT_SITE_URL = "http://localhost:3000";

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  adminNotificationEmail:
    process.env.ADMIN_NOTIFICATION_EMAIL || "sales@example.com",
};

export const hasSupabaseConfig = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const hasCloudinaryConfig = Boolean(
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
);

export const hasResendConfig = Boolean(env.resendApiKey);
