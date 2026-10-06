import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { forwardRef, useLayoutEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const HorizontalSkills = forwardRef<
  HTMLDivElement,
  { icons: string[]; reverse?: boolean }
>(({ icons, reverse }, ref) => {
  useLayoutEffect(() => {
    const container = ref as React.MutableRefObject<HTMLDivElement | null>;

    if (container.current) {
      // Disable manual scrolling
      container.current.style.overflow = "hidden";

      // Duplicate the icons to create an infinite loop effect
      const totalWidth = container.current.scrollWidth;
      const scrollDistance = totalWidth - container.current.clientWidth;

      gsap.to(container.current, {
        scrollLeft: reverse ? scrollDistance : scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom", // Start scrolling when the top of the container hits the bottom of the viewport
          end: "bottom top", // End scrolling when the bottom of the container hits the top of the viewport
          scrub: 2, // Controls the speed of the scrolling, adjust for smoothness
          onUpdate: (self) => {
            if (
              container.current &&
              self.direction > 0 &&
              container.current.scrollLeft >= scrollDistance
            ) {
              container.current.scrollLeft = 0;
            } else if (
              container.current &&
              self.direction < 0 &&
              container.current.scrollLeft <= 0
            ) {
              container.current.scrollLeft = scrollDistance;
            }
          },
        },
      });
    }

    return () => {
      // Cleanup ScrollTrigger instances on component unmount
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [reverse, ref, icons]);

  return (
    <div
      className={`horizontal-skills-wrapper ${reverse ? "reverse" : ""}`}
      ref={ref}
    >
      {icons?.map((icon, i) => (
        <img
          src={icon}
          key={`icon-scrollable-${i}-${icon}`}
          alt={icon.split("/").pop()?.replace(".svg", "") || "Skill"}
          className="icon"
        />
      ))}
      {/* Repeat icons for infinite looping */}
      {icons?.map((icon, i) => (
        <img
          src={icon}
          key={`icon-scrollable-duplicate-${i}-${icon}`}
          alt={icon.split("/").pop()?.replace(".svg", "") || "Skill"}
          className="icon"
        />
      ))}
    </div>
  );
});

export default HorizontalSkills;
