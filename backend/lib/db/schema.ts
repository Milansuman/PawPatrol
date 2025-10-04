import { 
  pgTable, 
  text,
  uuid,
  geometry,
  pgEnum,
  integer,
  timestamp
} from "drizzle-orm/pg-core";

export const shelters = pgTable("shelters", {
  id: uuid().notNull().primaryKey(),
  name: text().notNull(),
  location: geometry({type: "point", mode: "xy", srid: 4326}).notNull(),
}).enableRLS();

export const userTypes = pgEnum("user_types", ["civilian", "shelter"]);

export const users = pgTable("users", {
  id: uuid().notNull().primaryKey(),
  name: text().notNull(),
  password: text().notNull(),
  type: userTypes().default("civilian"),
  shelterId: uuid().references(() => shelters.id, {
    onDelete: "set null"
  })
}).enableRLS();

export const dogReportTypes = pgEnum("dog_report_types", ["reported", "acknowledged", "vaccinated", "sheltered", "ignored"]);

export const dogReports = pgTable("dog_reports", {
  id: uuid().notNull().primaryKey(),
  location: geometry({type: "point", mode: "xy", srid: 4326}).notNull(),
  count: integer().default(1),
  aggressiveness: integer().default(0),
  status: dogReportTypes().default("reported"),
  createdOn: timestamp().defaultNow(),
  acknowledgedOn: timestamp(),
  reportedId: uuid().references(() => users.id, {
    onDelete: "set null"
  })
}).enableRLS();

export const dogReportMedia = pgTable("dog_reports_media", {
  id: uuid().notNull().primaryKey(),
}).enableRLS();