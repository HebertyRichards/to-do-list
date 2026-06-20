"use client";

import { forwardRef, useId } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsSectionProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-foreground-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

type LabeledInputProps = { label: string; error?: string } & InputProps;

export const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(
  function LabeledInput({ label, error, id, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Input id={inputId} ref={ref} {...props} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);
