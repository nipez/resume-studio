/**
 * Seeds the local demo persona (Alex Rivera) into Supabase.
 * Run after `supabase db reset` or `supabase start`: npm run seed:demo
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { DEMO_PERSONA } from "../lib/demo/persona-data";
import { seedDemoPersona } from "../lib/demo/seed-persona";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local)"
  );
  process.exit(1);
}

const svc = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USER_ID = "a0000000-0000-4000-8000-000000000001";
const LOCAL_ADMIN_ID = "a0000000-0000-4000-8000-000000000002";
const LOCAL_ADMIN_EMAIL =
  process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
  "nickperez@gmail.com";

async function ensureLocalAdmin(): Promise<string> {
  const { data: existing } = await svc.auth.admin.getUserById(LOCAL_ADMIN_ID);
  if (existing?.user) return LOCAL_ADMIN_ID;

  const { data, error } = await svc.auth.admin.createUser({
    id: LOCAL_ADMIN_ID,
    email: LOCAL_ADMIN_EMAIL,
    password: "local-admin-demo-seed",
    email_confirm: true,
    user_metadata: { full_name: "Local Admin" },
  });
  if (error || !data?.user) {
    throw new Error(error?.message ?? "Failed to create local admin user");
  }
  return data.user.id;
}

async function ensureDemoUser(adminId: string): Promise<string> {
  const { data: existing } = await svc.auth.admin.getUserById(DEMO_USER_ID);
  if (!existing?.user) {
    const { data, error } = await svc.auth.admin.createUser({
      id: DEMO_USER_ID,
      email: DEMO_PERSONA.email,
      password: "demo-alex-rivera",
      email_confirm: true,
      user_metadata: { full_name: DEMO_PERSONA.fullName },
    });
    if (error || !data?.user) {
      throw new Error(error?.message ?? "Failed to create demo user");
    }
  }

  await svc.from("demo_users").upsert({
    id: DEMO_USER_ID,
    created_by: adminId,
    email: DEMO_PERSONA.email,
    label: DEMO_PERSONA.label,
  });

  return DEMO_USER_ID;
}

async function main() {
  console.log("Seeding demo persona:", DEMO_PERSONA.fullName);
  const adminId = await ensureLocalAdmin();
  const userId = await ensureDemoUser(adminId);
  await seedDemoPersona(svc, userId, { replace: true });
  console.log("Done.");
  console.log(`  Email:    ${DEMO_PERSONA.email}`);
  console.log(`  Password: demo-alex-rivera`);
  console.log(`  View as this user from Admin → Demo users, or sign in directly.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
