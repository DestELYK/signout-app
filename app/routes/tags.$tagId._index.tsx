import { Group, Space, Stack, Text } from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import StatView from "~/components/StatView";
import { loader } from "./tags.$tagId";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/tags.$tagId");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const category = data
        ? {
              name: data.tag?.category ?? "Unknown",
              count: data.categoryCount?.find((c) => c.category === data.tag?.category)?.count ?? 0,
          }
        : undefined;

    return (
        data &&
        data.tag && (
            <Stack h="100%">
                {category && (
                    <Text>
                        <b>Category: </b>
                        {category.name}
                        <Text
                            span
                            c="dimmed"
                            size="xs"
                            onClick={() =>
                                setSearchParams(
                                    (prev) => {
                                        prev.set("category", category.name);
                                        return prev;
                                    },
                                    { replace: true }
                                )
                            }
                            style={{ cursor: "pointer" }}
                        >
                            {` (${category.count} tags)`}
                        </Text>
                    </Text>
                )}
                <Text>
                    <b>Priority: </b>
                    {`${data.tag.priority}`}
                </Text>
                <Text>
                    <b>Hidden: </b>
                    {data.tag.hidden ? "Yes" : "No"}
                </Text>
                <Space mt="auto" />
                <Group>
                    {data.itemCount && data.itemCount > 0 && (
                        <StatView
                            label="Items"
                            value={data.itemCount}
                            onClick={() => navigate("/items")}
                        />
                    )}
                    {data.loanCount && data.loanCount > 0 && (
                        <StatView
                            label="Loans"
                            value={data.loanCount}
                            onClick={() => navigate("/loans")}
                        />
                    )}
                    {data.personCount && data.personCount > 0 && (
                        <StatView
                            label="People"
                            value={data.personCount}
                            onClick={() => navigate("/people")}
                        />
                    )}
                </Group>
            </Stack>
        )
    );
}
