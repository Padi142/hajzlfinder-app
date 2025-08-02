import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const restrooms = await ctx.db
            .query("hajzle")
            .filter((q) => q.eq(q.field("hidden"), false))
            .collect();

        return restrooms;
    },
});

export const getRestroom = query({
    args: {
        id: v.id("hajzle"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getAccessCodes = query({
    args: {
        restroomId: v.id("hajzle"),
    },
    handler: async (ctx, args) => {
        const codes = await ctx.db
            .query("accessCodes")
            .withIndex("by_restroom_and_votes", (q) =>
                q.eq("restroomId", args.restroomId))
            .order("desc")
            .collect();

        return codes;
    },
});

export const vote = mutation({
    args: {
        accessCodeId: v.id("accessCodes"),
        isUpvote: v.boolean(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {


        // Get the access code
        const accessCode = await ctx.db.get(args.accessCodeId);
        if (!accessCode) throw new Error("Access code not found");

        // Check if the user has already voted
        const existingVote = await ctx.db
            .query("votes")
            .withIndex("by_user_and_code", (q) =>
                q.eq("userId", args.userId).eq("accessCodeId", args.accessCodeId)
            )
            .unique();


        if (existingVote) {
            const updates = {
                upvotes: accessCode.upvotes,
                downvotes: accessCode.downvotes,
            };
            if (existingVote.isUpvote) updates.upvotes--;
            else updates.downvotes--;

            if (args.isUpvote) updates.upvotes++;
            else updates.downvotes++;

            await ctx.db.patch(existingVote._id, { isUpvote: args.isUpvote });
            await ctx.db.patch(args.accessCodeId, updates);
        } else {
            await ctx.db.insert("votes", {
                userId: args.userId,
                accessCodeId: args.accessCodeId,
                isUpvote: args.isUpvote,
                createdAt: Date.now(),
            });

            const updates = {
                upvotes: accessCode.upvotes,
                downvotes: accessCode.downvotes,
            };
            if (args.isUpvote) updates.upvotes++;
            else updates.downvotes++;

            await ctx.db.patch(args.accessCodeId, updates);
        }

    },
});

export const voteRestroom = mutation({
    args: {
        restroomId: v.id("hajzle"),
        isUpvote: v.boolean(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const restroom = await ctx.db.get(args.restroomId);
        if (!restroom) throw new Error("Restroom not found");

        const existingVote = await ctx.db
            .query("restroomVotes")
            .withIndex("by_user_and_restroom", (q) =>
                q.eq("userId", args.userId).eq("restroomId", args.restroomId))
            .unique();

        if (existingVote) {
            const updates = {
                upvotes: restroom.upvotes ?? 0,
                downvotes: restroom.downvotes ?? 0,
            };
            if (existingVote.isUpvote) updates.upvotes--;
            else updates.downvotes--;

            if (args.isUpvote) updates.upvotes++;
            else updates.downvotes++;

            await ctx.db.patch(existingVote._id, { isUpvote: args.isUpvote });
            await ctx.db.patch(args.restroomId, updates);
        } else {
            await ctx.db.insert("restroomVotes", {
                userId: args.userId,
                restroomId: args.restroomId,
                isUpvote: args.isUpvote,
                createdAt: Date.now(),
            });

            const updates = {
                upvotes: (restroom.upvotes ?? 0) + (args.isUpvote ? 1 : 0),
                downvotes: (restroom.downvotes ?? 0) + (args.isUpvote ? 0 : 1),
            };

            await ctx.db.patch(args.restroomId, updates);
        }
    },
});

