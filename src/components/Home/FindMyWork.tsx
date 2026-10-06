import { lazy, Suspense, useState, useEffect } from "react";
import { openProject } from '../../utils/openProject';
import { work } from "../../constants/work";
import Tabs from "./Tabs";
import WorkCard from "./WorkCard";

const Terminal = lazy(() => import("../Terminal/Terminal"));

function FindMyWork() {
  const tabs = ["Featured", "Web Apps", "Experiments", "Terminal"];
  const [activeTab, setActiveTab] = useState<number>(0);
  useEffect(() => {
    const followLink = () => {
      if (!window.location.hash.startsWith('#project=')) return;
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(9)); } catch { return; }
      const group = work.findIndex(items => items.some(item => item.cardData.id === id));
      if (group < 0) return;
      const project = work[group].find(item => item.cardData.id === id)!;
      setActiveTab(group);
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      openProject(project);
    };
    followLink();
    window.addEventListener('hashchange', followLink);
    return () => window.removeEventListener('hashchange', followLink);
  }, []);
  return (
    <div className="find-my-work" id="work">
      <h1 className="heading" data-color-inverted={"true"}>
        Find My Work
      </h1>
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} badges={{ 3: "New" }} />
      {activeTab === 3 ? (
        <Suspense fallback={null}>
          <Terminal onClose={() => setActiveTab(0)} />
        </Suspense>
      ) : (
        <div className="work-content" id="work-content-scroll-div">
          {work[activeTab]?.map((data, i) => (
            <WorkCard key={i} data={data} cardIndex={activeTab * 100 + i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FindMyWork;
