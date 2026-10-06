import { useEffect } from "react";
import { useInputSourceStore } from "../../store/inputSourceStore";
import { useThemeStore } from "../../store/themeStore";

function CustomMouse() {
  const { darkMode } = useThemeStore();

  // Hide custom mouse when camera is active, show on real mouse movement
  useEffect(() => {
    let hidden = false;

    const hide = () => {
      if (hidden) return;
      hidden = true;
      const el = document.querySelector(".custom-mouse") as HTMLElement;
      if (el) el.style.display = "none";
    };

    const show = () => {
      if (!hidden) return;
      hidden = false;
      const el = document.querySelector(".custom-mouse") as HTMLElement;
      if (el) el.style.display = "";
    };

    const onMouseMove = () => {
      if (hidden) show();
    };

    const unsub = useInputSourceStore.subscribe((state) => {
      if (state.inputSource === "camera") hide();
      else show();
    });

    // Check initial state
    if (useInputSourceStore.getState().inputSource === "camera") hide();

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      unsub();
      window.removeEventListener("mousemove", onMouseMove);
      show();
    };
  }, []);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      const customMouse = document.querySelector(
        ".custom-mouse"
      ) as HTMLElement;
      if (customMouse) {
        customMouse.style.top = `${e.pageY}px`;
        customMouse.style.left = `${e.pageX}px`;
      }
    };

    const mouseDown = () => {
      const customMouse = document.querySelector(
        ".custom-mouse"
      ) as HTMLElement;
      if (customMouse) {
        customMouse.style.width = "50px";
        customMouse.style.height = "50px";
        customMouse.style.opacity = "0.5";
      }
    };

    const mouseUp = () => {
      const customMouse = document.querySelector(
        ".custom-mouse"
      ) as HTMLElement;
      if (customMouse) {
        customMouse.style.width = "10px";
        customMouse.style.height = "10px";
        customMouse.style.opacity = "1";
      }
    };

    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);

    const invertColorElements = document.querySelectorAll(
      "[data-color-inverted]"
    );
    invertColorElements.forEach((element) => {
      const el = element as HTMLElement;

      el.addEventListener("mouseenter", () => {
        const customMouse = document.querySelector(
          ".custom-mouse"
        ) as HTMLElement;
        if (customMouse) {
          customMouse.style.width = "80px";
          customMouse.style.height = "80px";
          customMouse.style["mixBlendMode"] = "difference";
          customMouse.style.filter = !darkMode ? "invert(1)" : "";
        }
      });

      el.addEventListener("mouseleave", () => {
        const customMouse = document.querySelector(
          ".custom-mouse"
        ) as HTMLElement;
        if (customMouse) {
          customMouse.style.width = "10px";
          customMouse.style.height = "10px";
          customMouse.style["mixBlendMode"] = "unset";
          customMouse.style.filter = "unset";
        }
      });
    });

    // when mouse enters a data-attribute element of  data-click-me={"true"} then change the cursor to grow bigger and have a text which says click me
    const clickMeElements = document.querySelectorAll("[data-click-me]");
    clickMeElements.forEach((element) => {
      const el = element as HTMLElement;

      el.addEventListener("mouseenter", () => {
        const customMouse = document.querySelector(
          ".custom-mouse"
        ) as HTMLElement;
        if (customMouse) {
          customMouse.style.width = "100px";
          customMouse.style.height = "100px";
          customMouse.innerHTML = "<p>Click Me!</p>";
          customMouse.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        }
      });

      el.addEventListener("mouseleave", () => {
        const customMouse = document.querySelector(
          ".custom-mouse"
        ) as HTMLElement;
        if (customMouse) {
          customMouse.style.width = "10px";
          customMouse.style.height = "10px";
          customMouse.innerHTML = "";
          customMouse.style.backgroundColor = "";
          customMouse.style.backdropFilter = "unset";
        }
      });
    });

    const dragMeElements = document.querySelectorAll("[data-drag-me]");
    dragMeElements.forEach((element) => {
      const el = element as HTMLElement;

      el.addEventListener("mouseenter", () => {
        const customMouse = document.querySelector(
          ".custom-mouse"
        ) as HTMLElement;
        if (customMouse) {
          customMouse.style.width = "50px";
          customMouse.style.height = "50px";
          customMouse.style.backgroundColor = "var(--black)";
          customMouse.style.backdropFilter = "blur(10px)";
          customMouse.style.opacity = !darkMode ? "0.8" : "0.25";
        }
      });

      el.addEventListener("mouseleave", () => {
        const customMouse = document.querySelector(
          ".custom-mouse"
        ) as HTMLElement;
        if (customMouse) {
          customMouse.style.width = "10px";
          customMouse.style.height = "10px";
          customMouse.innerHTML = "";
          customMouse.style.backgroundColor = "";
          customMouse.style.backdropFilter = "unset";
          customMouse.style.opacity = "1";
        }
      });
    });

    return () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mousedown", mouseDown);
    };
  }, [darkMode]);

  return <div className="custom-mouse" />;
}

export default CustomMouse;
