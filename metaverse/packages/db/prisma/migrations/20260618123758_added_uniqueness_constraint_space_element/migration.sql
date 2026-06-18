/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,x,y]` on the table `spaceElements` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "spaceElements_spaceId_x_y_key" ON "spaceElements"("spaceId", "x", "y");
