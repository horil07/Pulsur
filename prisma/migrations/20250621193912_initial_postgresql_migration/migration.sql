-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('UPLOAD_REEL', 'UPLOAD_ARTWORK', 'AI_ARTWORK', 'AI_SONG');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'JUDGING', 'WINNERS_ANNOUNCED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'MOBILE_VERIFICATION');

-- CreateEnum
CREATE TYPE "ModificationType" AS ENUM ('PROMPT_MODIFICATION', 'AI_EFFECTS_ENHANCEMENT', 'STYLE_TRANSFER', 'CONTENT_REGENERATION', 'QUALITY_ENHANCEMENT');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "name" TEXT,
    "image" TEXT,
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "emailVerified" TIMESTAMP(3),
    "mobileVerified" TIMESTAMP(3),
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "preferences" JSONB,
    "trafficSource" TEXT,
    "trafficMedium" TEXT,
    "trafficCampaign" TEXT,
    "trafficReferrer" TEXT,
    "referralCode" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT,
    "type" "SubmissionType" NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "contentUrl" TEXT NOT NULL,
    "prompt" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "originalPrompt" TEXT,
    "modificationHistory" JSONB,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT,
    "assignment" TEXT,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "winnersAnnounceDate" TIMESTAMP(3),
    "maxEntriesPerUser" INTEGER NOT NULL DEFAULT 3,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "prizes" JSONB,
    "topPrize" TEXT,
    "tutorialEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tutorialSteps" JSONB,
    "onboardingFlow" JSONB,
    "hasToolkitAssets" BOOLEAN NOT NULL DEFAULT false,
    "toolkitAssets" JSONB,
    "deliverables" JSONB,
    "attachments" JSONB,
    "validationRules" JSONB,
    "contentRequirements" JSONB,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_tutorial_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_tutorial_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT,
    "draftName" TEXT,
    "type" "SubmissionType" NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "contentUrl" TEXT,
    "prompt" TEXT,
    "metadata" JSONB,
    "progress" JSONB,
    "step" INTEGER NOT NULL DEFAULT 1,
    "totalSteps" INTEGER NOT NULL DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "contentMethod" TEXT,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "stepsCompleted" JSONB,
    "lastStepReached" TEXT,
    "abandonedAt" TEXT,
    "conversionData" JSONB,
    "autoSavedAt" TIMESTAMP(3),
    "autoSaveEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoSaveInterval" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "trafficSource" TEXT,
    "trafficMedium" TEXT,
    "trafficCampaign" TEXT,
    "referrer" TEXT,
    "utmParams" TEXT,
    "landingPage" TEXT,
    "country" TEXT,
    "device" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_shares" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT,
    "platform" TEXT NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "mobile" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT,
    "submissionId" TEXT,
    "draftId" TEXT,
    "journeyStarted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journeyCompleted" TIMESTAMP(3),
    "journeyAbandoned" TIMESTAMP(3),
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "stepsData" JSONB,
    "currentStep" TEXT,
    "maxStepReached" TEXT,
    "stepTransitions" JSONB,
    "contentMethod" TEXT,
    "methodSwitches" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "loadCount" INTEGER NOT NULL DEFAULT 0,
    "regenerateCount" INTEGER NOT NULL DEFAULT 0,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "previewCount" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "deviceType" TEXT,
    "browserType" TEXT,
    "sessionId" TEXT,
    "trafficSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_modifications" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modificationType" "ModificationType" NOT NULL,
    "originalPrompt" TEXT,
    "newPrompt" TEXT,
    "aiEffects" JSONB,
    "parameters" JSONB,
    "resultUrl" TEXT,
    "previewUrl" TEXT,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_modifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_links" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "inspiredId" TEXT NOT NULL,
    "inspirationType" TEXT NOT NULL,
    "attributionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspiration_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_metadata" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "allowRemixing" BOOLEAN NOT NULL DEFAULT true,
    "inspirationData" JSONB,
    "remixCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspiration_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_submissionId_key" ON "votes"("userId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_tutorial_progress_userId_challengeId_key" ON "challenge_tutorial_progress"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "submission_drafts_userId_isActive_idx" ON "submission_drafts"("userId", "isActive");

-- CreateIndex
CREATE INDEX "submission_drafts_userId_challengeId_isActive_idx" ON "submission_drafts"("userId", "challengeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "submission_drafts_userId_challengeId_key" ON "submission_drafts"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionId_key" ON "user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "submission_analytics_userId_challengeId_idx" ON "submission_analytics"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "submission_analytics_challengeId_completed_idx" ON "submission_analytics"("challengeId", "completed");

-- CreateIndex
CREATE INDEX "submission_analytics_contentMethod_completed_idx" ON "submission_analytics"("contentMethod", "completed");

-- CreateIndex
CREATE INDEX "content_modifications_submissionId_isApplied_idx" ON "content_modifications"("submissionId", "isApplied");

-- CreateIndex
CREATE INDEX "content_modifications_userId_createdAt_idx" ON "content_modifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "inspiration_links_sourceId_inspiredId_key" ON "inspiration_links"("sourceId", "inspiredId");

-- CreateIndex
CREATE UNIQUE INDEX "inspiration_metadata_submissionId_key" ON "inspiration_metadata"("submissionId");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_tutorial_progress" ADD CONSTRAINT "challenge_tutorial_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_tutorial_progress" ADD CONSTRAINT "challenge_tutorial_progress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_drafts" ADD CONSTRAINT "submission_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_drafts" ADD CONSTRAINT "submission_drafts_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_modifications" ADD CONSTRAINT "content_modifications_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_modifications" ADD CONSTRAINT "content_modifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_links" ADD CONSTRAINT "inspiration_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_links" ADD CONSTRAINT "inspiration_links_inspiredId_fkey" FOREIGN KEY ("inspiredId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_metadata" ADD CONSTRAINT "inspiration_metadata_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
