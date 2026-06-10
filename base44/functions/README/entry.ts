// This is a Prisma schema file - keep it in your Express backend repo at: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/**
 * Trident Block Explorer - Database Schema
 * Real chain data storage for blocks, transactions, and addresses
 */

model Block {
  id        String       @id @default(cuid())
  height    Int          @unique @index
  hash      String       @unique @index
  timestamp DateTime
  txCount   Int          @default(0)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  
  transactions Transaction[]
}

model Transaction {
  id        String   @id @default(cuid())
  hash      String   @unique @index
  blockId   String?  @index
  block     Block?   @relation(fields: [blockId], references: [id], onDelete: Cascade)
  from      String   @index
  to        String   @index
  amount    Int
  status    String   @default('confirmed') // confirmed, pending, failed
  timestamp DateTime @index
  createdAt DateTime @default(now())
  
  @@index([from, timestamp])
  @@index([to, timestamp])
}

model Address {
  id        String   @id @default(cuid())
  address   String   @unique @index
  balance   Int      @default(0)
  txCount   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([balance])
  @@index([txCount])
}