import { prisma } from "../../src/database.js"
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

        await recommendationService.insert(recommendation).catch((err) => {
            expect(err.message).toEqual("Recommendations names must be unique")
        })
    })
})

describe("upvote", () => {
    it("should increase recommendation score when given valid id", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return true
            }
        )

        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockImplementationOnce((): any => {
            return {}
        })

        const result = await recommendationService.upvote(1)
        expect(result).toBeUndefined()
    })

    it("should throw error when given id is invalid", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return false
            }
        )
        await recommendationService.upvote(1).catch((err) => {
            expect(err.type).toEqual("not_found")
        })
    })
})

describe("downvote", () => {
    it("should decrease recommendation score when given valid id", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return true
            }
        )

        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockImplementationOnce((): any => {
            return {}
        })

        const result = await recommendationService.downvote(1)
        expect(result).toBeUndefined()
    })

    it("should delete recommendation if score falls below 5", async () => {
        const recommendation = servicesFactory.recommendationTemplate()

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return true
            }
        )

        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockImplementationOnce((): any => {
            return {
                id: 1,
                name: recommendation.name,
                youtubeLink: recommendation.youtubeLink,
                score: -6,
            }
        })

        jest.spyOn(recommendationRepository, "remove").mockImplementationOnce(
            (): any => {
                return {}
            }
        )

        const result = await recommendationService.downvote(1)
        expect(result).toBeUndefined()
    })

    it("should throw error when given id is invalid", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return false
            }
        )
        await recommendationService.upvote(1).catch((err) => {
            expect(err.type).toEqual("not_found")
        })
    })
})
