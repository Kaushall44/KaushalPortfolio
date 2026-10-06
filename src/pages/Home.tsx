import { lazy, Suspense } from "react";
import FindMyWork from "../components/Home/FindMyWork";
import Hero from "../components/Home/Hero";
import HorizontalSkillsWrapper from "../components/Home/HorizontalSkillsWrapper";
import NumbersAndStats from "../components/Home/Numbers";
import Skills from "../components/Home/Skills";
import WorkExperience from "../components/Home/WorkExperience";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Shared/Footer";

const CarCanvas = lazy(() => import("../components/Canvas/BallCanvas"));

function Home() {
  return (
    <div className="home-wrapper">
      <Navbar />
      <Hero />
      <Skills />
      <FindMyWork />
      <NumbersAndStats />
      <HorizontalSkillsWrapper />
      <WorkExperience />
      <Footer />
      <Suspense fallback={null}>
        <CarCanvas />
      </Suspense>
    </div>
  );
}

export default Home;
