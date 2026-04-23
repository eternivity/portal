"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        email
      });
    }

    router.push("/auth/onboarding");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg-page p-6">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-3">
            <div className="size-[22px] rounded-md bg-purple-600" />
            <span className="text-[15px] font-medium leading-[1.6]">PortalKit</span>
          </div>
          <h1 className="text-[18px] font-medium leading-[1.6]">Hesap oluştur</h1>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" />
          <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <div className="relative">
            <Input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center text-text-secondary"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error ? <p className="text-[12px] leading-[1.6] text-coral-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kaydediliyor" : "Kayıt ol"}
          </Button>
        </form>

        <Link href="/auth/login" className="mt-4 block text-center text-[12px] leading-[1.6] text-purple-600">
          Zaten hesabın var mı? Giriş yap
        </Link>
      </Card>
    </main>
  );
}
