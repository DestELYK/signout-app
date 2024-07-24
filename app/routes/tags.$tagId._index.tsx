import { useNavigate, useSearchParams } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "./tags.$tagId";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/tags.$tagId");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return data && data.tag && <p>Content</p>;
}
