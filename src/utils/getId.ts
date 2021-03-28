import CustomContext from "../Models/CustomContext";
export default function getId(ctx: CustomContext): number {
    if (ctx.message) {
        return ctx.message!.from.id
    } else {
        if ("callback_query" in ctx.update) {
            return ctx.update.callback_query.from.id
        }
    }

    throw new Error("Can't find user id in context");
}
