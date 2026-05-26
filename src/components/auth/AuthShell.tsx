"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordEmailForm } from "./ForgotPasswordEmailForm";
import { VerifyCodeForm } from "./VerifyCodeForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { useForgotPassword, useResendVerification, useVerifyEmail } from "@/hooks/use-auth";

type Step = "login" | "register" | "verify-email" | "forgot" | "verify-reset" | "reset";

const transition = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
  transition: { duration: 0.25, ease: "easeInOut" as const },
};

export function AuthShell() {
  const [step, setStep] = useState<Step>("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");

  const forgotPassword = useForgotPassword();
  const verifyEmailMutation = useVerifyEmail();
  const resendVerification = useResendVerification();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-auth-gradient-from to-auth-gradient-to p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-surface p-8 shadow-xl">
        <AnimatePresence mode="wait">
          {step === "login" && (
            <motion.div key="login" {...transition}>
              <LoginForm
                onSwitchRegister={() => setStep("register")}
                onSwitchForgot={() => setStep("forgot")}
              />
            </motion.div>
          )}

          {step === "register" && (
            <motion.div key="register" {...transition}>
              <RegisterForm
                onSwitchLogin={() => setStep("login")}
                onAwaitingVerification={(email) => {
                  setVerifyEmail(email);
                  setStep("verify-email");
                }}
              />
            </motion.div>
          )}

          {step === "verify-email" && (
            <motion.div key="verify-email" {...transition}>
              <VerifyCodeForm
                email={verifyEmail}
                title="Confirme seu email"
                description="Digite o código de 6 dígitos enviado para"
                isPending={verifyEmailMutation.isPending}
                isResending={resendVerification.isPending}
                onSubmit={(code) => verifyEmailMutation.mutate({ email: verifyEmail, code })}
                onResend={() => resendVerification.mutate({ email: verifyEmail })}
                onBack={() => setStep("login")}
              />
            </motion.div>
          )}

          {step === "forgot" && (
            <motion.div key="forgot" {...transition}>
              <ForgotPasswordEmailForm
                onSwitchLogin={() => setStep("login")}
                onCodeSent={(email) => {
                  setResetEmail(email);
                  setStep("verify-reset");
                }}
              />
            </motion.div>
          )}

          {step === "verify-reset" && (
            <motion.div key="verify-reset" {...transition}>
              <VerifyCodeForm
                email={resetEmail}
                isPending={false}
                isResending={forgotPassword.isPending}
                onSubmit={(code) => {
                  setResetCode(code);
                  setStep("reset");
                }}
                onResend={() => forgotPassword.mutate({ email: resetEmail })}
                onBack={() => setStep("forgot")}
              />
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div key="reset" {...transition}>
              <ResetPasswordForm
                email={resetEmail}
                code={resetCode}
                onSwitchLogin={() => setStep("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
