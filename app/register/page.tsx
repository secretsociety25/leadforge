import { redirect } from "next/navigation";

/**
 * Registration uses the same form as /login with Create account selected.
 */
export default function RegisterPage() {
  redirect("/login?mode=signup");
}
