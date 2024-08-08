import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = ({ params }: LoaderFunctionArgs) => {
    if (params.id) {
        return redirect(process.env.SJK_PROFILE_URL + params.id);
    }
    return redirect("/");
};
