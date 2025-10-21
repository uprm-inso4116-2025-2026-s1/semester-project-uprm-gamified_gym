import React from "react";
import diconsFireIsoColor from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/3dicons-fire-iso-color.png";
import diconsGymDynamicColor from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/3dicons-gym-dynamic-color.png";
import diconsGymIsoColor from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/3dicons-gym-iso-color.png";
import diconsHeartIsoColor from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/3dicons-heart-iso-color.png";
import frame3 from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/frame-3.png";
import group from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/group.png";
import vector2 from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/vector-2.svg";
import vector from "../app/game_design/screens/achievements_screen_v1/AchievementsScreen/vector.svg";
import "./AchievementsScreen.css";

const BadgeCard = ({
  title,
  subtitle,
  icon,
  progress,
}: { title: string; subtitle: string; icon: string; progress: number }) => (
  <section className="badge-card">
    <div className="badge-icon-wrapper">
      <img src={icon} alt={`${title} icon`} className="badge-icon" />
    </div>
    <h3 className="badge-title">{title}</h3>
    <p className="badge-subtitle">{subtitle}</p>
    <div className="badge-progress">
      <span>{progress}%</span>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </section>
);

export const AchievementsScreen = (): JSX.Element => {
  return (
    <main className="achievements-screen">
      <header className="achievements-header">
        <img src={vector2} alt="Back" className="back-icon" />
        <img src={frame3} alt="Title Frame" className="title-frame" />
        <div className="status-bar">
          <span className="time">9:41</span>
          <div className="status-icons">
            <div className="signal" />
            <div className="wifi" />
            <img src={group} alt="Battery" className="battery" />
          </div>
        </div>
        <div className="header-badge">
          <div className="badge-background">
            <img src={diconsGymDynamicColor} alt="Header Badge" />
          </div>
        </div>
      </header>

      <section className="badges-grid">
        <BadgeCard
          title="Ranked"
          subtitle="Star"
          icon={vector}
          progress={100}
        />
        <BadgeCard
          title="Streaks"
          subtitle="Freshman"
          icon={diconsFireIsoColor}
          progress={0}
        />
        <BadgeCard
          title="Strength"
          subtitle="Sophomore"
          icon={diconsGymIsoColor}
          progress={75}
        />
        <BadgeCard
          title="Holidays"
          subtitle="Sophomore"
          icon={diconsHeartIsoColor}
          progress={75}
        />
      </section>

      <footer className="home-indicator">
        <div className="indicator-bar" />
      </footer>
    </main>
  );
};
