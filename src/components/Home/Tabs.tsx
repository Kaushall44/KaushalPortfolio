import { motion } from "motion/react";

export interface TabsInterface {
  tabs: string[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  badges?: Record<number, string>;
}
const Tabs = ({ tabs, activeTab, setActiveTab, badges }: TabsInterface) => {
  return (
    <div className={"tabs"}>
      {tabs.map((tab, index) => (
        <div
          key={index}
          className={`${"tab"} ${activeTab === index ? "active" : ""}`}
          onClick={() => {
            setActiveTab(index);
            document.getElementById("work-content-scroll-div")?.scrollTo({
              left: 0,
              behavior: "smooth",
            });
          }}
        >
          {tab}
          {badges?.[index] && (
            <span className="tab-badge">{badges[index]}</span>
          )}
          {activeTab === index && (
            <motion.div
              layoutId="active-tab-indicator"
              className={"active-tab-indicator"}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
