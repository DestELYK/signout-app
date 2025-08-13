import { Center, Loader } from "@mantine/core";

import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = ({}: LoaderFunctionArgs) => {
    return {
        src: "https://docs.google.com/forms/d/e/1FAIpQLSdlh_Jkl2na-ZYe0uSICr4klv3rTM4OhrX-TK59AzTiCi_E2w/viewform?embedded=true",
    };
};

export default function Page() {
    const data = useLoaderData<typeof loader>();

    return (
        <Center w="100%" h="100%">
            <iframe src={data.src} width="100%" height="100%" style={{ border: "none" }}>
                <Center w="100%" h="100%">
                    <Loader />
                </Center>
            </iframe>
        </Center>
    );
}
