import { Badge, MantineSpacing, MantineStyleProps, StyleProp, Text } from "@mantine/core";
import { PersonRole, Tag } from "@prisma/client";
import { formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import EditableNotes from "../EditableNotes";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface PersonCardProps {
    w?: MantineStyleProps["w"];
    h?: MantineStyleProps["h"];
    id?: number;
    studentId?: string | null;
    qrScale?: number;
    firstName: string;
    lastName: string;
    nickname?: string | null;
    role: PersonRole;
    tags: Tag[];
    notes?: string | null;
    outstandingItems?: number;
    rightSection?: React.ReactNode;
    withBorder?: boolean;
    withDetails?: boolean;
    p?: StyleProp<MantineSpacing>;
}

export default function PersonCard({
    w,
    h,
    id,
    studentId,
    qrScale,
    firstName,
    lastName,
    nickname,
    role,
    tags,
    notes,
    outstandingItems,
    rightSection,
    withBorder = true,
    withDetails = true,
    p,
}: PersonCardProps) {
    return (
        <InfoView
            title={formatFullName({ firstName, lastName, nickname })}
            {...(id && { href: `/people/${id}` })}
            rightSection={
                <>
                    <Badge color={role.color} variant="outline" autoContrast>
                        {role.name}
                    </Badge>

                    {rightSection}
                </>
            }
            bottomSection={
                tags.length > 0 && (
                    <TagGroup
                        tags={tags}
                        categories={["Location"]}
                        groupProps={{ justify: "end" }}
                        blacklist
                    />
                )
            }
            cardProps={{
                w: w,
                h: h,
                ...(p !== undefined && { p: p }),
                style: { overflow: "visible" },
            }}
        >
            {outstandingItems !== undefined && (
                <Text fw="bold" mb="sm" size="sm">
                    Current Status:{" "}
                    <Text span c={outstandingItems > 0 ? "red" : "green"}>
                        {outstandingItems > 0 ? "Outstanding Items" : "All Items Returned"}
                    </Text>
                </Text>
            )}
            {withDetails && (
                <QRCodeWithComponent qrCode={studentId} scale={qrScale || 2.5}>
                    <EditableNotes value={notes} />
                </QRCodeWithComponent>
            )}
        </InfoView>
    );
}
