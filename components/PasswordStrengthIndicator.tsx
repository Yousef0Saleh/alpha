"use client";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: "", color: "" };

    let score = 0;

    // Length check
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    // Return strength details
    if (score <= 2) return { score: 1, label: "ضعيف", color: "bg-red-500" };
    if (score <= 4) return { score: 2, label: "متوسط", color: "bg-yellow-500" };
    return { score: 3, label: "قوي", color: "bg-green-500" };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.score / 3) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${strength.score === 1 ? 'text-red-400' :
            strength.score === 2 ? 'text-yellow-400' :
              'text-green-400'
          }`}>
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1">
        {password.length < 8 && (
          <span className="text-xs text-gray-400">• 8 أحرف على الأقل</span>
        )}
        {!/[A-Z]/.test(password) && (
          <span className="text-xs text-gray-400">• حرف كبير</span>
        )}
        {!/[0-9]/.test(password) && (
          <span className="text-xs text-gray-400">• رقم</span>
        )}
      </div>
    </div>
  );
}
