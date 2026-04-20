import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin - MawarBiru",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // When there is no session (e.g. login page), render children without
  // the admin shell. The middleware already handles redirects for protected
  // routes, so this is only reached for public admin routes like /admin/login.
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <AdminShell nama={session.user.nama} email={session.user.email}>
      {children}
    </AdminShell>
  );
}
