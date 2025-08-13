import {
    ActionIcon,
    Box,
    Button,
    Divider,
    Group,
    Paper,
    Stack,
    Stepper,
    Text,
    Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { LoanFormSchema, LoanFormType } from "~/lib/schemas";
import { DataReturn, ItemData, LoanData, PersonData, TagData } from "~/utils/types.server";
import { formatDate, formatFullName } from "~/utils/utils";
import ItemPicker from "../items/ItemPicker";
import PersonPicker from "../people/PersonPicker";
import TagCombobox from "../tags/TagCombobox";

export type CreateLoanFormProps = {
    onSubmit?: (values: LoanFormType) => void;
    onResult?: (data: UseDataFunctionReturn<DataReturn<LoanData>>) => void;
};

export default function CreateLoanForm({ onSubmit, onResult }: CreateLoanFormProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [highestStepVisted, setHighestStepVisted] = useState(0);

    const [person, setPerson] = useState<PersonData | undefined>(undefined);
    const [items, setItems] = useState<ItemData[]>([]);
    const [createdDate, setCreatedDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState<TagData[]>([]);

    const notificationId = "create-loan";

    const fetcher = useFetcherWithErrorHandler<DataReturn<LoanData>>(
        (data) => {
            if (data) {
                notifications.update({
                    id: notificationId,
                    message: `Created loan successfully`,
                    loading: false,
                    autoClose: 5000,
                    withCloseButton: true,
                });

                // Reset form values
                form.reset();
                setPerson(undefined);
                setItems([]);
                setCreatedDate(new Date());
                setNotes("");
                setTags([]);

                handleStepChange(5);
                onResult?.(data);
            }
        },
        (error) => {
            notifications.update({
                id: notificationId,
                message: `Failed to create loan`,
                color: "red",
                loading: false,
                autoClose: 5000,
                withCloseButton: true,
            });

            handleStepChange(3);
        }
    );

    const form = useForm<Partial<LoanFormType>>({
        initialValues: {
            person: undefined,
            items: [],
            notes: "",
            tags: [],
            createdDate: undefined,
        },
        validate: zodResolver(LoanFormSchema),
    });

    const handleStepChange = (nextStep: number) => {
        if (nextStep >= activeStep && !validateStep(activeStep)) {
            return;
        }

        const outOfRange = nextStep < 0 || nextStep > 5;

        if (outOfRange) {
            return;
        }

        setActiveStep(nextStep);
        setHighestStepVisted(Math.max(nextStep, highestStepVisted));

        if (nextStep === 4) {
            onSubmit?.(form.values as LoanFormType);

            notifications.show({
                id: notificationId,
                message: "Creating loan...",
                loading: true,
                autoClose: false,
                withCloseButton: true,
            });

            fetcher.submit(JSON.stringify(form.values), {
                method: "POST",
                action: "/loans",
                encType: "application/json",
            });
        }
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 0:
                return !form.validateField("person").hasError;
            case 1:
                return !form.validateField("items").hasError;
            case 2:
                return (
                    !form.validateField("createdDate").hasError &&
                    !form.validateField("notes").hasError &&
                    !form.validateField("tagIds").hasError
                );
            case 3:
                return !form.validate().hasErrors;
            default:
                return true;
        }
    };

    const shouldAllowSelectStep = (step: number) =>
        highestStepVisted !== 4 && highestStepVisted >= step && activeStep !== step;

    const stepLabel = (step: number) => {
        switch (step) {
            case 0:
                return "Select Person";
            case 1:
                return "Select Items";
            case 2:
                return "Additional Details";
            case 3:
                return "Review";
            case 4:
                return "Submit";
            default:
                return undefined;
        }
    };

    const isButtonDisabled = (step: number) => {
        switch (step) {
            case 0:
                return !form.isValid("person");
            case 1:
                return !form.isValid("items");
            case 2:
                return (
                    !form.isValid("createdDate") ||
                    !form.isValid("notes") ||
                    !form.isValid("tagIds")
                );
            case 3:
                return !form.isValid();
            default:
                return false;
        }
    };

    return (
        <form style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Stepper size="sm" active={activeStep} onStepClick={handleStepChange}>
                <Stepper.Step
                    miw={200}
                    label={stepLabel(0)}
                    description="Select the person who is borrowing the item"
                    allowStepSelect={shouldAllowSelectStep(0)}
                >
                    <Box h="100%">
                        <PersonPicker
                            promptOutstanding
                            value={person}
                            error={form.errors.personId}
                            onChange={(person) => {
                                setPerson(person);
                                form.setFieldValue("person", { id: person?.id ?? -1 });
                            }}
                        />
                    </Box>
                </Stepper.Step>
                <Stepper.Step
                    miw={200}
                    label={stepLabel(1)}
                    description="Select the item(s) that is being borrowed"
                    allowStepSelect={shouldAllowSelectStep(1)}
                >
                    <ItemPicker
                        items={items}
                        error={form.errors.itemIds}
                        availableOnly
                        onAddItem={(item) => {
                            setItems([...items, item]);
                            form.setFieldValue(
                                "items",
                                [...items, item].map((i) => ({
                                    loanId: 0,
                                    itemId: i.id,
                                    status: "loaned",
                                    dateLoaned: new Date(),
                                }))
                            );
                        }}
                        onRemoveItem={(item) => {
                            setItems(items.filter((i) => i.id !== item.id));
                            form.setFieldValue(
                                "itemIds",
                                items.filter((i) => i.id !== item.id).map((i) => i.id)
                            );
                        }}
                    />
                </Stepper.Step>
                <Stepper.Step
                    miw={200}
                    label={stepLabel(2)}
                    description="Add any additional details about the loan"
                    allowStepSelect={shouldAllowSelectStep(2)}
                >
                    <Stack>
                        <DateTimePicker
                            label="Date Loaned"
                            description="Sets the loan date (defaults to current time)"
                            highlightToday
                            valueFormat="MMMM DD, YYYY h:mm A"
                            maxDate={new Date()}
                            {...form.getInputProps("createdDate")}
                            value={createdDate}
                            onChange={(value) => {
                                if (value) {
                                    form.setFieldValue("createdDate", value);

                                    if (!form.validateField("createdDate").hasError) {
                                        setCreatedDate(value);
                                    } else {
                                        form.setFieldValue("createdDate", new Date());
                                    }
                                }
                            }}
                        />
                        <Textarea
                            label="Notes"
                            description="Additional notes about the loan"
                            {...form.getInputProps("notes")}
                            value={notes}
                            onChange={(event) => {
                                setNotes(event.currentTarget.value);
                                form.setFieldValue("notes", event.currentTarget.value);
                            }}
                        />
                        <TagCombobox
                            value={tags}
                            category=""
                            lockCategory={false}
                            error={form.errors.tagIds as string}
                            onTagsChange={(tags) => {
                                setTags(tags);
                                form.setFieldValue("tags", tags);
                            }}
                        />
                    </Stack>
                </Stepper.Step>
                <Stepper.Step
                    miw={100}
                    label={stepLabel(3)}
                    description="Review the loan details before submitting"
                    allowStepSelect={shouldAllowSelectStep(3)}
                >
                    <Paper withBorder p="md">
                        <Stack>
                            <Text>
                                <b>Person:</b> {person ? formatFullName(person) : "None"}
                            </Text>
                            <Text>
                                <b>Items:</b>{" "}
                                {items.length > 0 ? items.map((i) => i.name).join(", ") : "None"}
                            </Text>
                            <Text>
                                <b>Date Loaned:</b> {formatDate(createdDate)}
                            </Text>
                            <Text>
                                <b>Notes:</b> {notes.length > 0 ? notes : "None"}
                            </Text>
                            <Text>
                                <b>Tags:</b>{" "}
                                {tags.length > 0 ? tags.map((t) => t.name).join(", ") : "None"}
                            </Text>
                        </Stack>
                    </Paper>
                </Stepper.Step>
                <Stepper.Step
                    miw={100}
                    label={stepLabel(4)}
                    allowStepSelect={false}
                    loading={fetcher.state !== "idle"}
                >
                    <Text>Submitting...</Text>
                </Stepper.Step>
                <Stepper.Completed>Completed</Stepper.Completed>
            </Stepper>
            <Divider hidden={activeStep > 3} mt="sm" w="100%" />
            <Group mt="sm" justify="right">
                <ActionIcon
                    size="input-sm"
                    hidden={activeStep >= 4 || activeStep === 0}
                    variant="outline"
                    color="red"
                    onClick={() => handleStepChange(activeStep - 1)}
                >
                    <IconArrowLeft />
                </ActionIcon>
                <Button
                    onClick={() => handleStepChange(activeStep + 1)}
                    disabled={isButtonDisabled(activeStep)}
                    hidden={activeStep > 3}
                    rightSection={<IconArrowRight />}
                >
                    Next
                </Button>
            </Group>
        </form>
    );
}
