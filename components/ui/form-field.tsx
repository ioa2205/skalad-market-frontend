"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface FormFieldContextValue {
  controlId: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
  disabled?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormFieldContext(): FormFieldContextValue {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error("FormField subcomponents must be used inside <FormField />");
  return ctx;
}

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "id"> {
  /** Stable id; generated if omitted. */
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Unifies label / control / description / error spacing and a11y wiring.
 * Exposes `aria-invalid`, `aria-describedby`, and `aria-errormessage` on the
 * single child control via context — the control consumes them via
 * <FormFieldControl /> or by reading `useFormField()`.
 */
export function FormField({
  id,
  label,
  description,
  error,
  required,
  disabled,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const reactId = useId();
  const controlId = id ?? `field-${reactId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const invalid = Boolean(error);

  return (
    <FormFieldContext.Provider value={{ controlId, descriptionId, errorId, invalid, disabled }}>
      <div className={cn("flex flex-col gap-1.5", className)} {...rest}>
        {label ? (
          <Label htmlFor={controlId} className="flex items-center gap-1">
            {label}
            {required ? (
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            ) : null}
          </Label>
        ) : null}
        {children}
        {description ? (
          <p id={descriptionId} className="text-caption text-fg-muted">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-caption text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}

export function useFormField(): FormFieldContextValue {
  return useFormFieldContext();
}

/**
 * Wraps a single form control and injects id/aria props from context. Use this
 * if the control is a primitive that doesn't have its own context integration:
 *
 *   <FormField label="Email" error={errors.email?.message}>
 *     <FormFieldControl><Input {...register("email")} /></FormFieldControl>
 *   </FormField>
 */
export function FormFieldControl({ children }: { children: ReactElement }) {
  const ctx = useFormFieldContext();
  if (!isValidElement(children)) return children;

  const describedBy =
    [ctx.descriptionId, ctx.errorId].filter(Boolean).join(" ") || undefined;

  const injected: Record<string, unknown> = {
    id: ctx.controlId,
    ...(ctx.invalid ? { "aria-invalid": true } : {}),
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(ctx.errorId ? { "aria-errormessage": ctx.errorId } : {}),
    ...(ctx.disabled !== undefined ? { disabled: ctx.disabled } : {}),
  };

  return cloneElement(children as ReactElement<Record<string, unknown>>, injected);
}
