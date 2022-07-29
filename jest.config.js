/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./jest.setup.js"],
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        ".+.ts$": "ts-jest",
    },
}
