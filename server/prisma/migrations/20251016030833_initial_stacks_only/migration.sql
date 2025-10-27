-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "blockchainAddress" TEXT,
    "blockchainConnected" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "category" TEXT[],
    "gameType" TEXT NOT NULL DEFAULT 'web2',
    "minPlayers" INTEGER NOT NULL DEFAULT 1,
    "maxPlayers" INTEGER NOT NULL DEFAULT 10,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedDuration" INTEGER,
    "controls" TEXT[],
    "features" JSONB,
    "howToPlay" JSONB,
    "tips" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_achievements" (
    "id" TEXT NOT NULL,
    "gameTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "criteria" JSONB NOT NULL,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_content" (
    "id" TEXT NOT NULL,
    "gameTypeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "data" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_rooms" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameTypeId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "currentPlayers" INTEGER NOT NULL DEFAULT 0,
    "hasPassword" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "game_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "gameRoomId" TEXT,
    "gameTypeId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "gameData" JSONB,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER,
    "deaths" INTEGER,
    "lapTime" INTEGER,
    "questionsRight" INTEGER,
    "questionsTotal" INTEGER,
    "rank" INTEGER,
    "performance" JSONB,
    "achievements" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameTypeId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "highestScore" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalKills" INTEGER DEFAULT 0,
    "totalDeaths" INTEGER DEFAULT 0,
    "bestLapTime" INTEGER,
    "totalRaceTime" INTEGER,
    "questionsAnswered" INTEGER DEFAULT 0,
    "questionsCorrect" INTEGER DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageRank" DOUBLE PRECISION,
    "lastPlayedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboards" (
    "id" TEXT NOT NULL,
    "gameTypeId" TEXT,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "rankings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_blockchainAddress_key" ON "users"("blockchainAddress");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_blockchainAddress_idx" ON "users"("blockchainAddress");

-- CreateIndex
CREATE UNIQUE INDEX "game_types_code_key" ON "game_types"("code");

-- CreateIndex
CREATE INDEX "game_types_code_idx" ON "game_types"("code");

-- CreateIndex
CREATE INDEX "game_types_gameType_idx" ON "game_types"("gameType");

-- CreateIndex
CREATE INDEX "game_types_category_idx" ON "game_types"("category");

-- CreateIndex
CREATE INDEX "game_types_isActive_idx" ON "game_types"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "game_achievements_code_key" ON "game_achievements"("code");

-- CreateIndex
CREATE INDEX "game_achievements_gameTypeId_idx" ON "game_achievements"("gameTypeId");

-- CreateIndex
CREATE INDEX "game_achievements_code_idx" ON "game_achievements"("code");

-- CreateIndex
CREATE INDEX "game_content_gameTypeId_type_idx" ON "game_content"("gameTypeId", "type");

-- CreateIndex
CREATE INDEX "game_content_category_idx" ON "game_content"("category");

-- CreateIndex
CREATE UNIQUE INDEX "game_rooms_roomId_key" ON "game_rooms"("roomId");

-- CreateIndex
CREATE INDEX "game_rooms_roomId_idx" ON "game_rooms"("roomId");

-- CreateIndex
CREATE INDEX "game_rooms_status_idx" ON "game_rooms"("status");

-- CreateIndex
CREATE INDEX "game_rooms_gameTypeId_idx" ON "game_rooms"("gameTypeId");

-- CreateIndex
CREATE INDEX "game_sessions_gameRoomId_idx" ON "game_sessions"("gameRoomId");

-- CreateIndex
CREATE INDEX "game_sessions_gameTypeId_idx" ON "game_sessions"("gameTypeId");

-- CreateIndex
CREATE INDEX "game_sessions_status_idx" ON "game_sessions"("status");

-- CreateIndex
CREATE INDEX "game_results_sessionId_idx" ON "game_results"("sessionId");

-- CreateIndex
CREATE INDEX "game_results_playerId_idx" ON "game_results"("playerId");

-- CreateIndex
CREATE INDEX "player_stats_userId_idx" ON "player_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_userId_gameTypeId_key" ON "player_stats"("userId", "gameTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "leaderboards_gameTypeId_period_idx" ON "leaderboards"("gameTypeId", "period");

-- CreateIndex
CREATE INDEX "leaderboards_periodStart_idx" ON "leaderboards"("periodStart");

-- AddForeignKey
ALTER TABLE "game_achievements" ADD CONSTRAINT "game_achievements_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_content" ADD CONSTRAINT "game_content_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rooms" ADD CONSTRAINT "game_rooms_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rooms" ADD CONSTRAINT "game_rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_gameRoomId_fkey" FOREIGN KEY ("gameRoomId") REFERENCES "game_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
