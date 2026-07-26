import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function main() {
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.item.deleteMany();
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // ROLES
  await prisma.role.createMany({
    data: [{ role: "ADMIN" }, { role: "USER" }],
  });

  // USERS
  const admin = await prisma.user.create({
    data: {
      firstName: "Mario",
      lastName: "Rossi",
      email: "admin@example.com",
      password: hashedPassword,
      role: { connect: { role: "ADMIN" } },
    },
  });

  const user1 = await prisma.user.create({
    data: {
      firstName: "Giuseppe",
      lastName: "Verdi",
      email: "verdi@example.com",
      password: hashedPassword,
      role: { connect: { role: "USER" } },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: "Anna",
      lastName: "Bianchi",
      email: "bianchi@example.com",
      password: hashedPassword,
      role: { connect: { role: "USER" } },
    },
  });

  await prisma.item.createMany({
    data: [
      {
        userId: user1.id,
        string: "Primo item",
        optionalEasy: "Test opzionale",
        numberDecimal: 45.5,
        data: new Date("2026-01-15"),
        dataOptional: new Date("2026-01-20"),
        enum: "ATTESA",
      },
      {
        userId: user1.id,
        string: "Secondo item",
        optionalEasy: null,
        numberDecimal: 12.0,
        data: new Date("2026-01-22"),
        dataOptional: null,
        enum: "ATTESA",
      },
      {
        userId: user2.id,
        string: "Terzo item",
        optionalEasy: "Descrizione item",
        numberDecimal: 120.0,
        data: new Date("2026-02-03"),
        dataOptional: new Date("2026-02-10"),
        enum: "ATTESA",
      },
      {
        userId: user2.id,
        string: "Quarto item",
        optionalEasy: "Altro valore",
        numberDecimal: 200.0,
        data: new Date("2026-02-18"),
        dataOptional: null,
        enum: "ATTESA",
      },
      {
        userId: user1.id,
        string: "Quinto item",
        optionalEasy: null,
        numberDecimal: 33.0,
        data: new Date("2026-03-05"),
        dataOptional: new Date("2026-03-07"),
        enum: "ATTESA",
      },
    ],
  });


  console.log("Seed completato");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });