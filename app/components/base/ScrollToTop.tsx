/**
 * ScrollToTop Component
 *
 * A floating action button that appears when the user scrolls down
 * and allows them to quickly return to the top of the page.
 *
 * @module ScrollToTop
 */

import { ActionIcon, Affix, Transition, rem } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { IconArrowUp } from "@tabler/icons-react";

interface ScrollToTopProps {
  /** The scroll position threshold at which the button appears */
  threshold?: number;
}

/**
 * ScrollToTop component that shows a floating back-to-top button
 * when the user has scrolled past a certain threshold
 */
export default function ScrollToTop({ threshold = 300 }: ScrollToTopProps) {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Affix position={{ bottom: rem(50), right: rem(24) }}>
      <Transition transition="slide-up" mounted={scroll.y > threshold}>
        {(transitionStyles) => (
          <ActionIcon
            size="xl"
            variant="filled"
            color="blue"
            onClick={() => scrollTo({ y: 0 })}
            style={transitionStyles}
            aria-label="Scroll to top"
          >
            <IconArrowUp style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
}
