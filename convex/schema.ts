import { defineSchema, defineTable } from "convex/server";
import { v, type Infer } from "convex/values";

export const hajzleTable = defineTable({
    name: v.string(),
    description: v.string(),
    lat: v.number(),
    lng: v.number(),
    hidden: v.boolean(),
    type: v.optional(v.union(v.literal("code"), v.literal("free"), v.literal("paid"))),
    price: v.optional(v.string()),
    createdAt: v.number(),
    downvotes: v.optional(v.number()),
    upvotes: v.optional(v.number()),
});

export type hajzleType = Infer<typeof hajzleTable.validator>  ;

export const accessCodesTable = defineTable({
    restroomId: v.id("hajzle"),
    code: v.string(),
    upvotes: v.number(),
    downvotes: v.number(),
    createdAt: v.number(),
})

export const votesTable = defineTable({
    userId: v.string(),
    accessCodeId: v.id("accessCodes"),
    isUpvote: v.boolean(),
    createdAt: v.number(),

});

export const reportsTable = defineTable({
    userId: v.string(),
    restroomId: v.id("hajzle"),
    reason: v.optional(v.string()),
    createdAt: v.number(),
})

export const restroomVotesTable = defineTable({
    userId: v.string(),
    restroomId: v.id("hajzle"),
    isUpvote: v.boolean(),
    createdAt: v.number(),
})

export type accessCodeType = Infer<typeof hajzleTable.validator> & { _id: string };

const applicationTables = {
    hajzle: hajzleTable.index("by_location", ["lat", "lng"]),
    restroomVotes: restroomVotesTable
        .index("by_restroom", ["restroomId"])
        .index("by_user_and_restroom", ["userId", "restroomId"]),

    accessCodes: accessCodesTable
        .index("by_restroom", ["restroomId"])
        .index("by_restroom_and_votes", ["restroomId", "upvotes"]),

    votes: votesTable
        .index("by_user_and_code", ["userId", "accessCodeId"]),

    reports: reportsTable
        .index("by_restroom", ["restroomId"])
        .index("by_user_and_restroom", ["userId", "restroomId"]),


};

export default defineSchema({
    ...applicationTables,
});