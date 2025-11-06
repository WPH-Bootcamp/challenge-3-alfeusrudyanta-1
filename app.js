'use strict';

// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Alfeus Rudyanta
// KELAS: WPH-REP
// TANGGAL: 04 Nov 2025
// ============================================

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 seconds
const DAYS_IN_WEEK = 7;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================

const userProfile = {
  name: 'User',
  joinDate: new Date(),
  totalHabits: 0,
  completedThisWeek: 0,

  // Update totalHabits and completedThisWeek
  updateStats(habits) {
    this.totalHabits = habits.length;
    this.completedThisWeek = habits.filter((habit) =>
      habit.isCompletedThisWeek()
    ).length;
  },

  // Get how many days since user joined
  getDaysJoined() {
    const now = new Date();
    const diff = Math.floor(
      (now - new Date(this.joinDate)) / (1000 * 60 * 60 * 24)
    );
    return diff;
  },
};

// ============================================
// HABIT CLASS
// ============================================

class Habit {
  static id = 1;

  constructor(name, targetFrequency) {
    this.id = Habit.id++;
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = [];
    this.createdAt = new Date();
  }

  markComplete() {
    const currentDay = new Date().toDateString();
    if (!this.completions.includes(currentDay)) {
      this.completions.push(currentDay);
      console.log('Habit has been marked complete for today.');
    } else {
      console.log('Habit is already marked complete for today.');
    }
  }

  getThisWeekCompletions() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return this.completions.filter((date) => {
      const d = new Date(date);
      return d >= startOfWeek;
    });
  }

  isCompletedThisWeek() {
    return this.getThisWeekCompletions().length >= this.targetFrequency;
  }

  getProgressPercentage() {
    const progress = Math.min(
      this.getThisWeekCompletions().length / this.targetFrequency,
      1
    );
    return Math.round(progress * 100);
  }

  getStatus() {
    return this.isCompletedThisWeek() ? 'Completed' : 'Active';
  }
}

// ============================================
// HABIT TRACKER CLASS
// ============================================

class HabitTracker {
  constructor() {
    this.habits = [];
    this.reminder = null;
    this.loadFromFile();
  }

  // Add new Habit based on Habit class
  addHabit(name, frequency) {
    const data = new Habit(name, frequency);
    this.habits.push(data);
    this.saveToFile();
    console.log('New habit added to the tracker!');
  }

  completeHabit(habitIndex) {
    // In displayed habit, index is +1, therefore to target the correct index, index must be -1
    const habit = this.habits[habitIndex - 1] ?? null;
    if (!habit) {
      console.log('Index is not valid');
      return;
    }

    habit.markComplete();
    this.saveToFile();
  }

  deleteHabit(habitIndex) {
    // In displayed habit, index is +1, therefore to target the correct index, index must be -1
    const habit = this.habits[habitIndex - 1] ?? null;
    if (!habit) {
      console.log('Index is not valid');
      return;
    }

    console.log(`Habit ${habit.name} had been deleted.`);
    this.habits.splice(habitIndex - 1, 1);
    this.saveToFile();
  }

  displayProfile() {
    userProfile.updateStats(this.habits);
    console.log('\n===== User Profile =====');
    console.log(`Name: ${userProfile.name}`);
    console.log(`Days Joined: ${userProfile.getDaysJoined()} day(s)`);
    console.log(`Total Habits: ${userProfile.totalHabits}`);
    console.log(`Completed This Week: ${userProfile.completedThisWeek}`);
    console.log('=============================\n');
  }

  displayHabits(filter = 'all') {
    let list = [];

    if (filter === 'active') {
      list = this.habits.filter((habit) => !habit.isCompletedThisWeek());
    } else if (filter === 'completed') {
      list = this.habits.filter((habit) => habit.isCompletedThisWeek());
    } else {
      list = this.habits;
    }

    if (list.length === 0) {
      console.log(`Habits list is empty.`);
      return;
    }

    // use forEach to display all the habits according to the template
    list.forEach((habit, index) => {
      const percentage = habit.getProgressPercentage();
      const filled = '█'.repeat(Math.round(percentage / 10));
      const empty = '░'.repeat(10 - Math.round(percentage / 10));

      console.log(`${index + 1}. [${habit.getStatus()}] ${habit.name}`);
      console.log(`   Target: ${habit.targetFrequency}x/week`);
      console.log(
        `   Progress: ${habit.getThisWeekCompletions().length}/${
          habit.targetFrequency
        } (${percentage}%)`
      );
      console.log(`   Progress Bar: ${filled}${empty} ${percentage}%\n`);
    });
  }

