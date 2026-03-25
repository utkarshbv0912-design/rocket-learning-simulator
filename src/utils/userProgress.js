const KEY = "rocketlab_progress";

export const ACHIEVEMENTS = [
  { id: "first_launch", emoji: "🚀", title: "First Launch", desc: "Run your first rocket simulation", points: 10 },
  { id: "reach_10km", emoji: "⛰️", title: "Mountain High", desc: "Reach 10 km altitude", points: 20 },
  { id: "reach_space", emoji: "🌍", title: "Edge of Space", desc: "Cross the Kármán line (100 km)", points: 50 },
  { id: "reach_orbit", emoji: "🛰️", title: "Orbital Insertion", desc: "Reach orbital velocity (7,800 m/s)", points: 100 },
  { id: "escape_earth", emoji: "🌌", title: "Escape Artist", desc: "Reach Earth escape velocity (11,200 m/s)", points: 200 },
  { id: "perfect_twr", emoji: "⚖️", title: "Balanced Design", desc: "Launch with TWR between 1.5 and 2.0", points: 30 },
  { id: "fuel_efficient", emoji: "💡", title: "Fuel Miser", desc: "Reach 100 km using under 500 kg fuel", points: 75 },
  { id: "speed_demon", emoji: "⚡", title: "Speed Demon", desc: "Exceed 5,000 m/s", points: 60 },
  { id: "lesson_1", emoji: "📖", title: "Student", desc: "Complete your first AI lesson", points: 15 },
  { id: "lesson_5", emoji: "🎓", title: "Scholar", desc: "Complete 5 AI lessons", points: 40 },
  { id: "lesson_10", emoji: "🏫", title: "Academic", desc: "Complete 10 AI lessons", points: 80 },
  { id: "builder_1", emoji: "🔧", title: "Builder", desc: "Build your first custom rocket", points: 25 },
  { id: "mission_1", emoji: "🎯", title: "Mission Accepted", desc: "Complete your first mission", points: 35 },
  { id: "five_launches", emoji: "🔥", title: "Launch Veteran", desc: "Run 5 simulations", points: 50 },
  { id: "saved_rocket", emoji: "💾", title: "Archivist", desc: "Save a custom rocket preset", points: 20 },
];

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null") || {
      name: "Explorer",
      totalPoints: 0,
      achievements: [],
      launchCount: 0,
      lessonCount: 0,
      missionCount: 0,
      joinedAt: new Date().toISOString(),
    };
  } catch { return { name: "Explorer", totalPoints: 0, achievements: [], launchCount: 0, lessonCount: 0, missionCount: 0, joinedAt: new Date().toISOString() }; }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function awardAchievement(id) {
  const p = getProgress();
  if (p.achievements.includes(id)) return { progress: p, newAchievement: null };
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return { progress: p, newAchievement: null };
  p.achievements.push(id);
  p.totalPoints += ach.points;
  saveProgress(p);
  return { progress: p, newAchievement: ach };
}

export function checkLaunchAchievements(simResults) {
  const p = getProgress();
  p.launchCount = (p.launchCount || 0) + 1;
  saveProgress(p);

  const newOnes = [];
  const tryAward = (id) => {
    const { newAchievement } = awardAchievement(id);
    if (newAchievement) newOnes.push(newAchievement);
  };

  tryAward("first_launch");
  if (p.launchCount >= 5) tryAward("five_launches");
  if (simResults.maxHeight >= 10000) tryAward("reach_10km");
  if (simResults.maxHeight >= 100000) tryAward("reach_space");
  if (simResults.maxVelocity >= 7800) tryAward("reach_orbit");
  if (simResults.maxVelocity >= 11200) tryAward("escape_earth");
  if (simResults.maxVelocity >= 5000) tryAward("speed_demon");
  if (simResults.twr >= 1.5 && simResults.twr <= 2.0) tryAward("perfect_twr");
  if (simResults.maxHeight >= 100000 && simResults.fuel <= 500) tryAward("fuel_efficient");

  return newOnes;
}

export function checkLessonAchievement() {
  const p = getProgress();
  p.lessonCount = (p.lessonCount || 0) + 1;
  saveProgress(p);
  const newOnes = [];
  const tryAward = (id) => { const { newAchievement } = awardAchievement(id); if (newAchievement) newOnes.push(newAchievement); };
  tryAward("lesson_1");
  if (p.lessonCount >= 5) tryAward("lesson_5");
  if (p.lessonCount >= 10) tryAward("lesson_10");
  return newOnes;
}

export function checkBuilderAchievement() {
  const { newAchievement } = awardAchievement("builder_1");
  return newAchievement ? [newAchievement] : [];
}

export function checkSavedRocketAchievement() {
  const { newAchievement } = awardAchievement("saved_rocket");
  return newAchievement ? [newAchievement] : [];
}

export function getLevel(points) {
  if (points >= 500) return { label: "Rocket Scientist", emoji: "🔬", color: "text-purple-400" };
  if (points >= 250) return { label: "Aerospace Engineer", emoji: "🛸", color: "text-blue-400" };
  if (points >= 100) return { label: "Pilot", emoji: "✈️", color: "text-cyan-400" };
  if (points >= 40) return { label: "Cadet", emoji: "🎓", color: "text-green-400" };
  return { label: "Rookie", emoji: "🌱", color: "text-muted-foreground" };
}
