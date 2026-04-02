ALTER TABLE "AgentApiKey"
ADD COLUMN "canRead" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "canWrite" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "agentResourcesOnly" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Gallery"
ADD COLUMN "createdByAgentApiKeyId" TEXT;

ALTER TABLE "Image"
ADD COLUMN "createdByAgentApiKeyId" TEXT;

ALTER TABLE "SharedResource"
ADD COLUMN "createdByAgentApiKeyId" TEXT;

CREATE INDEX "Gallery_createdByAgentApiKeyId_idx" ON "Gallery"("createdByAgentApiKeyId");
CREATE INDEX "Image_createdByAgentApiKeyId_idx" ON "Image"("createdByAgentApiKeyId");
CREATE INDEX "SharedResource_createdByAgentApiKeyId_idx" ON "SharedResource"("createdByAgentApiKeyId");

ALTER TABLE "Gallery"
ADD CONSTRAINT "Gallery_createdByAgentApiKeyId_fkey"
FOREIGN KEY ("createdByAgentApiKeyId") REFERENCES "AgentApiKey"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Image"
ADD CONSTRAINT "Image_createdByAgentApiKeyId_fkey"
FOREIGN KEY ("createdByAgentApiKeyId") REFERENCES "AgentApiKey"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "SharedResource"
ADD CONSTRAINT "SharedResource_createdByAgentApiKeyId_fkey"
FOREIGN KEY ("createdByAgentApiKeyId") REFERENCES "AgentApiKey"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
