/** @format */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider } from "react-hook-form";
import * as yup from "yup";
import { FormInput, Button, Card } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { LogIn, Lock, User } from "lucide-react";
import { Animated } from "@/components/ui";

const loginSchema = yup.object({
  username: yup.string().required("Username wajib diisi"),
  password: yup.string().required("Password wajib diisi"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect admin to admin dashboard, others to home
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  const methods = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Redirect will be handled by useEffect
    } catch {
      // Error already handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-6 md:p-8">
      <Animated animation="fade-up" className="w-full max-w-md">
        <Card
          title="Login"
          subtitle="Masuk ke akun Anda"
          className="shadow-2xl"
        >
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormInput
                name="username"
                label="Username"
                placeholder="Masukkan username"
                className="w-full"
                leftIcon={<User className="w-5 h-5" />}
                autoComplete="username"
              />

              <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="Masukkan password"
                className="w-full"
                leftIcon={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
                showPasswordToggle
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                  leftIcon={<LogIn className="w-5 h-5" />}
                >
                  {isLoading ? "Memproses..." : "Login"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </Animated>
    </div>
  );
}
