import { ReactElement, useCallback } from "react";
import { useThemeStore } from "../../store/themeStore";

function CommonButton({
  Icon,
  text,
  onClick = () => {},
  variant = "primary",
  disabled = false,
  iconPosition = "left",
  customClass = "",
}: {
  Icon?: ReactElement;
  iconPosition?: "left" | "right";
  text?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  customClass?: string;
}) {
  const { darkMode } = useThemeStore();

  const mouseEnterAndExit = useCallback(
    (enter: boolean) => {
      const customMouse = document.querySelector(
        ".custom-mouse"
      ) as HTMLElement;
      if (customMouse && variant === "outline") {
        if (enter) {
          customMouse.style.backgroundColor = "var(--white)";
        } else {
          customMouse.style.backgroundColor = darkMode
            ? "var(--black)"
            : "var(--black)";
        }
      }
    },
    [darkMode]
  );

  return (
    <button
      className={`btn ${variant} ${customClass}`}
      onClick={onClick}
      style={{
        flexDirection: iconPosition === "right" ? "row-reverse" : "row",
      }}
      onMouseEnter={() => mouseEnterAndExit(true)}
      onMouseLeave={() => mouseEnterAndExit(false)}
    >
      {Icon && <div className="icon">{Icon}</div>}
      {text && <p className="text">{text}</p>}
    </button>
  );
}

export default CommonButton;
