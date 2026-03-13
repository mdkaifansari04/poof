import type { FormEvent } from "react";
import { useId, useState } from "react";

type EarlyAccessFormProps = {
  source: string;
  className?: string;
  compact?: boolean;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

type ApiResponse = {
  success?: boolean;
  message?: string;
  alreadyJoined?: boolean;
};

export function EarlyAccessForm({
  source,
  className = "",
  compact = false,
}: EarlyAccessFormProps) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus("error");
      setMessage("Enter your email to join the early access list.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, source }),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setStatus("error");
        setMessage(result.message ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        result.alreadyJoined
          ? "You are already on the list. We will email you when Poof is ready."
          : (result.message ??
              "You are on the list. We will email you at launch."),
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Unable to save your email right now. Please try again.");
    }
  };

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className={`rounded-lg bg-black/20 backdrop-blur-xl ${
          compact ? "p-3" : "p-4 md:p-5"
        }`}
      >
        <div
          className={`flex ${compact ? "flex-col gap-3" : "flex-col gap-3 md:flex-row md:items-center"}`}
        >
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email for early access"
            className="py-4 flex-1 rounded-lg border border-white/8 bg-white/6 px-5 text-base text-poof-white outline-none transition placeholder:text-poof-mist/70 focus:border-poof-mint/50 focus:bg-white/10"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex h-14 items-center justify-center rounded-[20px] border border-poof-accent/70 bg-poof-accent px-6 text-sm font-semibold tracking-[0.02em] text-poof-white transition hover:-translate-y-0.5 hover:border-poof-violet hover:bg-poof-violet hover:shadow-[0_18px_40px_rgba(124,92,252,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "submitting" ? "Saving..." : "Request early access"}
          </button>
        </div>
      </form>

      <div className="mt-3 min-h-6 text-sm">
        {message ? (
          <p
            className={
              status === "success" ? "text-poof-mint" : "text-poof-peach"
            }
          >
            {message}
          </p>
        ) : (
          <p className="text-poof-mist/80">
            Launch updates only. No newsletter spam.
          </p>
        )}
      </div>
    </div>
  );
}