  displayHabitsWithWhile() {
    console.log('===== Demo With While =====');
    let i = 0;
    while (i < this.habits.length) {
      const percentage = this.habits[i].getProgressPercentage();
      const filled = '█'.repeat(Math.round(percentage / 10));
      const empty = '░'.repeat(10 - Math.round(percentage / 10));

      console.log(
        `${i + 1}. [${this.habits[i].getStatus()}] Name: ${this.habits[i].name}`
      );
      console.log(`   Target: ${this.habits[i].targetFrequency}x/week`);
      console.log(
        `   Progress: ${this.habits[i].getThisWeekCompletions().length}/${
          this.habits[i].targetFrequency
        } (${percentage}%)`
      );
      console.log(`   Progress Bar: ${filled}${empty} ${percentage}%\n`);
      i++;
    }
  }

  displayHabitsWithFor() {
    console.log('===== Demo With For =====');
    for (let i = 0; i < this.habits.length; i++) {
      const percentage = this.habits[i].getProgressPercentage();
      const filled = '█'.repeat(Math.round(percentage / 10));
      const empty = '░'.repeat(10 - Math.round(percentage / 10));

      console.log(
        `${i + 1}. [${this.habits[i].getStatus()}] Name: ${this.habits[i].name}`
      );
      console.log(`   Target: ${this.habits[i].targetFrequency}x/week`);
      console.log(
        `   Progress: ${this.habits[i].getThisWeekCompletions().length}/${
          this.habits[i].targetFrequency
        } (${percentage}%)`
      );
      console.log(`   Progress Bar: ${filled}${empty} ${percentage}%\n`);
    }
  }

  displayStats() {
    const completed = this.habits.filter((habit) =>
      habit.isCompletedThisWeek()
    ).length;
    const active = this.habits.filter(
      (habit) => !habit.isCompletedThisWeek()
    ).length;

    console.log('\n===== Statistic =====');
    console.log(`Total habit(s): ${this.habits.length}`);
    console.log(`Completed habit(s): ${completed}`);
    console.log(`Active habit(s): ${active}`);
    console.log('=====================\n');
  }

  // Previous reminder must be stopped before new reminder
  startReminder() {
    this.stopReminder();
    this.reminder = setInterval(() => this.showReminder(), REMINDER_INTERVAL);
  }

  showReminder() {
    const today = new Date().toDateString();
    const active = this.habits.filter(
      (habit) => !habit.completions.includes(today)
    );

    // In case active habit is 0, do not do anything
    if (active.length === 0) return;

    const randomIndex = Math.floor(Math.random() * active.length);

    console.log('\n==================================================');
    console.log(`Reminder: Do not forget to '${active[randomIndex].name}'`);
    console.log('==================================================\n');
  }

  stopReminder() {
    if (this.reminder) {
      clearInterval(this.reminder);
    }
  }

  saveToFile() {
    const data = {
      habits: this.habits,
      user: userProfile,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  loadFromFile() {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      this.habits = (data.habits ?? []).map((h) =>
        Object.assign(new Habit(), h)
      );
      Object.assign(userProfile, data.user ?? {});
    }
  }

  clearAllData() {
    this.habits = [];
    this.saveToFile();
    console.log('All data had been deleted!');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const askQuestion = (question) => {
  return new Promise((res) => rl.question(question, (answer) => res(answer)));
};

const displayMenu = () => {
  console.log(`
==================================================
HABIT TRACKER - MAIN MENU
==================================================
1. View Profile
2. View All Habit(s)
3. View Active Habit(s)
4. View Completed Habit(s)
5. Add New Habit
6. Mark Completed Habit
7. Delete Habit
8. See Statistic
9. Demo Loop (while/for)
0. Exit
==================================================
`);
};

const handleMenu = async (tracker) => {
  let exit = false;
  while (!exit) {
    displayMenu();
    const choice = await askQuestion('Select menu: ');

    switch (choice) {
      case '1':
        tracker.displayProfile();
        break;
      case '2':
        tracker.displayHabits();
        break;
      case '3':
        tracker.displayHabits('active');
        break;
      case '4':
        tracker.displayHabits('completed');
        break;
      case '5':
        const name = await askQuestion('Enter habit name: ');
        const frequency = parseInt(await askQuestion('Target per week: '));
        tracker.addHabit(name, frequency);
        break;
      case '6':
        tracker.displayHabits();
        const index = parseInt(await askQuestion('Enter habit number: '));
        tracker.completeHabit(index);
        break;
      case '7':
        tracker.displayHabits();
        const delIndex = await askQuestion('Enter habit number: ');
        tracker.deleteHabit(delIndex);
        break;
      case '8':
        tracker.displayStats();
        break;
      case '9':
        tracker.displayHabitsWithWhile();
        tracker.displayHabitsWithFor();
        break;
      case '0':
        console.log('Exiting...');
        tracker.stopReminder();
        exit = true;
        rl.close();
        break;
      default:
        console.log('Invalid option!');
    }
  }
};

// ============================================
// MAIN FUNCTION
// ============================================

const main = async () => {
  try {
    const tracker = new HabitTracker();
    tracker.startReminder();
    await handleMenu(tracker);
  } catch (e) {
    console.error('Error found: ', e);
  }
};

main();
