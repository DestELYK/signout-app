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
              count: data.categoryCount,
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
                    {data.tag._count.items > 0 && (
                        <StatView
                            label="Items"
                            value={data.tag._count.items}
                            onClick={() => navigate("/items")}
                        />
                    )}
                    {data.tag._count.loans > 0 && (
                        <StatView
                            label="Loans"
                            value={data.tag._count.loans}
                            onClick={() => navigate("/loans")}
                        />
                    )}
                    {data.tag._count.people > 0 && (
                        <StatView
                            label="People"
                            value={data.tag._count.people}
                            onClick={() => navigate("/people")}
                        />
                    )}
                </Group>
            </Stack>
        )
    );
}
