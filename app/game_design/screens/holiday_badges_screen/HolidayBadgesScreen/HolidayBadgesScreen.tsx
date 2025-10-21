import React from "react";
import "./style.css";

import diconsHeartIsoColor from "../app/game_design/screens/holiday_badges_screen/HolidayBadgesScreen/3dicons-heart-iso-color.png";
import pumpkinBadge from "../app/game_design/screens/holiday_badges_screen/HolidayBadgesScreen/3dicons-pumpkin-iso-color.png";
import diconsXmasTreeDynamicColor from "../app/game_design/screens/holiday_badges_screen/HolidayBadgesScreen/3dicons-xmas-tree-dynamic-color.png";

const badges = [
  {
    id: "xmas",
    alt: "Christmas Tree Badge",
    src: diconsXmasTreeDynamicColor,
  },
  {
    id: "valentine",
    alt: "Heart Badge",
    src: diconsHeartIsoColor,
  },
  {
    id: "halloween",
    alt: "Pumpkin Badge",
    src: pumpkinBadge,
  },
];

export const HolidayBadges = (): JSX.Element => {
  return (
    <main className="holiday-badges">
      <header className="holiday-badges__header">
        <h1>Holidays</h1>
      </header>
      <section className="holiday-badges__grid">
        {badges.map((badge) => (
          <figure key={badge.id} className="holiday-badges__item">
            <img
              src={badge.src}
              alt={badge.alt}
              className="holiday-badges__image"
            />
          </figure>
        ))}
      </section>
    </main>
  );
};
