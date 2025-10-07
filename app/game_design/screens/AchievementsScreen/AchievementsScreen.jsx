import { ArrowLeftIcon, AwardIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";

const achievementCards = [
  {
    id: 1,
    title: "Ranked",
    rank: "Star",
    progress: 100,
    badgeType: "green",
    icon: "https://c.animaapp.com/mgfpwrfng3SrMs/img/vector.svg",
    groupImage: "https://c.animaapp.com/mgfpwrfng3SrMs/img/group-107.png",
  },
  {
    id: 2,
    title: "Streaks",
    rank: "Freshman",
    progress: 0,
    badgeType: "gray",
    icon: "https://c.animaapp.com/mgfpwrfng3SrMs/img/3dicons-fire-iso-color.png",
    groupImage: "https://c.animaapp.com/mgfpwrfng3SrMs/img/group-107-3.png",
  },
  {
    id: 3,
    title: "Strength",
    rank: "Sophomore",
    progress: 75,
    badgeType: "green",
    icon: "https://c.animaapp.com/mgfpwrfng3SrMs/img/3dicons-gym-iso-color.png",
    groupImage: "https://c.animaapp.com/mgfpwrfng3SrMs/img/group-107-2.png",
  },
  {
    id: 4,
    title: "Holidays",
    rank: "Sophomore",
    progress: 75,
    badgeType: "pink",
    icon: "https://c.animaapp.com/mgfpwrfng3SrMs/img/valentines-day.svg",
    groupImage: "https://c.animaapp.com/mgfpwrfng3SrMs/img/group-107-1.png",
  },
];

export const AchievementsScreen = (): JSX.Element => {
  const navigate = useNavigate();

  const handleAchievementClick = (title: string) => {
    if (title === "Holidays") {
      navigate("/holiday-badges");
    }
    // Add other navigation logic for other achievement types here
  };

  return (
    <div
      className="bg-graysgray-4 w-full min-w-[430px] min-h-screen flex flex-col relative"
      data-model-id="1:2739"
    >
      <header className="w-full bg-[#235dff] relative">
        <div className="w-full h-[259px] bg-[url(https://c.animaapp.com/mgfpwrfng3SrMs/img/image.png)] bg-cover bg-[50%_50%]">
          <div className="absolute top-[40px] left-[40px] right-[40px] bottom-[82px] flex items-start justify-end">
            <div className="relative w-[163px] h-[177px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
              <img
                className="absolute w-full h-full top-[-13.05%] left-[-12.02%]"
                alt="Design wizard badges"
                src="https://c.animaapp.com/mgfpwrfng3SrMs/img/design-wizard-badges.svg"
              />
              <img
                className="absolute w-[41.82%] h-[41.82%] top-[29.09%] left-[29.09%] object-cover"
                alt="Element gym dynamic"
                src="https://c.animaapp.com/mgfpwrfng3SrMs/img/3dicons-gym-dynamic-color.png"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-11 flex items-center px-[23px] justify-between">
          <div className="flex items-center justify-center h-[26px] [font-family:'Urbanist',Helvetica] font-semibold text-white text-base tracking-[0.20px] leading-[25.6px] whitespace-nowrap">
            9:41
          </div>

          <div className="flex items-center gap-[5px]">
            <img
              className="w-[18px] h-2.5"
              alt="Signal"
              src="https://c.animaapp.com/mgfpwrfng3SrMs/img/group.png"
            />
            <div className="w-[15.27px] h-[10.97px] bg-[url(https://c.animaapp.com/mgfpwrfng3SrMs/img/union.svg)] bg-[100%_100%]" />
            <img
              className="w-[26.98px] h-[13px]"
              alt="Battery"
              src="https://c.animaapp.com/mgfpwrfng3SrMs/img/group-1.png"
            />
          </div>
        </div>

        <button className="absolute top-[64px] left-[22px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <ArrowLeftIcon className="w-6 h-[22px] text-white" />
        </button>

        <div className="absolute top-[115px] left-[30px] flex flex-col gap-px translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:300ms]">
          <h1 className="[font-family:'Urbanist',Helvetica] font-bold text-white text-3xl tracking-[0] leading-[48px] whitespace-nowrap">
            My Achievements
          </h1>

          <Badge className="inline-flex items-center gap-[4.46px] px-[8.93px] py-[5.58px] bg-m-3white rounded-[55.79px] h-auto w-fit">
            <AwardIcon className="w-[11.16px] h-[11.16px] text-m-3black" />
            <span className="font-m3-label-large font-[number:var(--m3-label-large-font-weight)] text-m-3black text-[length:var(--m3-label-large-font-size)] tracking-[var(--m3-label-large-letter-spacing)] leading-[var(--m3-label-large-line-height)]">
              AwardIcon&nbsp;&nbsp;&nbsp;&nbsp;1/10
            </span>
          </Badge>
        </div>
      </header>

      <main className="flex-1 px-[17.5px] pt-[73px] pb-[21px]">
        <div className="grid grid-cols-2 gap-[9px] max-w-[395px] mx-auto">
          {achievementCards.map((achievement, index) => (
            <Card
              key={achievement.id}
              className={`${
                achievement.badgeType === "gray" ? "bg-[#bfbfbf]" : "bg-white"
              } rounded-[10px] shadow-[0px_1.28px_32.96px_#d8e5ec] border-0 translate-y-[-1rem] animate-fade-in opacity-0 cursor-pointer hover:scale-105 transition-transform`}
              style={
                {
                  "--animation-delay": `${600 + index * 100}ms`,
                } as React.CSSProperties
              }
              onClick={() => handleAchievementClick(achievement.title)}
            >
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-[10px] [font-family:'Urbanist',Helvetica] font-bold text-black text-center mb-[11px]">
                  {achievement.title}
                </div>

                <div className="relative w-32 h-32 mb-3">
                  {achievement.badgeType === "green" && (
                    <>
                      <div className="absolute top-[26px] left-[26px] w-[76px] h-[76px] rounded-[5.61px] rotate-45 shadow-[inset_0px_2.24px_6.17px_#a4ffa499,inset_0px_-3.93px_4.49px_#058105] bg-[linear-gradient(120deg,rgba(97,223,97,1)_0%,rgba(22,132,22,1)_100%)]" />
                      <div className="absolute top-[26px] left-[26px] w-[76px] h-[76px] rounded-[5.61px] bg-[linear-gradient(153deg,rgba(121,240,122,1)_0%,rgba(31,146,31,1)_100%)]" />
                      <div className="absolute top-[34px] left-[34px] w-[61px] h-[61px] rounded-[2.81px] border-[none] shadow-[inset_0px_0px_25.25px_#016803] bg-[linear-gradient(180deg,rgba(0,89,0,0)_0%,rgba(0,89,0,0.2)_100%),radial-gradient(50%_50%_at_27%_33%,rgba(255,255,255,0.29)_0%,rgba(255,255,255,0)_100%),radial-gradient(50%_50%_at_50%_52%,rgba(15,219,12,1)_0%,rgba(8,150,4,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-[4.49px] before:rounded-[2.81px] before:[background:linear-gradient(180deg,rgba(32,146,32,1)_0%,rgba(122,241,122,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none" />
                      <div className="absolute top-[33px] left-[33px] w-[62px] h-[62px] rounded-[7.6px] border-[none] opacity-[0.47] before:content-[''] before:absolute before:inset-0 before:p-[0.54px] before:rounded-[7.6px] before:[background:linear-gradient(160deg,rgba(175,255,175,1)_0%,rgba(70,193,70,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none" />
                    </>
                  )}

                  {achievement.badgeType === "gray" && (
                    <>
                      <div className="absolute top-[26px] left-[26px] w-[76px] h-[76px] rounded-[5.61px] rotate-45 shadow-[inset_0px_2.24px_6.17px_#dce0dc99,inset_0px_-3.93px_4.49px_#868986] bg-[linear-gradient(120deg,rgba(220,224,220,1)_0%,rgba(137,142,137,1)_100%)]" />
                      <div className="absolute top-[26px] left-[26px] w-[76px] h-[76px] rounded-[5.61px] bg-[linear-gradient(153deg,rgba(222,222,222,1)_0%,rgba(151,157,151,1)_100%)]" />
                      <div className="absolute top-[33px] left-[33px] w-[62px] h-[62px] rounded-[7.6px] border-[none] opacity-[0.47] before:content-[''] before:absolute before:inset-0 before:p-[0.54px] before:rounded-[7.6px] before:[background:linear-gradient(160deg,rgba(237,249,237,1)_0%,rgba(186,192,186,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none" />
                    </>
                  )}

                  {achievement.id === 4 && (
                    <img
                      className="absolute top-0 left-0 w-full h-full"
                      alt="Valentines day"
                      src={achievement.icon}
                    />
                  )}

                  {achievement.id !== 4 && (
                    <img
                      className="absolute top-[38px] left-[38px] w-[52px] h-[52px] object-cover"
                      alt={achievement.title}
                      src={achievement.icon}
                    />
                  )}
                </div>

                <div className="relative w-full">
                  <img
                    className="w-full h-auto"
                    alt="Group"
                    src={achievement.groupImage}
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
                    <div className="bg-grayswhite px-3 py-1 rounded-md shadow-sm">
                      <span className="[font-family:'Urbanist',Helvetica] font-bold text-grayswhite text-[10px]">
                        {achievement.rank}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-2 flex items-center gap-2">
                  <span className="[font-family:'Roboto',Helvetica] font-semibold text-[#36454f] text-[9px] whitespace-nowrap">
                    {achievement.progress}%
                  </span>
                  <div className="flex-1 relative">
                    <div className="w-full h-[6px] bg-[#d9d9d9] rounded-[5px]" />
                    <div
                      className="absolute top-0 left-0 h-[6px] bg-[#235dff] rounded-[5px]"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="w-full flex items-center justify-center pb-2">
        <div className="w-[139px] h-[5px] bg-graysblack rounded-[100px]" />
      </footer>
    </div>
  );
};
