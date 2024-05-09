import { MantineSpacing, Skeleton, Stack } from "@mantine/core";

export default function ListSkeleton({
  itemCount,
  height,
  gap = "md",
}: {
  itemCount: number;
  height: string | number;
  gap?: MantineSpacing;
}) {
  const children = [];

  for (let i = 0; i < itemCount; i++) {
    children.push(<Skeleton key={i} h={height} />);
  }

  return (
    <Stack h="100%" justify="stretch" m="sm" gap={gap}>
      {children}
    </Stack>
  );
}
