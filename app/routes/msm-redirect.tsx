import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = ({}: LoaderFunctionArgs) => {
  return Response.redirect(process.env.MSM_URL || "/screens", 302);
};
