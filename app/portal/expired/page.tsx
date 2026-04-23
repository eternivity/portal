import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function ExpiredPortalPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg-page p-6">
      <Card className="w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-4 size-[22px] rounded-md bg-purple-600" />
        <h1 className="text-[18px] font-medium leading-[1.6]">Portal bağlantısı süresi doldu</h1>
        <p className="mt-2 text-text-secondary">Yeni bir güvenli bağlantı almak için freelancer ile iletişime geç.</p>
        <Link href="/auth/login" className="mt-4 block text-[12px] leading-[1.6] text-purple-600">
          PortalKit giriş
        </Link>
      </Card>
    </main>
  );
}
