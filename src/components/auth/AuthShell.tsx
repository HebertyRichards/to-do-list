"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordEmailForm } from "./ForgotPasswordEmailForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

type Step = "login" | "register" | "forgot" | "reset";

const transition = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
  transition: { duration: 0.25, ease: "easeInOut" as const },
};

export function AuthShell() {
  const [step, setStep] = useState<Step>("login");
  const [resetToken, setResetToken] = useState<string>("");

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
              <RegisterForm onSwitchLogin={() => setStep("login")} />
            </motion.div>
          )}
          {step === "forgot" && (
            <motion.div key="forgot" {...transition}>
              <ForgotPasswordEmailForm
                onSwitchLogin={() => setStep("login")}
                onTokenIssued={(token) => {
                  setResetToken(token);
                  setStep("reset");
                }}
              />
            </motion.div>
          )}
          {step === "reset" && (
            <motion.div key="reset" {...transition}>
              <ResetPasswordForm
                initialToken={resetToken}
                onSwitchLogin={() => setStep("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
