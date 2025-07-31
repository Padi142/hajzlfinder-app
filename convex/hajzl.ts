import { query } from "./_generated/server";

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