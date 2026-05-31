// src/components/Avatar.jsx
export default function Avatar({ initials, online, size = "md" }) {
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
  };
  const dotSizes = {
    sm: "w-2 h-2 border",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
  };

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue to-[#1e3a5f]
          flex items-center justify-center font-semibold text-primary`}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-sidebar
            ${online ? "bg-online" : "bg-offline"}`}
        />
      )}
    </div>
  );
}
