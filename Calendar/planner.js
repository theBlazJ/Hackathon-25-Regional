let ZAP_PENALTY = 5;
let UCI_PON_PENALTY = 3;
// preporst A*, ki na podlagi podenage urnika posice optimalen nacin ucenja -> moznosti ndagradnje (da bi se prilagajal glede na njegov useh)
// imel dodane naloge, da bi preverjal kako gre in sp prilagodil, boljsa heuristika, ki si sama uci
// trenutno kaznuje, ce je ponovitev takoj po ucenju (isti predmet) in ce je isti tip predmeta ala mat in fiz al pa zgo in bio
// takoj zaporedoma, pa pac da je vse not se pazi
class AStarSchedule {
    constructor(subjects, existingActivities = []) {
        this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        this.hours = [8, 9, 10, 11, 12];
        this.subjects = subjects;
        this.slots = this.createSlots(existingActivities);
        this.requirements = this.buildRequirements();
    }

    createSlots(existingActivities) {
        const slots = [];
        for (let d = 0; d < this.days.length; d++) {
            for (let h = 0; h < this.hours.length; h++) {
                const day = this.days[d];
                const hour = this.hours[h];
                const existing = existingActivities.find(
                    ea => ea.day === day && ea.hour === hour
                );
                if (existing) {
                    slots.push({
                        day,
                        hour,
                        locked: true,
                        activity: existing.activity,
                        subject: null,
                        type: "busy"
                    });
                } else {
                    slots.push({
                        day,
                        hour,
                        locked: false,
                        activity: null,
                        subject: null,
                        type: null
                    });
                }
            }
        }
        return slots;
    }

    buildRequirements() {
        const req = {};
        this.subjects.forEach(sub => {
            if (sub.subject_type === 0) {
                const learnCount = Math.ceil(sub.snov / 2);
                const revCount = Math.floor(sub.snov / 2);
                req[sub.name] = {
                    neededLearning: learnCount,
                    neededRevision: revCount
                };
            } else {
                req[sub.name] = {
                    neededLearning: sub.snov,
                    neededRevision: 0
                };
            }
        });
        return req;
    }

    createInitialState() {
        return {
            index: 0,
            schedule: this.slots.map(s => ({ ...s })),
            coverage: this.initCoverage(),
            cost: 0,
            consecutiveLearning: 0,
            consecutiveRevision: 0
        };
    }

    initCoverage() {
        const cov = {};
        this.subjects.forEach(s => {
            cov[s.name] = { learning: 0, revision: 0 };
        });
        return cov;
    }

    isGoal(state) {
        return state.index >= state.schedule.length;
    }

    getNextStates(current) {
        const nextIndex = current.index;
        if (nextIndex >= current.schedule.length) return [];

        const slot = current.schedule[nextIndex];
        if (slot.locked) {
            const lockedState = this.deepCopyState(current);
            lockedState.index++;
            lockedState.consecutiveLearning = 0;
            lockedState.consecutiveRevision = 0;
            return [lockedState];
        }
        const nextStates = [];
        {
            const freeState = this.deepCopyState(current);
            freeState.schedule[nextIndex].activity = "free";
            freeState.schedule[nextIndex].type = "free";
            freeState.consecutiveLearning = 0;
            freeState.consecutiveRevision = 0;
            freeState.index++;
            nextStates.push(freeState);
        }
        for (const subj of this.subjects) {
            const learnState = this.deepCopyState(current);
            learnState.schedule[nextIndex].activity = "learning";
            learnState.schedule[nextIndex].type = "learning";
            learnState.schedule[nextIndex].subject = subj.name;
            learnState.coverage[subj.name].learning++;
            learnState.cost += this.actionCost(current, {
                category: "learning",
                subject: subj.name
            });
            learnState.consecutiveLearning++;
            learnState.consecutiveRevision = 0;
            learnState.index++;
            nextStates.push(learnState);
        }

        for (const subj of this.subjects) {
            if (subj.subject_type === 0 && current.coverage[subj.name].learning > 0) {
                const revState = this.deepCopyState(current);
                revState.schedule[nextIndex].activity = "revision";
                revState.schedule[nextIndex].type = "revision";
                revState.schedule[nextIndex].subject = subj.name;
                revState.coverage[subj.name].revision++;
                revState.cost += this.actionCost(current, {
                    category: "revision",
                    subject: subj.name
                });
                revState.consecutiveRevision++;
                revState.consecutiveLearning = 0;

                revState.index++;
                nextStates.push(revState);
            }
        }

        return nextStates;
    }
    actionCost(state, action) {
        let cost = 0;
        if (action.category === "learning") {
            if (state.consecutiveLearning >= 2) {
                cost += ZAP_PENALTY;
            }
        } else if (action.category === "revision") {
            if (state.consecutiveRevision >= 2) {
                cost += ZAP_PENALTY;
            }
        }
        if (action.subject) {
            const neededLearning = this.requirements[action.subject].neededLearning;
            const neededRevision = this.requirements[action.subject].neededRevision;
            const currentLearning = state.coverage[action.subject].learning;
            const currentRevision = state.coverage[action.subject].revision;

            if (action.category === "learning" && currentLearning >= neededLearning) {
                cost += 2;
            } else if (action.category === "revision" && currentRevision >= neededRevision) {
                cost += 2;
            }
        }
        const prevIndex = state.index - 1;
        if (prevIndex >= 0) {
            const prevSlot = state.schedule[prevIndex];
            if (
                prevSlot &&
                !prevSlot.locked &&
                prevSlot.subject === action.subject &&
                prevSlot.type === "learning" &&
                action.category === "revision"
            ) {
                cost += UCI_PON_PENALTY;
            }
        }

        return cost;
    }

