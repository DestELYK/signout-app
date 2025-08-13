import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = ({ params }: LoaderFunctionArgs) => {
    if (params.id) {
        return redirect(process.env.PROFILE_URL + params.id);
    }

    throw new Response(null, { status: 404 });
};
