import { useState } from "react";

export default function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  hint,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleFocus = (e) => {
    e.target.style.borderColor = "#8400ff";
    e.target.style.boxShadow = "0 0 0 3px rgba(132,0,255,0.08)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-dark-amethyst-500 tracking-wide">
          {label}
        </label>
        {hint && hint}
      </div>

      <div className="relative">
        <input
          type={inputType}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-11 rounded-xl px-4 text-sm text-dark-amethyst-900 bg-white border border-dark-amethyst-100 outline-none transition-all duration-200 placeholder:text-dark-amethyst-200 ${isPassword ? "pr-12" : ""}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
          >
            <img
              src={showPassword ? "/public/eye.png" : "/public/eye (1).png"}
              alt={showPassword ? "Hide password" : "Show password"}
              className="w-5 h-5"
              style={{ mixBlendMode: "multiply" }}
            />
          </button>
        )}
      </div>
    </div>
  );
}
