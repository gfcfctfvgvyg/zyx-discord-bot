interface ZyxLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function ZyxLogo({ className = "", size = "md" }: ZyxLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`font-bold tracking-tight bg-gradient-to-br from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent ${sizeMap[size]}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Zyx
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-lg blur opacity-20" />
      </div>
    </div>
  );
}