    // Simple heuristic: add 3 points for each missing required session.
    heuristic(state) {
        let penalty = 0;
        for (const subj of this.subjects) {
            const cov = state.coverage[subj.name];
            const req = this.requirements[subj.name];
            const missingLearn = Math.max(0, req.neededLearning - cov.learning);
            const missingRev = Math.max(0, req.neededRevision - cov.revision);
            penalty += 3 * (missingLearn + missingRev);
        }
        return penalty;
    }

    deepCopyState(st) {
        return {
            index: st.index,
            schedule: st.schedule.map(s => ({ ...s })),
            coverage: JSON.parse(JSON.stringify(st.coverage)),
            cost: st.cost,
            consecutiveLearning: st.consecutiveLearning,
            consecutiveRevision: st.consecutiveRevision
        };
    }

    optimize() {
        const initial = this.createInitialState();
        let openSet = [initial];
        let bestGoal = null;

        while (openSet.length > 0) {
            openSet.sort(
                (a, b) => (a.cost + this.heuristic(a)) - (b.cost + this.heuristic(b))
            );
            const current = openSet.shift();

            if (this.isGoal(current)) {
                bestGoal = current;
                break;
            }

            const children = this.getNextStates(current);
            openSet.push(...children);
        }
        return bestGoal;
    }

    printSchedule(state) {
        if (!state) {
            console.log("No valid schedule found.");
            return;
        }
        console.log("Final Schedule (Mon–Fri, 8–12):");

        // Group by day
        const grouped = {};
        this.days.forEach(day => {
            grouped[day] = [];
        });
        for (const slot of state.schedule) {
            grouped[slot.day].push(slot);
        }
        for (const day of this.days) {
            grouped[day].sort((a, b) => a.hour - b.hour);
        }
        this.days.forEach(day => {
            console.log(`--- ${day} ---`);
            grouped[day].forEach(s => {
                const hourStr = `${s.hour}:00`;
                if (s.locked) {
                    console.log(`  ${hourStr} - [LOCKED: ${s.activity}]`);
                } else if (!s.activity) {
                    console.log(`  ${hourStr} - (empty)`);
                } else if (s.type === "busy") {
                    console.log(`  ${hourStr} - Busy (Locked)`);
                } else if (s.type === "free") {
                    console.log(`  ${hourStr} - Free time`);
                } else {
                    console.log(`  ${hourStr} - ${s.type.toUpperCase()} ${s.subject}`);
                }
            });
        });
    }
}

const subjects = [
    { name: "History", subject_type: 0, snov: 3 },
    { name: "Math", subject_type: 1, snov: 2 },
    { name: "Science", subject_type: 0, snov: 2 }
];

const existingActivities = [
    { day: "Monday", hour: 9, activity: "English Class" },
    { day: "Wednesday", hour: 8, activity: "Morning Meeting" },
    { day: "Friday", hour: 10, activity: "School Assembly" }
];

const scheduler = new AStarSchedule(subjects, existingActivities);
const resultState = scheduler.optimize();
scheduler.printSchedule(resultState);
