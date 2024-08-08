import { Box, Card, Center, Divider, Group, Loader } from "@mantine/core";
import { PersonRole, Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { useDesktopOnly } from "~/lib/hooks";
import { OUT_COLOR } from "~/utils/consts";
import { LastLoanData } from "~/utils/types.server";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import StatView from "../StatView";
import LastLoanView from "../loans/LastLoanView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import PersonCard from "./PersonCard";

export interface PersonInfoViewProps {
    id: number;
    studentId?: string | null;
    firstName: string;
    lastName: string;
    role: PersonRole;
    nickname?: string | null;
    notes?: string | null;
    tags: Tag[];
    createdDate: Date;
    updatedDate: Date;
    loading?: boolean;
    lostItems: number;
    outstandingItems: number;
    loans: number;
    averageReturnTime?: number;
    lastLoan?: LastLoanData;
}

export default function PersonInfoView({
    id,
    firstName,
    lastName,
    nickname,
    role,
    studentId,
    notes,
    tags,
    createdDate,
    updatedDate,
    loans,
    outstandingItems,
    lostItems,
    averageReturnTime,
    lastLoan,
}: PersonInfoViewProps) {
    const desktopOnly = useDesktopOnly();
    const navigate = useNavigate();

    return desktopOnly === undefined ? (
        <Center w="100%" h="100%">
            <Loader />
        </Center>
    ) : (
        <>
            {desktopOnly ? (
                <>
                    <Box px="md">
                        <QRCodeWithComponent qrCode={studentId} scale={4}>
                            <StatView
                                label="Student ID"
                                value={studentId || "N/A"}
                                {...(studentId && {
                                    onClick: () => navigate(`/people/profile/${studentId}`),
                                })}
                            />
                        </QRCodeWithComponent>
                    </Box>
                    <Divider w="100%" />
                    {/* Outstanding Items */}
                    <Group align="stretch" grow>
                        {outstandingItems && (
                            <StatView
                                color={OUT_COLOR}
                                value={outstandingItems}
                                label="Outstanding Items"
                            />
                        )}

                        <StatView value={loans} label="Total Item Sign-Outs" />
                    </Group>

                    {(lostItems && lostItems > 0) ||
                    (averageReturnTime && Math.round(averageReturnTime) > 0) ? (
                        <Divider w="100%" />
                    ) : undefined}

                    {/* Average Return Time */}
                    <Group w="100%" align="stretch" grow>
                        {lostItems && lostItems > 0 && (
                            <StatView color="red" value={lostItems} label="Lost Items" />
                        )}
                        {averageReturnTime && Math.round(averageReturnTime) > 0 && (
                            <StatView
                                value={formatDuration(averageReturnTime)}
                                label="Average Return Time"
                            />
                        )}
                    </Group>

                    <Divider w="100%" />

                    {/* Created Date */}
                    <Group w="100%" align="stretch" grow>
                        <StatView
                            value={dateDiff({ date: createdDate, withoutSuffix: true })}
                            label="Since Creation"
                            caption={formatDate(createdDate)}
                        />

                        {/* Updated Date */}
                        <StatView
                            value={dateDiff({ date: updatedDate, withoutSuffix: true })}
                            label="Since Updated"
                            caption={formatDate(updatedDate)}
                        />
                    </Group>
                </>
            ) : (
                <>
                    <PersonCard
                        {...{ firstName, lastName, nickname, role, tags, notes, studentId }}
                        outstandingItems={outstandingItems}
                    />

                    <LastLoanView data={lastLoan} showPerson={false} showItems={false} />

                    {/* Outstanding Items */}
                    <Group align="stretch" grow>
                        {outstandingItems && (
                            <Card withBorder>
                                <StatView
                                    color={OUT_COLOR}
                                    value={outstandingItems}
                                    label="Outstanding Items"
                                />
                            </Card>
                        )}

                        <Card withBorder>
                            <StatView value={loans} label="Total Item Sign-Outs" />
                        </Card>
                    </Group>

                    {/* Average Return Time */}
                    <Group w="100%" align="stretch" grow>
                        {lostItems && lostItems > 0 && (
                            <Card withBorder>
                                <StatView color="red" value={lostItems} label="Lost Items" />
                            </Card>
                        )}
                        {averageReturnTime && Math.round(averageReturnTime) > 0 && (
                            <Card withBorder>
                                <StatView
                                    value={formatDuration(averageReturnTime)}
                                    label="Average Return Time"
                                />
                            </Card>
                        )}
                    </Group>

                    {/* Created Date */}
                    <Group w="100%" align="stretch" grow>
                        <Card withBorder>
                            <StatView
                                value={dateDiff({ date: createdDate, withoutSuffix: true })}
                                label="Since Creation"
                                caption={formatDate(createdDate)}
                            />
                        </Card>

                        {/* Updated Date */}
                        <Card withBorder>
                            <StatView
                                value={dateDiff({ date: updatedDate, withoutSuffix: true })}
                                label="Since Updated"
                                caption={formatDate(updatedDate)}
                            />
                        </Card>
                    </Group>
                </>
            )}
        </>
    );
}
