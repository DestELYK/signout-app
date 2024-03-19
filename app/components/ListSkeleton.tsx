import { Skeleton, Stack } from "@mantine/core";

export default function ListSkeleton({itemCount, height}: {itemCount: number, height: string | number}) {
    let children = []
    
    for (let i = 0; i < itemCount; i++) {
        children.push(<Skeleton h={height}/>)
    }

    return (
        <Stack h="100%" justify="stretch">
            {children}
        </Stack>
    )
} 