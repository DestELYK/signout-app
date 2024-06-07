import {
  Button,
  CloseButton,
  Flex,
  Loader,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import QrButton from "./qrCode/QrButton";

export interface SearchViewProps {
  placeholder?: string;
  loading?: boolean;
  onChanged: (query: string, qrCode: string) => void;
}

export default function SearchView({
  placeholder,
  loading,
  onChanged,
}: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    onChanged(query, qrCode);
  }, [query, qrCode]);

  function updateSearch({ query, qrCode }: { query: string; qrCode: string }) {
    setQuery(query);
    setQrCode(qrCode);
  }

  return (
    <Flex
      w="100%"
      direction="column"
      align="center"
      wrap="nowrap"
      gap="sm"
      p="sm"
    >
      <Flex w="100%" direction="row" align="center" gap="xs">
        <TextInput
          data-autofocus
          radius="lg"
          w="100%"
          leftSection={<IconSearch />}
          rightSection={
            loading ? (
              <Loader size="xs" />
            ) : (
              <CloseButton onClick={() => onChanged("", "")} />
            )
          }
          placeholder={placeholder}
          value={query}
          onChange={(event) =>
            updateSearch({ query: event.currentTarget.value, qrCode: "" })
          }
        />
        <QrButton
          onResult={(result) =>
            updateSearch({ query: "", qrCode: result.data })
          }
        />
      </Flex>
      {qrCode.length !== 0 && (
        <Flex w="100%" direction="row" align="center" justify="center">
          <Text size="xs" ta="center">
            QRCode: {qrCode}
          </Text>
          <Button
            variant="subtle"
            onClick={() => updateSearch({ query: "", qrCode: "" })}
          >
            Clear
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
