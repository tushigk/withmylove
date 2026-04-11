import { Schema, model, models } from "mongoose";

const JournalSchema = new Schema({
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  location: { type: String },
  liked: { type: Boolean, default: false }
}, { timestamps: true });

const MoodSchema = new Schema({
  user: { type: String, required: true },
  date: { type: Date, default: Date.now },
  mood: { type: String, required: true },
  label: { type: String, required: true },
  partnerNudged: { type: Boolean, default: false }
}, { timestamps: true });
const MessageSchema = new Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  unlockAt: { type: Date },
  isOpen: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false }
}, { timestamps: true });

const ReminderSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['anniversary', 'birthday', 'event'], default: 'event' }
}, { timestamps: true });

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Force remove Mood model if it exists to refresh schema in development
if (models.Mood) {
  delete models.Mood;
}

export const Journal = models.Journal || model("Journal", JournalSchema);
export const Mood = model("Mood", MoodSchema);
export const Message = models.Message || model("Message", MessageSchema);
export const Reminder = models.Reminder || model("Reminder", ReminderSchema);
export const User = models.User || model("User", UserSchema);
