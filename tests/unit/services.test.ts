import supertest from "supertest"

import { prisma } from "../../src/database.js"
import app from "../../src/app.js"
import { recommendationService } from "../../src/services/recommendationsService.js"
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js"
import { servicesFactory } from "../factories/servicesFactory.js"

// describe("POST /something", () => {
//     it("should answer something when something happens", async () => {})
// })

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
})

describe("insert", () => {
    it("should create new recommendation when information isn't conflicting", async () => {
        const recommendation = servicesFactory.recommendationTemplate()
        jest.spyOn(
            recommendationRepository,
            "findByName"
        ).mockImplementationOnce((): any => {
            return false
        })

        jest.spyOn(recommendationRepository, "create").mockImplementationOnce(
            (): any => {
                return {}
            }
        )

        const result = await recommendationService.insert(recommendation)
        expect(result).toBeUndefined()
    })

    it("should throw error when recommendation conflicts with existing information", async () => {
        const recommendation = servicesFactory.recommendationTemplate()
        jest.spyOn(
            recommendationRepository,
            "findByName"
        ).mockImplementationOnce((): any => {
            return true
        })

        const result = await recommendationService
            .insert(recommendation)
            .catch((err) => {
                expect(err.message).toEqual(
                    "Recommendations names must be unique"
                )
            })
    })
})
